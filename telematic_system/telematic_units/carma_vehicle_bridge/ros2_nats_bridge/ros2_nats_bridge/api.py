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
from datetime import datetime, timezone
from enum import Enum
import json

from rclpy.node import Node
from nats.aio.client import Client as NATS

from std_msgs.msg import String
import rosidl_runtime_py
from rcl_interfaces.msg import ParameterDescriptor


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


class Ros2NatsBridgeNode(Node):

    def __init__(self):
        super().__init__('ros2_nats_bridge')
        self.nc = NATS()
        self.registered = False
        self.subsribers_list = {}

        self.declare_parameter("NATS_SERVER_IP_PORT", "nats://0.0.0.0:4222", ParameterDescriptor(
            description='This parameter sets the ip address and port for nats server.'))
        self.declare_parameter("UNIT_ID", "vehicle_id", ParameterDescriptor(
            description='This parameter is a Unique id for the node.'))
        self.declare_parameter("UNIT_TYPE", "platform", ParameterDescriptor(
            description='This parameter is for type of platform is deployed on (platform or messager)'))
        self.declare_parameter("UNIT_NAME", "Black_Pacifica", ParameterDescriptor(
            description='This parameter is for the vehicle name that is running the ROS application.'))

        self.vehicle_info = {
            UnitKeys.UNIT_ID.value: self.get_parameter("UNIT_ID").get_parameter_value().string_value,
            UnitKeys.UNIT_TYPE.value: self.get_parameter("UNIT_TYPE").get_parameter_value().string_value,
            UnitKeys.UNIT_NAME.value: self.get_parameter("UNIT_NAME").get_parameter_value().string_value,
            "timestamp": ""}

        self.nats_ip_port = self.get_parameter(
            "NATS_SERVER_IP_PORT").get_parameter_value().string_value
        timer_period = 0.5  # seconds
        self.timer = self.create_timer(timer_period, self.timer_callback)
        self.i = 0

    def timer_callback(self):
        msg = String()
        msg.data = 'heartbeat: %d' % self.i
        self.get_logger().debug('"%s"' % msg.data)
        self.i += 1

    async def nats_connect(self):
        """
            connect to nats server on EC2 
        """

        self.get_logger().info("nats_connect called")

        async def disconnected_cb():
            self.registered = False
            self.get_logger().warn("Got disconnected...")

        async def reconnected_cb():
            self.get_logger().warn("Got reconnected...")

        async def error_cb(err):
            self.get_logger().error("{0}".format(err))

        try:
            await self.nc.connect(self.nats_ip_port,
                                  reconnected_cb=reconnected_cb,
                                  disconnected_cb=disconnected_cb,
                                  error_cb=error_cb,
                                  max_reconnect_attempts=-1)
            self.get_logger().info("Connected to NATS Server!")
        finally:
            self.get_logger().warn("Client is trying to connect to NATS Server Done.")

    async def register_unit(self):
        """
            send request to server to register unit and waits for ack 
        """
        self.get_logger().info("Entering register unit")
        self.vehicle_info["timestamp"] = str(
            self.get_clock().now().nanoseconds)
        vehicle_info_message = json.dumps(
            self.vehicle_info, ensure_ascii=False).encode('utf8')

        if(not self.registered):
            try:
                response = await self.nc.request(self.vehicle_info[UnitKeys.UNIT_ID.value] + ".register_unit",  vehicle_info_message, timeout=5)
                message = response.data.decode('utf-8')
                self.get_logger().warn(
                    "Registering unit received response: {message}".format(message=message))
                message_json = json.loads(message)
                self.vehicle_info[EventKeys.EVENT_NAME.value] = message_json[EventKeys.EVENT_NAME.value]
                self.vehicle_info[EventKeys.LOCATION.value] = message_json[EventKeys.LOCATION.value]
                self.vehicle_info[EventKeys.TESTING_TYPE.value] = message_json[EventKeys.TESTING_TYPE.value]
                self.registered = True
            except:
                self.get_logger().warn("Registering unit failed")
                self.registered = False
                pass

    async def check_status(self):
        """
            process request from server to check status 
        """
        async def send_status(msg):
            await self.nc.publish(msg.reply, b"OK")

        try:
            await self.nc.subscribe(self.vehicle_info[UnitKeys.UNIT_ID.value] + ".check_status", self.vehicle_info[UnitKeys.UNIT_ID.value], send_status)

        except:
            self.get_logger().warn("Status update failed")
            self.registered = False
            pass

    async def available_topics(self):
        """
            receives request from server and responds with available topics
        """
        async def send_list_of_topics(msg):
            self.get_logger().warn(
                f"Received a message on '{msg.subject} {msg.reply}': {msg.data.decode()}")

            self.vehicle_info["timestamp"] = str(
                self.get_clock().now().nanoseconds)
            self.vehicle_info["topics"] = [
                {"name": name, "type": types[0]} for name, types in self.get_topic_names_and_types()]
            message = json.dumps(self.vehicle_info).encode('utf8')
            await self.nc.publish(msg.reply, message)

        try:
            self.get_logger().error("Awaiting for available_topics")
            await self.nc.subscribe(self.vehicle_info[UnitKeys.UNIT_ID.value] + ".available_topics", self.vehicle_info[UnitKeys.UNIT_ID.value], send_list_of_topics)
        except:
            self.get_logger().error("Error for available_topics")
        finally:
            self.get_logger().debug("available_topics")

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
            self.get_logger().warn(
                f"Received a message on '{msg.subject} {msg.reply}': {msg.data.decode()}")
            await self.nc.publish(msg.reply, b"request received!")
            data = json.loads(msg.data.decode("utf-8"))

            topics = [v for i, v in enumerate(
                self.get_topic_names_and_types()) if v[0] in data["topics"]]

            for i in topics:
                topic = i[0]
                msg_type = i[1][0]

                if(topic not in self.subsribers_list):
                    msg_type = msg_type.split('/')
                    exec("from " + msg_type[0] + '.' +
                         msg_type[1] + " import " + msg_type[2])
                    call_back = self.CallBack(i[1][0], topic, self.nc, self.vehicle_info[UnitKeys.UNIT_ID.value], self.vehicle_info[UnitKeys.UNIT_TYPE.value],
                                              self.vehicle_info[UnitKeys.UNIT_NAME.value], self.vehicle_info[EventKeys.EVENT_NAME.value], self.vehicle_info[EventKeys.TESTING_TYPE.value], self.vehicle_info[EventKeys.LOCATION.value])
                    try:
                        self.subsribers_list[topic] = self.create_subscription(
                            eval(msg_type[2]), topic, call_back.listener_callback, 10)
                    except:
                        self.get_logger().error("got error")
                    finally:
                        self.get_logger().warn(
                            f"Create a callback for '{topic} with type {msg_type}'.")

        try:
            self.get_logger().info("Waiting for publish_topics request")
            await self.nc.subscribe(self.vehicle_info[UnitKeys.UNIT_ID.value] + ".publish_topics", "worker", topic_request)
        except:
            self.get_logger().error("Error for publish_topics")
        finally:
            self.get_logger().debug("publish_topics")

    class CallBack():
        def __init__(self, msg_type, topic_name, nc, unit_id, unit_type, unit_name, event_name, testing_type, location):
            """
                initilize CallBack class
                declare Nats client 
                publish message to nats server
            """

            self.unit_id = unit_id
            self.unit_type = unit_type
            self.unit_name = unit_name
            self.msg_type = msg_type
            self.origin_topic_name = topic_name
            self.event_name = event_name
            self.testing_type = testing_type
            self.location = location
            self.topic_name = unit_id + ".platform.data" + topic_name.replace("/", ".")
            print("Publishing on topic: "+ self.topic_name)
            self.nc = nc

        async def listener_callback(self, msg):
            """
                listener callback function to publish message to nats server
                convert message to json format
            """
            ordereddict_msg = {}
            ordereddict_msg["payload"] = rosidl_runtime_py.convert.message_to_ordereddict(
                msg)
            ordereddict_msg[UnitKeys.UNIT_ID.value] = self.unit_id
            ordereddict_msg[UnitKeys.UNIT_TYPE.value] = self.unit_type
            ordereddict_msg[UnitKeys.UNIT_NAME.value] = self.unit_name
            ordereddict_msg[TopicKeys.MSG_TYPE.value] = self.msg_type
            ordereddict_msg[TopicKeys.TOPIC_NAME.value] = self.origin_topic_name
            ordereddict_msg[EventKeys.EVENT_NAME.value] = self.event_name
            ordereddict_msg[EventKeys.TESTING_TYPE.value] = self.testing_type
            ordereddict_msg[EventKeys.LOCATION.value] = self.location
            ordereddict_msg["timestamp"] = datetime.now(
                timezone.utc).timestamp()*1000000  # microseconds
            json_message = json.dumps(ordereddict_msg).encode('utf8')
            self.get_logger().debug(json_message)
            await self.nc.publish(self.topic_name, json_message)
