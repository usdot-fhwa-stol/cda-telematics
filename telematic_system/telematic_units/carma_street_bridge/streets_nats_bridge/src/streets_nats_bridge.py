import sys
from xmlrpc.client import SYSTEM_ERROR
from nats.aio.client import Client as NATS
import json
import asyncio
from datetime import datetime, timezone
import logging
import yaml
from logging.handlers import RotatingFileHandler
from aiokafka import AIOKafkaConsumer
from enum import Enum
import os


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

class StreetsNatsBridge():
    """
    The StreetsNatsBridge is capable of consuming Kafka topics from carma-streets and streaming
    the data in real-time to a remote NATS server. Various asynchronous functions are defined to
    enable connecting to the NATS server, publishing available topics, and streaming data of interest.
    """

    # Creates a Streets-NATS bridge object that connects to the NATS server
    def __init__(self):

        # Load parameters defined as environment variables. Defined the docker-compose file.
        # IP addr where the NATS server is hosted. 
        self.nats_ip = os.getenv('NATS_IP')
        # Port at which NATS is communicating on the speficied IP.
        self.nats_port = os.getenv('NATS_PORT')
        # IP addr where the kafka broker is hosted.
        self.kafka_ip = os.getenv('KAFKA_BROKER_IP')
        # Port at which kafka broker communicates.
        self.kafka_port = os.getenv('KAFKA_BROKER_PORT')
        # Unit ID for the streets nats bride. 
        self.unit_id = os.getenv('STREETS_BRIDGE_UNIT_ID')
        # Unit type for the streets bridge.
        self.unit_type = os.getenv('STREETS_BRIDGE_UNIT_TYPE')
        # Log level for the streets bridge.
        self.log_level = os.getenv('STREETS_BRIDGE_LOG_LEVEL')
        # Name of the log file where logs from the unit will be stored
        self.log_name = os.getenv('STREETS_BRIDGE_LOG_NAME')
        # Path to the log file 
        self.log_path = os.getenv('STREETS_BRIDGE_LOG_PATH')
        # Size of data which can be stored in the log file, before it is refreshed
        self.log_rotation = int(os.getenv('STREETS_BRIDGE_LOG_ROTATION_SIZE_BYTES'))
        self.kafka_offset_reset = os.getenv('KAFKA_CONSUMER_RESET')

        self.unit_name = "West Intersection"
        self.nc = NATS()
        self.streets_topics = []  # list of available carma-streets topic
        self.subscribers_list = []  # list of topics the user has requested to publish
        self.async_sleep_rate = 0.0001  # asyncio sleep rate
        self.registered = False

        self.log_handler_type = os.getenv('STREETS_BRIDGE_LOG_HANDLER_TYPE')

        # Placeholder info for now
        self.streets_info = {
            UnitKeys.UNIT_ID.value: self.unit_id,
            UnitKeys.UNIT_TYPE.value: self.unit_type,
            UnitKeys.UNIT_NAME.value: self.unit_name}

        # Create StreetsNatsBridge logger
        if self.log_handler_type == LogType.ALL.value:
            # If all create log handler for both file and console
            self.createLogger(LogType.FILE.value)
            self.createLogger(LogType.CONSOLE.value)
        elif self.log_handler_type == LogType.FILE.value or self.log_handler_type == LogType.CONSOLE.value:
            self.createLogger(self.log_handler_type)
        else:
            self.createLogger(LogType.CONSOLE.value)
            self.logger.warn("Incorrect Log type defined, defaulting to console")

        self.logger.info(" Created Streets-NATS bridge object")

    def createLogger(self, log_type):
        """Creates log file for the StreetsNatsBridge with configuration items based on the environment variables set in docker-compose.units.yml"""
        self.logger = logging.getLogger(self.log_name)
        now = datetime.now()
        dt_string = now.strftime("_%m_%d_%Y_%H_%M_%S")
        log_name = self.log_name + dt_string + ".log"
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        
        # Create a rotating log handler that will rotate after maxBytes rotation
        # The backup count is how many rotating logs will be created after reaching the maxBytes size       
        if log_type == LogType.FILE.value:
            self.log_handler = RotatingFileHandler(self.log_path+log_name, maxBytes=self.log_rotation, backupCount=5)
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


    async def run_async_kafka_consumer(self):
        """Create Async Kafka consumer object to read carma-streets kafka traffic"""
        try:
            self.logger.info(" In run_async_kafka_consumer: ")
            # auto_offset_reset handles where consumer restarts reading after breaking down or being turned off
            # auto_offset_reset handles where consumer restarts reading after breaking down or being turned off
            # auto_offset_reset handles where consumer restarts reading after breaking down or being turned off
            # ("latest" --> start reading at the end of the log, "earliest" --> start reading at latest committed offset)
            # group_id is the consumer group to which this belongs (consumer needs to be part of group to make auto commit work)
            self.kafka_consumer = AIOKafkaConsumer(
                bootstrap_servers=[self.kafka_ip+":"+self.kafka_port],
                auto_offset_reset=self.kafka_offset_reset,
                enable_auto_commit=True,
                group_id=None,
                value_deserializer=lambda x: json.loads(x.decode('utf-8')))

            await self.kafka_consumer.start()

            # Get all kafka topics and update the streets Kafka topic list
            self.streets_topics = []
            for topic in await self.kafka_consumer.topics():
                self.streets_topics.append(topic)
            self.logger.info(
                " In createAsyncKafkaConsumer: All topics = " + str(self.streets_topics))

            # Subscribe to streets Kafka topic list
            self.kafka_consumer.subscribe(topics=self.streets_topics)
            self.logger.info(
                " In createAsyncKafkaConsumer: Successfully subscribed to the following topics: " + str(self.streets_topics))

            await self.kafka_read()
        except:
            self.logger.error(
                "No CARMA Streets Kafka broker available..exiting")
            sys.exit(SYSTEM_ERROR)

    # Read the carma streets kafka data and publish to nats if the topic is in the subscribed list
    async def kafka_read(self):
        self.logger.info(" In kafka_read: Reading carma-streets kafka traffic")
        try:
            async for consumed_msg in self.kafka_consumer:
                topic = consumed_msg.topic
                # Publish customized message to correlating NATS topics when subscribe list is not empty
                if topic in self.subscribers_list:
                    message = {}
                    message["payload"] = consumed_msg.value
                    # Add msg_type to json b/c worker looks for this field
                    message[UnitKeys.UNIT_ID.value] = self.unit_id
                    message[UnitKeys.UNIT_TYPE.value] = self.unit_type
                    message[UnitKeys.UNIT_NAME.value] = self.unit_name
                    message[TopicKeys.MSG_TYPE.value] = topic
                    message[EventKeys.EVENT_NAME.value] = self.streets_info[EventKeys.EVENT_NAME.value]
                    message[EventKeys.TESTING_TYPE.value] = self.streets_info[EventKeys.TESTING_TYPE.value]
                    message[EventKeys.LOCATION.value] = self.streets_info[EventKeys.LOCATION.value]
                    message[TopicKeys.TOPIC_NAME.value] = topic
                    message["timestamp"] = datetime.now(
                        timezone.utc).timestamp()*1000000  # utc timestamp in microseconds

                    # telematic cloud server will look for topic names with the pattern ".data."
                    self.topic_name = "streets." + self.unit_id + ".data." + topic

                    # publish the encoded data to the nats server
                    self.logger.info(
                        " In kafka_read: Publishing message: " + str(message))
                    await self.nc.publish(self.topic_name, json.dumps(message).encode('utf-8'))

                await asyncio.sleep(self.async_sleep_rate)
        except:
            self.logger.error(" In kafka_read: Error reading kafka traffic")

    async def nats_connect(self):
        """
            Attempt to connect to the NATS server with logging callbacks, The IP address and port of the
            NATS server are configurable items in docker-compose.units.yml. For a remote NATS server on the AWS EC2 instance,
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
        with all available carma-streets kafka topics.
        """

        async def send_list_of_topics(msg):
            """Send available list of carma streets topics"""
            self.logger.info(
                "In send_list_of_topics: Received a request for available topics")
            # convert nanoseconds to microseconds
            self.streets_info["timestamp"] = datetime.now(
                timezone.utc).timestamp()*1000000  # utc timestamp in microseconds
            self.streets_info["topics"] = [
                {"name": topicName} for topicName in self.streets_topics]
            message = json.dumps(self.streets_info).encode('utf8')

            self.logger.info(
                "In send_list_of_topics: Sending available topics message to nats: " + str(message))

            await self.nc.publish(msg.reply, message)

        # Wait for a request for available topics and call send_list_of_topics callback function
        try:
            await self.nc.subscribe(self.streets_info[UnitKeys.UNIT_ID.value] + ".available_topics", self.streets_info[UnitKeys.UNIT_ID.value], send_list_of_topics)
        except:
            self.logger.error(
                " In send_list_of_topics: ERROR sending list of available topics to nats server")

    async def register_unit(self):
        """
            send request to server to register unit and waits for ack 
        """
        self.logger.info("Entering register unit")
        streets_info_message = json.dumps(
            self.streets_info, ensure_ascii=False).encode('utf8')

        if(not self.registered):
            try:
                response = await self.nc.request(self.streets_info[UnitKeys.UNIT_ID.value] + ".register_unit", streets_info_message, timeout=5)
                message = response.data.decode('utf-8')
                self.logger.warn(
                    "Registering unit received response: {message}".format(message=message))
                message_json = json.loads(message)
                self.streets_info[EventKeys.EVENT_NAME.value] = message_json[EventKeys.EVENT_NAME.value]
                self.streets_info[EventKeys.LOCATION.value] = message_json[EventKeys.LOCATION.value]
                self.streets_info[EventKeys.TESTING_TYPE.value] = message_json[EventKeys.TESTING_TYPE.value]
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
            await self.nc.subscribe(self.streets_info[UnitKeys.UNIT_ID.value] + ".check_status", self.streets_info[UnitKeys.UNIT_ID.value], send_status)

        except:
            self.logger.warn("Status update failed")
            self.registered = False
            pass

    async def publish_topics(self):
        """
        Waits for request from telematic server to create subscriber to selected topics and receive data. When a request
        has been received, the topic name is then added to the StreetsNatsBridge subscribers_list variable, which will
        trigger publishing of that data.
        """

        async def topic_request(msg):
            """Add to subscriber_list for every topic in request message"""
            # Alert the nats server that the request has been received and store the requested topics
            await self.nc.publish(msg.reply, b"topic publish request received!")
            data = json.loads(msg.data.decode("utf-8"))

            requested_topics = data['topics']
            self.logger.info(
                " In topic_request: Received a request to publish the following topics: " + str(requested_topics))

            # Remove topics from subscribers list that weren't called in new request
            for existing_topic in list(self.subscribers_list):
                if (existing_topic not in requested_topics[0]):
                    try:
                        self.logger.info('Trying to unsubscribe from topic: "%s"' % existing_topic)
                        self.subscribers_list.remove(existing_topic)
                    except:
                        self.logger.error('Unable to unsubscribe from topic: "%s" '% existing_topic)

            # Add requested topics to subscriber list if not already there
            for topic in requested_topics:
                if topic not in self.subscribers_list:
                    self.subscribers_list.append(topic)

            self.logger.info(
                " In topic_request: UPDATED subscriber list: " + str(self.subscribers_list))

        # Wait for request to publish specific topic and call topic_request callback function
        try:
            await self.nc.subscribe(self.streets_info[UnitKeys.UNIT_ID.value] + ".publish_topics", "worker", topic_request)
        except:
            self.logger.error(" In topic_request: Error publishing")
