import sys
from xmlrpc.client import SYSTEM_ERROR
from nats.aio.client import Client as NATS
import json
import asyncio
from datetime import date, datetime, timezone
import logging
import yaml
from logging.handlers import RotatingFileHandler
from enum import Enum
import os
import time
from multiprocessing import Lock
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler, LoggingEventHandler
import xmltodict
import pandas as pd
from multiprocessing import Queue
from queue import Empty

#global variable for current list of topics subscribed to
subscriber_list = []
message_queue = Queue()

class EventKeys(Enum):
    EVENT_NAME = "event_name"
    TESTING_TYPE = "testing_type"
    LOCATION = "location"

class UnitKeys(Enum):
    UNIT_ID = "unit_id"
    UNIT_TYPE = "unit_type"
    UNIT_NAME = "unit_name"

class TopicKeys(Enum):
    TOPIC_NAME = "topic_name"
    MSG_TYPE = "msg_type"

class LogType(Enum):
    FILE = "file"
    CONSOLE = "console"
    ALL = "all"

class FileListener(FileSystemEventHandler):
    """
    The FileListener class is used to listen to the carma cloud log file for new TCR/TCM messages.
    """
    def __init__(self, cc_logpath, bridge_logname, tcr_search_string, tcm_search_string):
        self.lock = Lock()
        self.logger = logging.getLogger(bridge_logname)
        self.tcr_search_string = tcr_search_string
        self.tcm_search_string = tcm_search_string
        self.cc_log_path = cc_logpath
        self.today = date.today()

        #Need to get current number of lines in file for future comparison
        with open(f'{self.cc_log_path}', 'r', encoding="utf-8") as f:
            self.current_lines = len(f.readlines())
        f.close()

        self.logger.info("FileListener created for: " + str(self.cc_log_path))
    def findNewCarmaCloudMessage(self):
        """This method will parse the newly generated line in the carma cloud log file and assign
        the xml and message type to the appropriate global variables. It also assigns the epoch_time
        variable which will be used to create a bridge timestamp that will be added to the message sent
        to nats """

        with open(f'{self.cc_log_path}', 'r', encoding="utf-8") as f:
            line_count = 1
            for line in f:
                if line_count > self.current_lines:
                    newLine = line

                    #convert carma cloud timestamp and current date to time since epoch
                    if newLine.split(" ").__len__() < 2:
                        continue
                    timestamp = newLine.split(" ")[1]
                    date = self.today.strftime("%m/%d/%y")
                    dt = date + " " + timestamp
                    dt_converted = pd.to_datetime(dt)
                    epoch_time = dt_converted.timestamp() * 1000000 #convert to microseconds

                    topic = ""
                    #find beginning of TCR/TCM and send to NATS if the topic is in the subscriber list
                    if self.tcm_search_string in newLine and "TCM" in subscriber_list:
                        topic = "TCM"
                        startingIndex = newLine.find("<")
                        new_carma_cloud_message = newLine[startingIndex:]
                        self.logger.info("Carma Cloud generated new " + str(topic) + " message with payload: " + str(new_carma_cloud_message))

                        message_queue.put([topic, new_carma_cloud_message, epoch_time])
                        self.logger.info("Current queue size: " + str(message_queue.qsize()))

                    elif self.tcr_search_string in newLine and "TCR" in subscriber_list:
                        topic = "TCR"
                        startingIndex = newLine.find("<")
                        new_carma_cloud_message = newLine[startingIndex:]
                        self.logger.info("Carma Cloud generated new " + str(topic) + " message with payload: " + str(new_carma_cloud_message))

                        message_queue.put([topic, new_carma_cloud_message, epoch_time])
                        self.logger.info("Current queue size: " + str(message_queue.qsize()))

                    self.current_lines = line_count

                line_count += 1

    def on_modified(self, event):
        """this method gets called when the log file is modified"""

        #check if the modified file event is the file we are interested in
        if event.src_path == self.cc_log_path:
            #Get the newly printed line and parse out the TCR/TCM
            with self.lock:
                self.findNewCarmaCloudMessage()

