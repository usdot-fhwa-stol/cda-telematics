from nats.aio.client import Client as NATS
import json
import time
import asyncio 

class NatsPublish():

    #Creates a Nats Publisher object that connects to the NATS server
    def __init__(self, nats_ip, nats_port, unit_id, unit_type, streets_topics):
        print("Attempting to connect to nats at: " + str(nats_ip) + ":" + str(nats_port))
        self.nats_ip = nats_ip
        self.nats_port = nats_port
        self.nc = NATS()
        self.registered = False
        self.subscribers_list = []
        self.async_sleep_rate = 0.01
        self.vehicle_info = {"UnitId": unit_id, "UnitType": unit_type}
        self.streets_topics = streets_topics

    #Connect to the NATS server with logging callbacks
    async def nats_connect(self):

        async def disconnected_cb():
            print("Got disconnected...")

        async def reconnected_cb():
            print("Got reconnected...")
        
        async def error_cb(err):
            print("{0}".format(err))

        try:
            await self.nc.connect("nats://"+str(self.nats_ip)+":"+str(self.nats_port), 
            error_cb=error_cb,
            reconnected_cb=reconnected_cb,
            disconnected_cb=disconnected_cb,
            max_reconnect_attempts=1)
        except:
            print("Error connecting to nats server")
        finally:
            print("Connected to nats server")
    
    #Register this unit with the NATS server and wait for ack
    async def register_unit(self):
        
        self.vehicle_info["TimeStamp"] = time.time_ns()
        vehicle_info_message = json.dumps(self.vehicle_info).encode('utf8')

        #while loop runs until this unit has been registered with the mysql database
        while(not self.registered):
            try:
                print("Server connected: {0}".format(self.nc.is_connected))
                if(self.nc.is_connected and not self.registered):
                    #Send request to register node and wait for response back
                    try:
                        print("Attempting to register unit")
                        response = await self.nc.request("register_node", vehicle_info_message, timeout=1)
                        print("Registering unit received response: {message}".format(message=response.data.decode()))
                    finally:
                        self.registered = True
            except:
                self.registered = False
                print("Error registering unit, retrying..")
                pass
            await asyncio.sleep(self.async_sleep_rate)
    
    #Responds to request from server for available topics
    async def available_topics(self):

        #Send list of carma streets topics
        async def send_list_of_topics(msg):
            print("Received a request for available topics")
            self.vehicle_info["TimeStamp"] = time.time_ns()
            self.vehicle_info["topics"] = [{"name": topicName} for topicName in self.streets_topics]            
            message = json.dumps(self.vehicle_info).encode('utf8')   

            print("Sending topics message to nats: " + str(message))                    
            
            await self.nc.publish(msg.reply, message)


        #If device is registered, wait for a request for available topics and call send_list_of_topics callback function
        while(True):
            if(self.registered):
                try:
                    sub = await self.nc.subscribe(self.vehicle_info["UnitId"] + ".available_topics", self.vehicle_info["UnitId"], send_list_of_topics)
                except:
                    print("ERROR sending list of available topics to nats server")
            await asyncio.sleep(self.async_sleep_rate)

    #Receives request from server to create subscirber to selected topics and publish data
    async def publish_topics(self):

        #Create a subscriber for every topic in request message
        async def topic_request(msg):

            #Alert the nats server that the request has been received and store the requested topics
            await self.nc.publish(msg.reply, b"topic publish request received!")
            data = json.loads(msg.data.decode("utf-8"))

            requested_topics = data['topics']
            print("Received a request to publish the following topics: " + str(requested_topics))

            #Add requested topics to subscriber list if not already there
            for topic in requested_topics:
                if topic['name'] not in self.subscribers_list:
                    self.subscribers_list.append(topic['name'])
                    
                    #Create CallBack object for topic and create a subscription to publish
                    call_back = self.CallBack(topic['name'], self.nc, self.vehicle_info["UnitId"])
                    try:
                        self.subscribers_list[topic['name']] = self.create_subscription(topic['name'], call_back.listener_callback, 10)
                    except:
                        print("Error creating subscription for topic: " + str(topic['name']))
                    finally:
                        print(f"Created a callback for '{topic['name']}'.")
            
            print("NEW subscriber list: " + str(self.subscribers_list))
            
        #If device is registered, wait for request to publish specific topic and call topic_request callback function
        while True:
            if(self.registered):
                try:
                    sub = await self.nc.subscribe(self.vehicle_info["UnitId"] + ".publish_topics", "worker", topic_request)
                except:
                    print("Error publishing")
            await asyncio.sleep(self.async_sleep_rate)
    
    
    #Callback class for nats client publishing
    class CallBack(): 
        def __init__(self, topic_name, nc, unit_id):
            self.unit_id = unit_id
            self.topic_name = unit_id + ".data" + topic_name.replace("/",".")
            self.nc = nc

        #callback function converts message to json and publishes message to nats server
        async def listener_callback(self, msg):
            ordereddict_msg = rosidl_runtime_py.convert.message_to_ordereddict(msg)
            ordereddict_msg["msg_type"] = self.msg_type
            json_message = json.dumps(ordereddict_msg).encode('utf8')

            await self.nc.publish(self.topic_name, json_message)