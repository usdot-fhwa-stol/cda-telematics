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
from nats.aio.client import Client as NATS
import os
import logging
from logging.handlers import RotatingFileHandler
from datetime import datetime
from enum import Enum
from .rosbag_processor import Rosbag2Parser

class LogType(Enum):
    FILE = "file"
    CONSOLE = "console"
    ALL = "all"

class ServiceManager:

    rosbag_queue = []
    def __init__(self):
        #NATS client to receive requests from the web ui
        self.nc = NATS()
        # List of rosbags to be processeds
        self.rosbag_queue = ['rosbag2_2024_01_26-15_00_24_0.mcap']

        # Load config parameters
        # Configured directory to read rosbags from
        self.rosbag_dir = os.getenv("ROSBAG_STORAGE_DIR")
        # List of topics to be excluded from reading
        self.topic_exclusion_list = os.getenv("TOPIC_EXCLUSION_LIST")
        #NATS params
        self.nats_ip_port = os.getenv("NATS_SERVER_IP_PORT")
        #Logging configuration parameters
        self.log_level = os.getenv("LOG_LEVEL")
        self.log_name = os.getenv("LOG_NAME")
        self.log_path = os.getenv("LOG_PATH")
        self.log_rotation = int(os.getenv("LOG_ROTATION_SIZE_BYTES"))
        self.log_handler_type = os.getenv("LOG_HANDLER_TYPE")

        # Create logger
        if self.log_handler_type == LogType.ALL.value:
            # If all create log handler for both file and console
            self.createLogger(LogType.FILE.value)
            self.createLogger(LogType.CONSOLE.value)
        elif self.log_handler_type == LogType.FILE.value or self.log_handler_type == LogType.CONSOLE.value:
            self.createLogger(self.log_handler_type)
        else:
            self.createLogger(LogType.CONSOLE.value)
            self.logger.warn("Incorrect Log type defined, defaulting to console")

        # Load Influx params
        self.influx_bucket = os.getenv("INFLUX_BUCKET")
        self.influx_org = os.getenv("INFLUX_ORG")
        self.influx_token = os.getenv("INFLUX_TOKEN")
        self.influx_url = os.getenv("INFLUX_URL")

        # Create rosbag parser object
        self.rosbag_parser = Rosbag2Parser(self.influx_bucket, self.influx_org, self.influx_token, self.influx_url, self.topic_exclusion_list, self.rosbag_dir, self.logger)

        #nats connection status
        self.is_nats_connected = False
        # Additional control flag for continuous running
        self.running = True


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

    async def nats_connect(self):
        """
            connect to nats server on EC2
        """

        #self.logger.info("nats_connect called")

        async def disconnected_cb():
            self.registered = False
            #self.logger.warn("Got disconnected...")

        async def reconnected_cb():
            print("Got reconnected")
            # self.logger.warn("Got reconnected...")

        async def error_cb(err):
            self.logger.error("{0}".format(err))

        while self.running:
            if not self.is_nats_connected:
                try:
                    await self.nc.connect(self.nats_ip_port,
                                        reconnected_cb=reconnected_cb,
                                        disconnected_cb=disconnected_cb,
                                        error_cb=error_cb,
                                        max_reconnect_attempts=-1)
                    self.logger.info("Connected to NATS Server!")
                    self.is_nats_connected = True
                finally:
                    self.logger.warn("Client is trying to connect to NATS Server Done.")

            await asyncio.sleep(0.0001)


    async def process_rosbag(self):
        # This task is responsible for processing the rosbag in the queue - As long as the queue is not empty - keep processin
        # This is async because we should be able to keep adding items to the rosbag and keep this task active at the same time
        while self.running:
            #If Queue is not empty - create a new rosbag parser
            if self.rosbag_queue and not self.rosbag_parser.is_processing:
                self.logger.info("Entering queue processing")
                self.rosbag_parser.is_processing = True
                await self.rosbag_parser.process_rosbag(self.rosbag_queue.pop())

            await asyncio.sleep(0.0001)