class CloudNatsBridge():
    """
    The CloudNatsBridge is capable of listening to the carma cloud log file and streaming
    the data in real-time to a remote NATS server. Various asynchronous functions are defined to
    enable connecting to the NATS server, publishing available topics, and streaming data of interest.
    """

    # Creates a Streets-NATS bridge object that connects to the NATS server
    def __init__(self):

        # Retrieve config values from environment variables
        self.nats_ip_port = os.getenv("NATS_SERVER_IP_PORT")
        self.unit_id = os.getenv('CARMA_CLOUD_BRIDGE_UNIT_ID')
        self.unit_type = os.getenv('CARMA_CLOUD_BRIDGE_UNIT_TYPE')
        self.carma_cloud_log = os.getenv('CARMA_CLOUD_LOG')
        self.log_level = os.getenv('CARMA_CLOUD_BRIDGE_LOG_LEVEL')
        self.log_name = os.getenv('CARMA_CLOUD_BRIDGE_LOG_NAME')
        self.log_path = os.getenv('CARMA_CLOUD_BRIDGE_LOG_PATH')
        self.log_rotation = int(os.getenv('CARMA_CLOUD_BRIDGE_LOG_ROTATION_SIZE_BYTES'))
        self.log_handler_type = os.getenv('CARMA_CLOUD_BRIDGE_LOG_HANDLER')
        self.tcr_search_string = os.getenv('CARMA_CLOUD_BRIDGE_TCR_STRING')
        self.tcm_search_string = os.getenv('CARMA_CLOUD_BRIDGE_TCM_STRING')
        #Get the topics that should be excluded
        self.excludedTopics = os.getenv("CLOUD_BRIDGE_EXCLUSION_LIST")

        self.unit_name = "Dev CC"
        self.nc = NATS()
        self.cloud_topics = ["TCR","TCM"]  # list of available carma-cloud topics
        self.async_sleep_rate = 0.00001  # asyncio sleep rate
        self.registered = False
        #Member variables to store the exclusion list
        self.exclusion_list = []

        self.cloud_info = {
            UnitKeys.UNIT_ID.value: self.unit_id,
            UnitKeys.UNIT_TYPE.value: self.unit_type,
            UnitKeys.UNIT_NAME.value: self.unit_name}

        # Create CloudNatsBridge logger
        if self.log_handler_type == LogType.ALL.value:
            # If both create log handler for both file and console
            self.createLogger(LogType.FILE.value)
            self.createLogger(LogType.CONSOLE.value)
        elif self.log_handler_type == LogType.FILE.value or self.log_handler_type == LogType.CONSOLE.value:
            self.createLogger(self.log_handler_type)
        else:
            self.createLogger(LogType.CONSOLE.value)
            self.logger.warn("Incorrect Log type defined, defaulting to console")

        #Add excluded topics to class member variables
        if self.excludedTopics != "":
            for excluded in self.excludedTopics.split(","):
                self.exclusion_list.append(excluded.strip())
        self.logger.info("Exclusion list: " + str(self.exclusion_list))

        self.file_listener_start()
        self.logger.info(" Created Cloud-NATS bridge object")


    def createLogger(self, log_type):
        """Creates log file for the Carma cloud bridge with configuration items based on the settings input in the params.yaml file"""
        # create log file and set log levels
        self.logger = logging.getLogger(self.log_name)
        now = datetime.now()
        dt_string = now.strftime("_%m_%d_%Y_%H_%M_%S")
        log_name = self.log_name + dt_string + ".log"
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s')

        # Create a rotating log handler that will rotate after maxBytes rotation, that can be configured in the
        # params yaml file. The backup count is how many rotating logs will be created after reaching the maxBytes size
        if log_type == LogType.FILE.value:
            self.log_handler = RotatingFileHandler(
                self.log_path+log_name, maxBytes=self.log_rotation, backupCount=5)
        else:
             self.log_handler = logging.StreamHandler()
        self.log_handler.setFormatter(formatter)

        if(self.log_level == "debug"):
            self.logger.setLevel(logging.DEBUG)
            self.log_handler.setLevel(logging.DEBUG)
        elif(self.log_level == "info"):
            self.logger.setLevel(logging.INFO)
            self.log_handler.setLevel(logging.INFO)
        elif(self.log_level == "error"):
            self.logger.setLevel(logging.ERROR)
            self.log_handler.setLevel(logging.ERROR)

        self.logger.addHandler(self.log_handler)

    def file_listener_start(self):
        """
            Creates a FileListener object and monitors the carma cloud log assigned in the params yaml file.
        """
        self.logger.info(" Creating file listener for " + str(self.carma_cloud_log) + " with topics: " + str(subscriber_list))
        splitter = self.carma_cloud_log.split("/")
        directory = "/" + splitter[1] + "/" + splitter[2] + "/" + splitter[3]

        event_handler = FileListener(self.carma_cloud_log, self.log_name, self.tcr_search_string, self.tcm_search_string)
        observer = Observer()
        observer.schedule(event_handler, directory, recursive=True)
        observer.start()

    def xmlToJson(self, xmlString):
        """
            Convert the TCR/TCM xml to dictionary, then to json. If xml is invalid, return empty string.
        """
        json_data = ""
        try:
            data_dict = xmltodict.parse(xmlString)
            json_data = json.dumps(data_dict)
        except:
            self.logger.info("Error converting xml to json for: " + str(xmlString))

        return json_data

    async def queue_send(self):
        self.logger.info("In queue send")

    async def queue_send(self):
        self.logger.info("In queue send")

        while(True):
            #Try to get a message from the queue, sleep if the queue is empty
            try:
                cc_message = message_queue.get(block=False)
                topic = cc_message[0]
                payload = cc_message[1]
                log_timestamp = cc_message[2]
                json_data = self.xmlToJson(payload)

                 #add required metadata to TCR/TCM payload
                message = {}
                message["payload"] = json.loads(json_data)
                message[UnitKeys.UNIT_ID.value] = self.unit_id
                message[UnitKeys.UNIT_TYPE.value] = self.unit_type
                message[UnitKeys.UNIT_NAME.value] = self.unit_name
                message[TopicKeys.MSG_TYPE.value] = topic
                message[EventKeys.EVENT_NAME.value] = self.cloud_info[EventKeys.EVENT_NAME.value]
                message[EventKeys.TESTING_TYPE.value] = self.cloud_info[EventKeys.TESTING_TYPE.value]
                message[EventKeys.LOCATION.value] = self.cloud_info[EventKeys.LOCATION.value]
                message[TopicKeys.TOPIC_NAME.value] = topic
                message["timestamp"] = datetime.now(timezone.utc).timestamp()*1000000  # utc timestamp in microseconds
                message["log_timestamp"] = log_timestamp

                # telematic cloud server will look for topic names with the pattern ".data."
                self.topic_name = "cloud." + self.unit_id + ".data." + topic

                self.logger.info(" In queue_send: Publishing to nats: " + str(message))
                await self.nc.publish(self.topic_name, json.dumps(message).encode('utf-8'))
            except Empty:
                await asyncio.sleep(self.async_sleep_rate)

    async def nats_connect(self):
        """
            Attempt to connect to the NATS server with logging callbacks, The IP address and port of the
            NATS server are configurable items in the params.yaml. For a remote NATS server on the AWS EC2 instance,
            the public ipv4 address of the EC2 instance should be used.
        """
        self.logger.info(" In nats_connect: Attempting to connect to nats server at: " +
                         str(self.nats_ip_port))

        async def disconnected_cb():
            self.logger.info(
                " In nats_connect: Got disconnected from nats server...")
            self.registered = False

        async def reconnected_cb():
            self.logger.info(
                " In nats_connect: Got reconnected from nats server...")

        async def error_cb(err):
            self.logger.error(
                " In nats_connect: Error with nats server: {0}".format(err))

        try:
            await self.nc.connect("nats://"+str(self.nats_ip_port),
                                  error_cb=error_cb,
                                  reconnected_cb=reconnected_cb,
                                  disconnected_cb=disconnected_cb,
                                  max_reconnect_attempts=1)
            self.logger.info(" In nats_connect: Connected to nats server!")
        except:
            self.logger.error(
                " In nats_connect: Error connecting to nats server")
        finally:
            self.logger.info(" In nats_connect: Done nats connection call.")

    async def available_topics(self):
        """
        Waits for request from telematic server to publish available topics. When a request has been received, it responds
        with all available carma-cloud topics.
        """

        async def send_list_of_topics(msg):
            """Send available list of carma cloud topics"""
            self.logger.info("In send_list_of_topics: Received a request for available topics")
            # convert nanoseconds to microseconds
            self.cloud_info["timestamp"] = datetime.now(timezone.utc).timestamp()*1000000  # utc timestamp in microseconds
            self.cloud_info["topics"] = [{"name": topicName} for topicName in self.cloud_topics if topicName not in self.exclusion_list]
            message = json.dumps(self.cloud_info).encode('utf8')

            self.logger.info("In send_list_of_topics: Sending available topics message to nats: " + str(message))

            await self.nc.publish(msg.reply, message)

        # Wait for a request for available topics and call send_list_of_topics callback function
        try:
            await self.nc.subscribe(self.cloud_info[UnitKeys.UNIT_ID.value] + ".available_topics", self.cloud_info[UnitKeys.UNIT_ID.value], send_list_of_topics)
        except:
            self.logger.error(" In send_list_of_topics: ERROR sending list of available topics to nats server")

    async def register_unit(self):
        """
            send request to server to register unit and waits for ack
        """
        self.logger.info("Entering register unit")
        cloud_info_message = json.dumps(self.cloud_info, ensure_ascii=False).encode('utf8')

        if(not self.registered):
            try:
                response = await self.nc.request(self.cloud_info[UnitKeys.UNIT_ID.value] + ".register_unit", cloud_info_message, timeout=5)
                message = response.data.decode('utf-8')
                self.logger.warn("Registering unit received response: {message}".format(message=message))
                message_json = json.loads(message)
                self.cloud_info[EventKeys.EVENT_NAME.value] = message_json[EventKeys.EVENT_NAME.value]
                self.cloud_info[EventKeys.LOCATION.value] = message_json[EventKeys.LOCATION.value]
                self.cloud_info[EventKeys.TESTING_TYPE.value] = message_json[EventKeys.TESTING_TYPE.value]
                self.registered = True
            except:
                self.logger.warn("Registering unit failed")
                self.registered = False
                pass

    async def check_status(self):
        """
            process request from server to check status
        """
        async def send_status(msg):
            await self.nc.publish(msg.reply, b"OK")

        try:
            await self.nc.subscribe(self.cloud_info[UnitKeys.UNIT_ID.value] + ".check_status", self.cloud_info[UnitKeys.UNIT_ID.value], send_status)

        except:
            self.logger.warn("Status update failed")
            self.registered = False
            pass

    async def publish_topics(self):
        """
        Waits for request from telematic server to create subscriber to selected topics and receive data. When a request
        has been received, the topic name is then added to the CloudNatsBridge subscriber_list variable, which will
        trigger publishing of that data.
        """
        async def topic_request(msg):
            """Add to subscriber_list for every topic in request message"""
            # Alert the nats server that the request has been received and store the requested topics
            await self.nc.publish(msg.reply, b"topic publish request received!")
            data = json.loads(msg.data.decode("utf-8"))

            requested_topics = data['topics']
            self.logger.info(" In topic_request: Received a request to publish/remove the following topics: " + str(requested_topics))

            # Update subscriber list global variable with the latest topic request
            global subscriber_list
            subscriber_list = requested_topics

            self.logger.info(" In topic_request: UPDATED subscriber list: " + str(subscriber_list))

        # Wait for request to publish specific topic and call topic_request callback function
        try:
            await self.nc.subscribe(self.cloud_info[UnitKeys.UNIT_ID.value] + ".publish_topics", "worker", topic_request)
        except:
            self.logger.error(" In topic_request: Error publishing")
