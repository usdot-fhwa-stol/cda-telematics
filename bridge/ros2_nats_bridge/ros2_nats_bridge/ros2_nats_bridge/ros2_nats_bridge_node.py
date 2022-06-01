import rclpy
from rclpy.node import Node
import rosidl_runtime_py

import json
import time
import threading
import asyncio
import traceback
import sys
from nats.aio.client import Client as NATS
from rcl_interfaces.msg import ParameterDescriptor

class Ros2NatsBridgeNode(Node):
    def __init__(self):
        super().__init__('ros2_nats_bridge')
        self.logger = rclpy.logging.get_logger('ros2_nats_bridge')

        self.topics_map = {}
        self.nc = NATS()
        self.js = self.nc.jetstream()
                
        self.declare_parameter("NATS_SERVER_IP_PORT", "nats://3.90.213.250:4222", ParameterDescriptor(description='This parameter sets the ip address and port for nats server.'))
        self.declare_parameter("NODE_ID", "1", ParameterDescriptor(description='This parameter is a Unique iD for the node.'))

        self.node_id = self.get_parameter('NODE_ID').get_parameter_value().string_value

    async def nats_connection(self):

        async def disconnected_cb():
            self.logger().info("Got disconnected...")

        async def reconnected_cb():
            self.logger().info("Got reconnected...")

        await self.nc.connect(self.get_parameter('NATS_SERVER_IP_PORT').get_parameter_value().string_value, reconnected_cb=reconnected_cb, disconnected_cb=disconnected_cb, max_reconnect_attempts=-1)

    async def register_node(self):
        time1 = time.time()
        while True:
            await asyncio.sleep(0)
            if time.time() > time1 + 0.1:
                try:          
                    self.logger.info("register node at server running ...")

                    message = {}
                    message["id"] = self.node_id
                    message["topics"] = [{"name": name, "type": types[0]}  for name, types in self.get_topic_names_and_types()]
                    
                    json_message = json.dumps(message).encode('utf8')

                    print(json_message)

                    await self.nc.publish("register_node", json_message)
                except Exception as e:
                    traceback.print_exc()
                    rclpy.shutdown()
                    sys.exit()

                time1 = time.time()

    async def create_custom_topic_subscribers(self):

        async def topic_request(msg):
            topics = json.load(msg.reply)
            
            for key, value in topics:
                if(key not in self.topics_map):
                    msg_type = value[0].split('/')
                    exec('import ' + msg_type[0] + '.' + msg_type[1])

                    call_back = self.CallBack(key, value[0].replace("/","."), self.nc)
                    self.topics[key] = self.create_subscription(eval(value[0].replace("/",".")), key, call_back.listener_callback, 10)
        time1 = time.time()
        while True:
            await asyncio.sleep(0)
            if time.time() > time1 + 0.1:
                self.logger.info("create_custom_topic_subscribers running ...")
                try:
                    sub = await self.nc.subscribe(self.node_id, "workers", topic_request)
                except Exception as e:
                    traceback.print_exc()
                    rclpy.shutdown()
                    sys.exit()

                time1 = time.time()

    async def create_subscribers(self, custom_topic_list={}):

        time1 = time.time()
        while True:
            await asyncio.sleep(0)
            if time.time() > time1 + 0.1:
                self.logger().info.debug("create_subscribers is running ...")
                
                current_topic_list = self.get_topic_names_and_types()

                for key, value in current_topic_list:
                    if(key not in self.topics_map):
                        msg_type = value[0].split('/')
                        exec('import ' + msg_type[0] + '.' + msg_type[1])

                        call_back = self.CallBack(key, value[0].replace("/","."), self.nc)
                        self.topics_map[key] = self.create_subscription(eval(value[0].replace("/",".")), key, call_back.listener_callback, 10)

                time1 = time.time()

    class CallBack(): 
        def __init__(self, topic_name, msg_type, nc):
            self.topic_name = topic_name
            self.msg_type = msg_type
            self.nc = nc

        async def listener_callback(self, msg):
            self.msg = msg
            json_message = json.dumps(rosidl_runtime_py.convert.message_to_ordereddict(msg)).encode('utf8')

            print(self.node_id + "." + self.topic_name)
            await self.nc.publish(self.node_id + "." + self.topic_name, json_message)