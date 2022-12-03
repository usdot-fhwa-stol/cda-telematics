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
from logging.handlers import RotatingFileHandler
import logging
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


class Ros2NatsBridgeNode(Node):

    def __init__(self):
        super().__init__('ros2_nats_bridge')
        self.nc = NATS()
        self.registered = False
        self.subscribers_list = {}

        self.declare_parameter("NATS_SERVER_IP_PORT", "nats://0.0.0.0:4222", ParameterDescriptor(
            description='This parameter sets the ip address and port for nats server.'))
        self.declare_parameter("UNIT_ID", "vehicle_id", ParameterDescriptor(
            description='This parameter is a Unique id for the node.'))
        self.declare_parameter("UNIT_TYPE", "platform", ParameterDescriptor(
            description='This parameter is for type of platform is deployed on (platform or messager)'))
        self.declare_parameter("UNIT_NAME", "Black_Pacifica", ParameterDescriptor(
            description='This parameter is for the vehicle name that is running the ROS application.'))
        self.declare_parameter("LOG_LEVEL", "debug", ParameterDescriptor(
            description='This parameter is for log level.'))
        self.declare_parameter("LOG_NAME", "ros2_nats_bridge", ParameterDescriptor(
            description='This parameter is for log file name.'))        
        self.declare_parameter("LOG_PATH", "/var/logs", ParameterDescriptor(
            description='This parameter is for location where the log file is stored.'))
        self.declare_parameter("LOG_ROTATION_SIZE_BYTES", "2147483648", ParameterDescriptor(
            description='This parameter is for size of each log file.'))
        self.declare_parameter("LOG_HANDLER_TYPE", "console", ParameterDescriptor(
            description='This parameter is for printing the log to console or file.'))

        self.vehicle_info = {
            UnitKeys.UNIT_ID.value: self.get_parameter("UNIT_ID").get_parameter_value().string_value,
            UnitKeys.UNIT_TYPE.value: self.get_parameter("UNIT_TYPE").get_parameter_value().string_value,
            UnitKeys.UNIT_NAME.value: self.get_parameter("UNIT_NAME").get_parameter_value().string_value,
            "timestamp": ""}

        self.nats_ip_port = self.get_parameter(
            "NATS_SERVER_IP_PORT").get_parameter_value().string_value
        
        #Logging configuration parameters
        self.log_level = self.get_parameter("LOG_LEVEL").get_parameter_value().string_value
        self.log_name = self.get_parameter("LOG_NAME").get_parameter_value().string_value
        self.log_path = self.get_parameter("LOG_PATH").get_parameter_value().string_value       
        self.log_rotation = int(self.get_parameter("LOG_ROTATION_SIZE_BYTES").get_parameter_value().string_value)
        
        self.log_handler_type = os.getenv('LOG_HANDLER_TYPE')

        timer_period = 0.5  # seconds
        self.timer = self.create_timer(timer_period, self.timer_callback)
        self.i = 0
        # Create ROS2NatsBridge logger
        if self.log_handler_type == "both":
            # If both create log handler for both file and console
            self.createLogger("file")
            self.createLogger("console")
        else:
            self.createLogger(self.log_handler_type)

    def timer_callback(self):
        msg = String()
        msg.data = 'heartbeat: %d' % self.i
        self.logger.debug('"%s"' % msg.data)
        self.i += 1

    def createLogger(self, log_type):
        """Creates log file for the ROS2NatsBridge with configuration items based on the settings input in the params.yaml file"""
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

    async def nats_connect(self):
        """
            connect to nats server on EC2 
        """

        self.logger.info("nats_connect called")

        async def disconnected_cb():
            self.registered = False
            self.logger.warn("Got disconnected...")

        async def reconnected_cb():
            self.logger.warn("Got reconnected...")

        async def error_cb(err):
            self.logger.error("{0}".format(err))

        try:
            await self.nc.connect(self.nats_ip_port,
                                  reconnected_cb=reconnected_cb,
                                  disconnected_cb=disconnected_cb,
                                  error_cb=error_cb,
                                  max_reconnect_attempts=-1)
            self.logger.info("Connected to NATS Server!")
        finally:
            self.logger.warn("Client is trying to connect to NATS Server Done.")

    async def register_unit(self):
        """
            send request to server to register unit and waits for ack 
        """
        self.logger.info("Entering register unit")
        self.vehicle_info["timestamp"] = str(
            self.get_clock().now().nanoseconds)
        vehicle_info_message = json.dumps(
            self.vehicle_info, ensure_ascii=False).encode('utf8')

        if(not self.registered):
            try:
                response = await self.nc.request(self.vehicle_info[UnitKeys.UNIT_ID.value] + ".register_unit",  vehicle_info_message, timeout=5)
                message = response.data.decode('utf-8')
                self.logger.warn(
                    "Registering unit received response: {message}".format(message=message))
                message_json = json.loads(message)
                self.vehicle_info[EventKeys.EVENT_NAME.value] = message_json[EventKeys.EVENT_NAME.value]
                self.vehicle_info[EventKeys.LOCATION.value] = message_json[EventKeys.LOCATION.value]
                self.vehicle_info[EventKeys.TESTING_TYPE.value] = message_json[EventKeys.TESTING_TYPE.value]
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
            await self.nc.subscribe(self.vehicle_info[UnitKeys.UNIT_ID.value] + ".check_status", self.vehicle_info[UnitKeys.UNIT_ID.value], send_status)

        except:
            self.logger.warn("Status update failed")
            self.registered = False
            pass

    async def available_topics(self):
        """
            receives request from server and responds with available topics
        """
        async def send_list_of_topics(msg):
            self.logger.warn(
                f"Received a message on '{msg.subject} {msg.reply}': {msg.data.decode()}")

            self.vehicle_info["timestamp"] = str(
                self.get_clock().now().nanoseconds)
            self.vehicle_info["topics"] = [
                {"name": name, "type": types[0]} for name, types in self.get_topic_names_and_types()]
            message = json.dumps(self.vehicle_info).encode('utf8')
            await self.nc.publish(msg.reply, message)

        try:
            self.logger.error("Awaiting for available_topics")
            await self.nc.subscribe(self.vehicle_info[UnitKeys.UNIT_ID.value] + ".available_topics", self.vehicle_info[UnitKeys.UNIT_ID.value], send_list_of_topics)
        except:
            self.logger.error("Error for available_topics")
        finally:
            self.logger.debug("available_topics")

    async def publish_topics(self):
        """
            receives request from server to create subscriber to selected topics and publish data
        """
        
        async def topic_unsubscribe_request(topic):
            """
                Method to process unsubscribe requests. Removes the topic from list of subscribed topics and destroys subscription object
            """
            try:
                # rclpy Node method to stop subscription on specified topic
                self.destroy_subscription(self.subscribers_list[topic])
                # Remove iteration with "topic"
                del self.subscribers_list[topic]
                self.logger.warn('Unsubscribed from "%s"' % topic)
            except:
                self.logger.error("Unable to remove subscription to topic")

        async def topic_request(msg):
            """
                process request message
                import message type to scope
                create subscriber for every topic in request message
            """
            self.logger.warn(
                f"Received a message on '{msg.subject} {msg.reply}': {msg.data.decode()}")
            await self.nc.publish(msg.reply, b"request received!")
            data = json.loads(msg.data.decode("utf-8"))

            incoming_topics = [v for i, v in enumerate(
                self.get_topic_names_and_types()) if v[0] in data["topics"]]

            # Remove topics from subscribers list that weren't called in new request
            for existing_topic in list(self.subscribers_list):
                if (existing_topic not in incoming_topics[0]):
                    self.logger.info('Trying to unsubscribe from topic: "%s"' % existing_topic)
                    await topic_unsubscribe_request(topic)

            for i in incoming_topics:
                topic = i[0]
                msg_type = i[1][0]

                if(topic not in self.subscribers_list):
                    msg_type = msg_type.split('/')
                    exec("from " + msg_type[0] + '.' +
                         msg_type[1] + " import " + msg_type[2])
                    call_back = self.CallBack(i[1][0], topic, self.nc, self.vehicle_info[UnitKeys.UNIT_ID.value], self.vehicle_info[UnitKeys.UNIT_TYPE.value],
                                              self.vehicle_info[UnitKeys.UNIT_NAME.value], self.vehicle_info[EventKeys.EVENT_NAME.value], self.vehicle_info[EventKeys.TESTING_TYPE.value], self.vehicle_info[EventKeys.LOCATION.value], self.logger)
                    try:
                        self.subscribers_list[topic] = self.create_subscription(
                            eval(msg_type[2]), topic, call_back.listener_callback, 10)
                    except Exception as e:
                        self.logger.error("got error: " + str(e))
                    finally:
                        self.logger.warn(
                            f"Created a callback for '{topic} with type {msg_type}'.")

        try:
            self.logger.info("Waiting for publish_topics request")
            await self.nc.subscribe(self.vehicle_info[UnitKeys.UNIT_ID.value] + ".publish_topics", "worker", topic_request)
        except Exception as e:
            self.logger.error("Error for publish_topics: " + str(e))
        finally:
            self.logger.debug("publish_topics")



    class CallBack():
        def __init__(self, msg_type, topic_name, nc, unit_id, unit_type, unit_name, event_name, testing_type, location, logger):
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
            self.topic_name = "platform." + unit_id + ".data" + topic_name.replace("/", ".")
            self.logger = logger
            self.logger.info("Publishing on topic: "+ self.topic_name)
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
            try:
                json_message = json.dumps(ordereddict_msg)
                self.logger.info(json_message)
                json_message_encoded = json_message.encode('utf8')
                await self.nc.publish(self.topic_name, json_message_encoded)
            except Exception as e:
                self.logger.error("Error while publishing topic: " + str(e))
            finally:
                self.logger.debug("published topic")
