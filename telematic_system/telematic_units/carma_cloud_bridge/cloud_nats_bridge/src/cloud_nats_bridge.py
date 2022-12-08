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

#global variables used to store TCR/TCM strings for publishing to nats
new_carma_cloud_message_type = ""
new_carma_cloud_message = ""
last_carma_cloud_message = ""
epoch_time = ""

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
    
class FileListener(FileSystemEventHandler):
    """
    The FileListener class is used to listen to the carma cloud log file for new TCR/TCM messages.
    """
    def __init__(self, filepath, filename, logname, tcr_search_string, tcm_search_string):
        self.filepath = filepath
        self.filename = filename
        self.lock = Lock()
        self.logger = logging.getLogger(logname) 
        self.tcr_search_string = tcr_search_string
        self.tcm_search_string = tcm_search_string
        self.log_path = self.filepath+"/"+self.filename
        self.today = date.today()

        #Need to get current number of lines or characters in file
        with open(f'{self.log_path}', 'r', encoding="utf-8") as f:
            self.current_lines = len(f.readlines())
        f.close()

        self.logger.info("Monitoring this carma cloud file: " + str(self.filepath) + "/" + str(self.filename))

    #this method gets called when the log file is modified
    def on_modified(self, event):
        global new_carma_cloud_message, new_carma_cloud_message_type, epoch_time

        #check if the modified file event is the file we are interested in
        if event.src_path == self.log_path:
            #Get the newly printed line and parse out the TCR/TCM
            with self.lock:
                with open(f'{self.log_path}', 'r', encoding="utf-8") as f:
                    line_count = 1
                    for line in f:
                        if line_count > self.current_lines:
                            newLine = line

                            #convert carma cloud timestamp and current date to time since epoch
                            timestamp = newLine.split(" ")[1]
                            date = self.today.strftime("%m/%d/%y")
                            datetime = date + " " + timestamp
                            datetime_converted = pd.to_datetime(datetime)
                            epoch_time = datetime_converted.timestamp() * 1000000 #convert to microseconds

                            messageType = ""
                            #find beginning of TCR/TCM
                            if self.tcm_search_string in newLine:
                                messageType = "TCM"
                                startingIndex = newLine.find("<")
                                new_carma_cloud_message_type = messageType
                                new_carma_cloud_message = newLine[startingIndex:]                                
                                self.logger.info("Carma Cloud generated new " + str(messageType) + " message with payload: " + str(new_carma_cloud_message))
                            elif self.tcr_search_string in newLine:
                                messageType = "TCR"
                                startingIndex = newLine.find("<")
                                new_carma_cloud_message_type = messageType
                                new_carma_cloud_message = newLine[startingIndex:]                        
                                self.logger.info("Carma Cloud generated new " + str(messageType) + " message with payload: " + str(new_carma_cloud_message))
                            self.current_lines = line_count

                        line_count += 1

    #Getter method for testing    
    def getNewCarmaCloudMessageType(self):
        return new_carma_cloud_message_type

