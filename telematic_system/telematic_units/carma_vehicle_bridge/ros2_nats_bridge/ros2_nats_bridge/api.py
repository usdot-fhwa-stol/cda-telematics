#
# Copyright (C) 2022 LEIDOS.
#
# Licensed under the Apache License, Version 2.0 (the "License"); you may not
# use this file except in compliance with the License. You may obtain a copy of
# the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
# WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
# License for the specific language governing permissions and limitations under
# the License.
#

import asyncio
import json

from rclpy.node import Node
from nats.aio.client import Client as NATS

from std_msgs.msg import String
import rosidl_runtime_py
from rcl_interfaces.msg import ParameterDescriptor

class Ros2NatsBridgeNode(Node):

    def __init__(self):
        super().__init__('ros2_nats_bridge')
        self.nc = NATS()
        self.registered = False
        self.subsribers_list = {}

        self.declare_parameter("NATS_SERVER_IP_PORT", "nats://0.0.0.0:4222", ParameterDescriptor(description='This parameter sets the ip address and port for nats server.'))
        self.declare_parameter("UNIT_ID", "vehicle_id", ParameterDescriptor(description='This parameter is a Unique id for the node.'))
        self.declare_parameter("UNIT_TYPE", "platform", ParameterDescriptor(description='This parameter is for type of platform is deployed on (platform or messager)'))

        self.vehicle_info = {"UnitId": self.get_parameter("UNIT_ID").get_parameter_value().string_value, "UnitType": self.get_parameter("UNIT_TYPE").get_parameter_value().string_value}

        self.nats_ip_port = self.get_parameter("NATS_SERVER_IP_PORT").get_parameter_value().string_value
        self.async_sleep_rate = 0.0001

        timer_period = 0.5  # seconds
        self.timer = self.create_timer(timer_period, self.timer_callback)
        self.i = 0

    def timer_callback(self):
        msg = String()
        msg.data = 'heartbeat: %d' % self.i
        self.get_logger().info('"%s"' % msg.data)
        self.i += 1

    async def nats_connect(self):
        """
            connect to nats server on EC2 
        """

        async def disconnected_cb():
            self.registered = False
            self.get_logger().warn("Got disconnected...")

        async def reconnected_cb():
            self.get_logger().warn("Got reconnected...")

        async def error_cb(err):
            self.get_logger().error("{0}".format(err) )

        try:
            await self.nc.connect(self.nats_ip_port,
                            reconnected_cb=reconnected_cb,
                            disconnected_cb=disconnected_cb,
                            error_cb=error_cb,
                            max_reconnect_attempts=-1)
        finally:
            self.get_logger().warn("Client is connected To Server.")

    async def register_unit(self):
        """
            send request to server to register unit and waits for ack 
        """

        self.vehicle_info["TimeStamp"] = self.get_clock().now().nanoseconds
        vehicle_info_message = json.dumps(self.vehicle_info).encode('utf8')

        while(True):
            try:
                self.get_logger().debug("Server status {0}".format(self.nc.is_connected))
                if(self.nc.is_connected and not self.registered):
                    self.get_logger().debug("Registering unit ... ")
                    try:
                        response = await self.nc.request("register_node", vehicle_info_message, timeout=1)
                        self.get_logger().warn("Registering unit received response: {message}".format(message=response.data.decode()))
                    finally:
                        self.registered = True
            except:
                self.registered = False
                pass

            await asyncio.sleep(self.async_sleep_rate)

    async def available_topics(self):
        """
            receives request from server and responds with available topics
        """

        async def send_list_of_topics(msg):
            self.get_logger().warn(f"Received a message on '{msg.subject} {msg.reply}': {msg.data.decode()}")

            self.vehicle_info["TimeStamp"] = self.get_clock().now().nanoseconds
            self.vehicle_info["topics"] = [{"name": name, "type": types[0]}  for name, types in self.get_topic_names_and_types()]

            message = json.dumps(self.vehicle_info).encode('utf8')
                        
            await self.nc.publish(msg.reply, message)

        while True:
            if(self.registered):
                try:
                    sub = await self.nc.subscribe(self.vehicle_info["UnitId"] + ".available_topics", self.vehicle_info["UnitId"], send_list_of_topics)
                finally:
                    self.get_logger().debug("available_topics")

            await asyncio.sleep(self.async_sleep_rate)

    async def publish_topics(self):
        """
            receives request from server to create subscirber to selected topics and publish data
        """

        async def topic_request(msg):
            """
                process request message
                import message type to scope
                create subscriber for every topic in request message
            """
            self.get_logger().warn(f"Received a message on '{msg.subject} {msg.reply}': {msg.data.decode()}")
            await self.nc.publish(msg.reply, b"request received!")
            data = json.loads(msg.data.decode("utf-8"))

            topics = [v for i,v in enumerate(self.get_topic_names_and_types()) if v[0] in data["topics"]]

            for i in topics:
                topic = i[0]
                msg_type = i[1][0]

                if(topic not in self.subsribers_list):
                    msg_type = msg_type.split('/')
                    exec("from " + msg_type[0] + '.' + msg_type[1] + " import " + msg_type[2])
                    call_back = self.CallBack(msg_type, topic, self.nc, self.vehicle_info["UnitId"])
                    try:
                        self.subsribers_list[topic] = self.create_subscription(eval(msg_type[2]), topic, call_back.listener_callback, 10)
                    except:
                        self.get_logger().error("got error")
                    finally:
                        self.get_logger().warn(f"Create a callback for '{topic} with type {msg_type}'.")
        while True:
            if(self.registered):
                self.get_logger().debug("Waiting for server to select topics ...")
                try:
                    sub = await self.nc.subscribe(self.vehicle_info["UnitId"] + ".publish_topics", "worker", topic_request)
                finally:
                    self.get_logger().debug("Waiting for available_topics")
            await asyncio.sleep(self.async_sleep_rate)

    class CallBack(): 
        def __init__(self, msg_type, topic_name, nc, unit_id):
            """
                initilize CallBack class
                declare Nats client 
                publish message to nats server
            """

            self.unit_id = unit_id
            self.msg_type = msg_type
            self.topic_name = unit_id + ".data" + topic_name.replace("/",".")
            self.nc = nc

        async def listener_callback(self, msg):
            """
                listener callback function to publish message to nats server
                convert message to json format
            """
            ordereddict_msg = rosidl_runtime_py.convert.message_to_ordereddict(msg)
            ordereddict_msg["msg_type"] = self.msg_type
            json_message = json.dumps(ordereddict_msg).encode('utf8')

            await self.nc.publish(self.topic_name, json_message)