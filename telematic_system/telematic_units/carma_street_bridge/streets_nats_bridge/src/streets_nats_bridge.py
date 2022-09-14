from nats.aio.client import Client as NATS
from kafka import KafkaConsumer
import json
import asyncio
import time
import spdlog as spd
import logging
import yaml
import datetime

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
        self.nc = NATS()
        self.registered = False
        self.streets_topics = []
        self.subscribers_list = []
        self.async_sleep_rate = 0.001
        self.streets_info = {"UnitId": self.unit_id, "UnitType": self.unit_type}

        #boolean to check the status of Kafka consumer creation
        self.consumerCreated = False

        # create log file
        self.logger = logging.getLogger('streets_logger')
        self.logger.setLevel(logging.INFO)
        self.file_handler = logging.FileHandler('streets_logger.log', 'w+')
        self.file_handler.setLevel(logging.INFO)
        self.logger.addHandler(self.file_handler)

        self.logger.info(str(datetime.datetime.now()) + " Created Streets-NATS bridge object")

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
            self.logger.info(str(datetime.datetime.now()) + " In topic_subscribe: Error subscribing to one of the available topics")

    #Get status of KafkaConsumer creation
    def getConsumerStatus(self):
        return self.consumerCreated

    #Read the kafka data and publish to nats if the topic is in the subscribed list
    async def kafka_read(self):
        self.logger.info(str(datetime.datetime.now()) + " In kafka_read: Reading carma-streets kafka traffic")

        try:
            for message in self.kafka_consumer:
                topic = message.topic
                self.logger.info(str(datetime.datetime.now()) + " In kafka_read: Received message: " + str(message.value))

                if topic in self.subscribers_list:
                    message = message.value
                    #Add msg_type to json b/c worker looks for this field
                    message['msg_type'] = topic
                   
                    self.logger.info(str(datetime.datetime.now()) + " In kafka_read: Publishing message: " + str(message))
                    await self.nc.publish("subject", json.dumps(message).encode('utf-8'))

                await asyncio.sleep(self.async_sleep_rate)
        except:
            self.logger.info(str(datetime.datetime.now()) + " In kafka_read: Error reading kafka traffic")
        

    #Connect to the NATS server with logging callbacks
    async def nats_connect(self):
        self.logger.info(str(datetime.datetime.now()) + " In nats_connect: Attempting to connect to nats server at: " + str(self.nats_ip) + ":" + str(self.nats_port))

        async def disconnected_cb():
            self.logger.info(str(datetime.datetime.now()) + " In nats_connect: Got disconnected from nats server...")

        async def reconnected_cb():
            self.logger.info(str(datetime.datetime.now()) + " In nats_connect: Got reconnected from nats server...")
        
        async def error_cb(err):
            self.logger.info(str(datetime.datetime.now()) + " In nats_connect: Error with nats server: {0}".format(err))

        try:
            await self.nc.connect("nats://"+str(self.nats_ip)+":"+str(self.nats_port), 
            error_cb=error_cb,
            reconnected_cb=reconnected_cb,
            disconnected_cb=disconnected_cb,
            max_reconnect_attempts=1)
        except:
            self.logger.info(str(datetime.datetime.now()) + " In nats_connect: Error connecting to nats server")
        finally:
            self.logger.info(str(datetime.datetime.now()) + " In nats_connect: Connected to nats server")
    
    #Register this unit with the NATS server and wait for ack
    async def register_unit(self):
        
        self.streets_info["TimeStamp"] = time.time_ns()
        streets_info_message = json.dumps(self.streets_info).encode('utf8')

        #while loop runs until this unit has been registered with the mysql database
        while(not self.registered):
            try:
                self.logger.info(str(datetime.datetime.now()) + " In register_unit: Server connected: {0}".format(self.nc.is_connected))
                if(self.nc.is_connected and not self.registered):
                    #Send request to register node and wait for response back
                    try:
                        self.logger.info(str(datetime.datetime.now()) + " In register_unit: Attempting to register unit")
                        response = await self.nc.request("register_node", streets_info_message, timeout=1)
                        self.logger.info(str(datetime.datetime.now()) + " In register_unit: Registering unit received response: {message}".format(message=response.data.decode()))
                    finally:
                        self.registered = True
            except:
                self.registered = False
                self.logger.info(str(datetime.datetime.now()) + " In register_unit: Error registering unit, retrying..")
                pass
            await asyncio.sleep(self.async_sleep_rate)
    
    #Responds to request from server for available topics
    async def available_topics(self):

        #Send list of carma streets topics
        async def send_list_of_topics(msg):
            self.logger.info(str(datetime.datetime.now()) + "  In send_list_of_topics: Received a request for available topics")
            self.streets_info["TimeStamp"] = time.time_ms()
            self.streets_info["topics"] = [{"name": topicName} for topicName in self.streets_topics]            
            message = json.dumps(self.streets_info).encode('utf8')   

            self.logger.info(str(datetime.datetime.now()) + " In send_list_of_topics: Sending available topics message to nats: " + str(message))                    
            
            await self.nc.publish(msg.reply, message)


        #If device is registered, wait for a request for available topics and call send_list_of_topics callback function
        while(True):
            if(self.registered):
                try:
                    sub = await self.nc.subscribe(self.streets_info["UnitId"] + ".available_topics", self.streets_info["UnitId"], send_list_of_topics)
                except:
                    self.logger.info(str(datetime.datetime.now()) + " In send_list_of_topics: ERROR sending list of available topics to nats server")
            await asyncio.sleep(self.async_sleep_rate)

    #Receives request from server to create subscriber to selected topics and publish data
    async def publish_topics(self):

        #Create a subscriber for every topic in request message
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
            
            self.logger.info(str(datetime.datetime.now()) + " In topic_request: NEW subscriber list: " + str(self.subscribers_list))
            
        #If device is registered, wait for request to publish specific topic and call topic_request callback function
        while True:
            if(self.registered):
                try:
                    sub = await self.nc.subscribe(self.streets_info["UnitId"] + ".publish_topics", "worker", topic_request)
                except:
                    self.logger.info(str(datetime.datetime.now()) + " In topic_request: Error publishing")
            await asyncio.sleep(self.async_sleep_rate)    
