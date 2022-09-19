from nats.aio.client import Client as NATS
from kafka import KafkaConsumer
import json
import asyncio
import time
import logging
import yaml
import datetime

#The StreetsNatsBridge is capable of consuming Kafka topics from carma-streets and streaming
#the data in real-time to a remote NATS server. Various asynchronous functions are defined to
#enable connecting to the NATS server, publishing available topics, and streaming data of interest.
class StreetsNatsBridge():

    #Creates a Streets-NATS bridge object that connects to the NATS server
    def __init__(self):
        
        #Retrieve config values
        with open('../config/params.yaml', 'r') as file:
            config = yaml.safe_load(file)

        self.nats_ip = config['streets_nats_bridge']['streets_parameters']['NATS_IP']
        self.nats_port = config['streets_nats_bridge']['streets_parameters']['NATS_PORT']
        self.kafka_ip = config['streets_nats_bridge']['streets_parameters']['KAFKA_BROKER_IP']
        self.kafka_port = config['streets_nats_bridge']['streets_parameters']['KAFKA_BROKER_PORT']
        self.unit_id = config['streets_nats_bridge']['streets_parameters']['UNIT_ID']
        self.unit_type = config['streets_nats_bridge']['streets_parameters']['UNIT_TYPE']
        self.log_level = config['streets_nats_bridge']['streets_parameters']['LOG_LEVEL']
        self.log_name = config['streets_nats_bridge']['streets_parameters']['LOG_NAME']
        self.unit_name = "West Intersection"
        self.event_name = "UC3"
        self.location = "TFHRC"
        self.testing_type = "Integration"
        self.nc = NATS()
        self.registered = False #boolean to check if this module has been registered with NATS
        self.streets_topics = [] #list of available carma-streets topic
        self.subscribers_list = [] #list of topics the user has requested to publish
        self.async_sleep_rate = 0.0001 #asyncio sleep rate
        self.consumerCreated = False #boolean to check the status of Kafka consumer creation

        #Placeholder info for now
        self.streets_info = {
        "UnitId": self.unit_id,
        "UnitType": self.unit_type,
        "UnitName": self.unit_name,
        "EventName": self.event_name,
        "Location": self.location,
        "TestingType": self.testing_type}        
        
        #Create StreetsNatsBridge logger
        self.createLogger()
        self.logger.info(str(datetime.datetime.now()) + " Created Streets-NATS bridge object")

    #Creates log file for the StreetsNatsBridge with configuration items based on the settings input in the params.yaml file
    def createLogger(self):
        # create log file and set log levels
        self.logger = logging.getLogger('streets_logger')
        log_name = self.log_name + ".log"

        self.file_handler = logging.FileHandler(log_name, 'w+')

        if(self.log_level == "debug"):
            self.logger.setLevel(logging.DEBUG)
            self.file_handler.setLevel(logging.DEBUG)
        elif(self.log_level == "info"):
            self.logger.setLevel(logging.INFO)
            self.file_handler.setLevel(logging.INFO)
        elif(self.log_level == "error"):
            self.logger.setLevel(logging.ERROR)
            self.file_handler.setLevel(logging.ERROR)

        self.logger.addHandler(self.file_handler)

    #Create Kafka consumer object to read carma-streets kafka traffic
    def createKafkaConsumer(self):
        #auto_offset_reset handles where consumer restarts reading after breaking down or being turned off 
        #("latest" --> start reading at the end of the log, "earliest" --> start reading at latest committed offset)
        #group_id is the consumer group to which this belongs (consumer needs to be part of group to make auto commit work)
        self.kafka_consumer = KafkaConsumer(
            bootstrap_servers=[self.kafka_ip + ":" + self.kafka_port],
            auto_offset_reset='earliest',
            enable_auto_commit=True,
            group_id='my-group',
            value_deserializer=lambda x: json.loads(x.decode('utf-8')))
        
        self.consumerCreated = True 
        self.logger.info(str(datetime.datetime.now()) + " In createKafkaConsumer: Successfully created Kafka consumer listening to Kafka broker at: " \
        + str(self.kafka_ip) + ":" + str(self.kafka_port))  

    #Populates list with all available carma streets topics
    def list_topics(self):
        topic_list = []
        for topic in self.kafka_consumer.topics():
            topic_list.append(topic)
        
        self.streets_topics = topic_list

    #Subscribes to all carma streets topics
    #Topic subscriptions are not incremental: this list will replace the current assignment (if there is one).
    def topic_subscribe(self):
        try:
            self.list_topics()
            self.kafka_consumer.subscribe(topics=self.streets_topics)
            #TODO need to figure out way to print out topics we failed to subscribe to
            self.logger.info(str(datetime.datetime.now()) + " In topic_subscribe: Successfully subscribed to the following topics: " + str(self.streets_topics))
        except:
            self.logger.error(str(datetime.datetime.now()) + " In topic_subscribe: Error subscribing to one of the available topics")

    #Get status of KafkaConsumer creation
    def getConsumerStatus(self):
        return self.consumerCreated

    #Read the carma streets kafka data and publish to nats if the topic is in the subscribed list
    async def kafka_read(self):
        self.logger.info(str(datetime.datetime.now()) + " In kafka_read: Reading carma-streets kafka traffic")

        try:
            for message in self.kafka_consumer:
                topic = message.topic
                # self.logger.info(str(datetime.datetime.now()) + " In kafka_read: Received message: " + str(message.value))

                if topic in self.subscribers_list:
                    message = message.value
                    #Add msg_type to json b/c worker looks for this field
                    message["unit_id"] = self.unit_id
                    message["unit_type"] = self.unit_type
                    message["unit_name"] = self.unit_name
                    message["event_name"] = self.event_name
                    message["location"] = self.location
                    message["testing_type"] = self.testing_type
                    message["msg_type"] = topic
                    message["topic_name"] = topic
                    message["timestamp"] = time.time_ns() / 1000 #convert nanoseconds to microseconds

                    #telematic cloud server will look for topic names with the pattern ".data."
                    self.topic_name = self.unit_id + ".data." + topic
                   
                    #publish the encoded data to the nats server
                    self.logger.info(str(datetime.datetime.now()) + " In kafka_read: Publishing message: " + str(message))
                    await self.nc.publish(self.topic_name, json.dumps(message).encode('utf-8'))

                await asyncio.sleep(self.async_sleep_rate)
        except:
            self.logger.error(str(datetime.datetime.now()) + " In kafka_read: Error reading kafka traffic")
        

    #Attempt to connect to the NATS server with logging callbacks, The IP address and port of the
    #NATS server are configurable items in the params.yaml. For a remote NATS server on the AWS EC2 instance,
    #the public ipv4 address of the EC2 instance should be used.
    async def nats_connect(self):
        self.logger.info(str(datetime.datetime.now()) + " In nats_connect: Attempting to connect to nats server at: " + str(self.nats_ip) + ":" + str(self.nats_port))

        async def disconnected_cb():
            self.logger.error(str(datetime.datetime.now()) + " In nats_connect: Got disconnected from nats server...")

        async def reconnected_cb():
            self.logger.error(str(datetime.datetime.now()) + " In nats_connect: Got reconnected from nats server...")
        
        async def error_cb(err):
            self.logger.error(str(datetime.datetime.now()) + " In nats_connect: Error with nats server: {0}".format(err))

        try:
            await self.nc.connect("nats://"+str(self.nats_ip)+":"+str(self.nats_port), 
            error_cb=error_cb,
            reconnected_cb=reconnected_cb,
            disconnected_cb=disconnected_cb,
            max_reconnect_attempts=1)
        except:
            self.logger.error(str(datetime.datetime.now()) + " In nats_connect: Error connecting to nats server")
        finally:
            self.logger.info(str(datetime.datetime.now()) + " In nats_connect: Connected to nats server")
       
    #Waits for request from telematic server to publish available topics. When a request has been received, it responds
    #with all available carma-streets kafka topics.
    async def available_topics(self):

        #Send list of carma streets topics
        async def send_list_of_topics(msg):
            self.logger.info(str(datetime.datetime.now()) + "  In send_list_of_topics: Received a request for available topics")
            self.streets_info["TimeStamp"] = time.time_ns() / 1000 #convert nanoseconds to microseconds
            self.streets_info["topics"] = [{"name": topicName} for topicName in self.streets_topics]            
            message = json.dumps(self.streets_info).encode('utf8')   

            self.logger.info(str(datetime.datetime.now()) + " In send_list_of_topics: Sending available topics message to nats: " + str(message))                    
            
            await self.nc.publish(msg.reply, message)


        #Wait for a request for available topics and call send_list_of_topics callback function
        while(True):
            try:
                sub = await self.nc.subscribe(self.streets_info["UnitId"] + ".available_topics", self.streets_info["UnitId"], send_list_of_topics)
            except:
                self.logger.error(str(datetime.datetime.now()) + " In send_list_of_topics: ERROR sending list of available topics to nats server")
            await asyncio.sleep(self.async_sleep_rate)

    #Waits for request from telematic server to create subscriber to selected topics and receive data. When a request
    #has been received, the topic name is then added to the StreetsNatsBridge subscribers_list variable, which will
    #trigger publishing of that data.
    async def publish_topics(self):

        #Add to subscriber_list for every topic in request message
        async def topic_request(msg):

            #Alert the nats server that the request has been received and store the requested topics
            await self.nc.publish(msg.reply, b"topic publish request received!")
            data = json.loads(msg.data.decode("utf-8"))

            requested_topics = data['topics']
            self.logger.info(str(datetime.datetime.now()) + " In topic_request: Received a request to publish the following topics: " + str(requested_topics))

            #Add requested topics to subscriber list if not already there
            for topic in requested_topics:
                if topic['name'] not in self.subscribers_list:
                    self.subscribers_list.append(topic['name'])                   
            
            self.logger.info(str(datetime.datetime.now()) + " In topic_request: UPDATED subscriber list: " + str(self.subscribers_list))
            
        #Wait for request to publish specific topic and call topic_request callback function
        while True:
            try:
                sub = await self.nc.subscribe(self.streets_info["UnitId"] + ".publish_topics", "worker", topic_request)
            except:
                self.logger.error(str(datetime.datetime.now()) + " In topic_request: Error publishing")
            await asyncio.sleep(self.async_sleep_rate)    