class CloudNatsBridge():
    """
    The CloudNatsBridge is capable of listening to the carma cloud log file and streaming
    the data in real-time to a remote NATS server. Various asynchronous functions are defined to
    enable connecting to the NATS server, publishing available topics, and streaming data of interest.
    """

    # Creates a Streets-NATS bridge object that connects to the NATS server
    def __init__(self):

        # Retrieve config values
        with open('../config/params.yaml', 'r') as file:
            config = yaml.safe_load(file)

        self.nats_ip = config['cloud_nats_bridge']['cloud_parameters']['NATS_IP']
        self.nats_port = config['cloud_nats_bridge']['cloud_parameters']['NATS_PORT']
        self.unit_id = config['cloud_nats_bridge']['cloud_parameters']['UNIT_ID']
        self.unit_type = config['cloud_nats_bridge']['cloud_parameters']['UNIT_TYPE']
        self.carma_cloud_directory = config['cloud_nats_bridge']['cloud_parameters']['CARMA_CLOUD_LOG_DIR']
        self.carma_cloud_log_name = config['cloud_nats_bridge']['cloud_parameters']['CARMA_CLOUD_LOG_NAME']
        self.log_level = config['cloud_nats_bridge']['cloud_parameters']['LOG_LEVEL']
        self.log_name = config['cloud_nats_bridge']['cloud_parameters']['LOG_NAME']
        self.log_path = config['cloud_nats_bridge']['cloud_parameters']['LOG_PATH']
        self.log_rotation = int(config['cloud_nats_bridge']['cloud_parameters']['LOG_ROTATION_SIZE_BYTES'])
        self.log_handler_type = config['cloud_nats_bridge']['cloud_parameters']['LOG_HANDLER']
        self.tcr_search_string = config['cloud_nats_bridge']['cloud_parameters']['TCR_STRING']
        self.tcm_search_string = config['cloud_nats_bridge']['cloud_parameters']['TCM_STRING']

        print("search strings: " + self.tcr_search_string + " " + self.tcm_search_string)
        #Gets the log type from environment variable in docker-compose.units.yml file (will override params.yaml)
        self.log_handler_type = os.getenv('LOG_HANDLER_TYPE')

        self.unit_name = "Dev CC"
        self.nc = NATS()
        self.cloud_topics = ["TCR","TCM"]  # list of available carma-cloud topics
        self.subscribers_list = []  # list of topics the user has requested to publish
        self.async_sleep_rate = 0.0001  # asyncio sleep rate
        self.registered = False

        self.cloud_info = {
            UnitKeys.UNIT_ID.value: self.unit_id,
            UnitKeys.UNIT_TYPE.value: self.unit_type,
            UnitKeys.UNIT_NAME.value: self.unit_name}

        # Create CloudNatsBridge logger
        if self.log_handler_type == "file_and_console":
            # If both create log handler for both file and console
            self.createLogger("file")
            self.createLogger("console")
        else:
            self.createLogger(self.log_handler_type)

        self.logger.info(" Created Cloud-NATS bridge object")

        # Start listening to the carma cloud log file
        self.file_listener_start()

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
        if log_type == "file":
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
        event_handler = FileListener(self.carma_cloud_directory, self.carma_cloud_log_name, self.log_name, self.tcr_search_string, self.tcm_search_string)
        self.logger.info(" Creating file listener for " + str(self.carma_cloud_directory) + "/" + str(self.carma_cloud_log_name))
        observer = Observer()
        observer.schedule(event_handler, self.carma_cloud_directory, recursive=True)
        observer.start()

    async def nats_send(self):
        """
            Sends newly generated TCR/TCMs to nats based on the current subscriber list.
        """
        self.logger.info(" In nats_send: Ready to send to nats")

        global new_carma_cloud_message_type, new_carma_cloud_message, last_carma_cloud_message, epoch_time

        try:
            while(True):
                topic = new_carma_cloud_message_type
                #check if topic in subscriber list and compare the new cc message with the last
                if topic in self.subscribers_list and (new_carma_cloud_message != last_carma_cloud_message):
                    #convert the TCR/TCM xml to dictionary, then to json
                    data_dict = xmltodict.parse(new_carma_cloud_message)
                    json_data = json.dumps(data_dict)

                    message = {}
                    message["payload"] = json_data
                    message[UnitKeys.UNIT_ID.value] = self.unit_id
                    message[UnitKeys.UNIT_TYPE.value] = self.unit_type
                    message[UnitKeys.UNIT_NAME.value] = self.unit_name
                    message[TopicKeys.MSG_TYPE.value] = new_carma_cloud_message_type
                    message[EventKeys.EVENT_NAME.value] = self.cloud_info[EventKeys.EVENT_NAME.value]
                    message[EventKeys.TESTING_TYPE.value] = self.cloud_info[EventKeys.TESTING_TYPE.value]
                    message[EventKeys.LOCATION.value] = self.cloud_info[EventKeys.LOCATION.value]
                    message[TopicKeys.TOPIC_NAME.value] = topic
                    message["timestamp"] = datetime.now(timezone.utc).timestamp()*1000000  # utc timestamp in microseconds
                    message["log_timestamp"] = epoch_time 

                    # telematic cloud server will look for topic names with the pattern ".data."
                    self.topic_name = "cloud." + self.unit_id + ".data" + topic

                    # publish the encoded data to the nats server
                    self.logger.info(" In nats_send: Publishing to nats: " + str(message))

                    last_carma_cloud_message = new_carma_cloud_message

                    await self.nc.publish(self.topic_name, json.dumps(message).encode('utf-8'))
                
                await asyncio.sleep(self.async_sleep_rate)
        except:
            self.logger.error("Error publishing message")
            pass

    async def nats_connect(self):
        """
            Attempt to connect to the NATS server with logging callbacks, The IP address and port of the
            NATS server are configurable items in the params.yaml. For a remote NATS server on the AWS EC2 instance,
            the public ipv4 address of the EC2 instance should be used.
        """
        self.logger.info(" In nats_connect: Attempting to connect to nats server at: " +
                         str(self.nats_ip) + ":" + str(self.nats_port))

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
            await self.nc.connect("nats://"+str(self.nats_ip)+":"+str(self.nats_port),
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
            self.cloud_info["topics"] = [{"name": topicName} for topicName in self.cloud_topics]
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
        has been received, the topic name is then added to the CloudNatsBridge subscribers_list variable, which will
        trigger publishing of that data.
        """
        async def topic_request(msg):
            """Add to subscriber_list for every topic in request message"""
            # Alert the nats server that the request has been received and store the requested topics
            await self.nc.publish(msg.reply, b"topic publish request received!")
            data = json.loads(msg.data.decode("utf-8"))

            requested_topics = data['topics']
            self.logger.info(" In topic_request: Received a request to publish/remove the following topics: " + str(requested_topics))

            # Add requested topics to subscriber list if not already there, remove if already there
            for topic in requested_topics:
                if topic not in self.subscribers_list:
                    self.subscribers_list.append(topic)

            for subscribed_topic in self.subscribers_list:
                if subscribed_topic not in requested_topics:
                    self.subscribers_list.remove(subscribed_topic)

            self.logger.info(" In topic_request: UPDATED subscriber list: " + str(self.subscribers_list))

        # Wait for request to publish specific topic and call topic_request callback function
        try:
            await self.nc.subscribe(self.cloud_info[UnitKeys.UNIT_ID.value] + ".publish_topics", "worker", topic_request)
        except:
            self.logger.error(" In topic_request: Error publishing")
