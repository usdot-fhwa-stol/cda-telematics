#
# Copyright (C) 2024 LEIDOS.
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
import json
from pathlib import Path
#from MySQLdb  import _mysql

class LogType(Enum):
    FILE = "file"
    CONSOLE = "console"
    ALL = "all"

class ServiceManager:

    """
    @class ServiceManager
    @brief Manages service operations including NATS communication, rosbag processing, and logging.

    @details Initializes the service manager with configurations for NATS server communication, logging, and rosbag processing.
             It sets up a connection to the NATS server, configures logging based on environment variables, and prepares
             a queue for managing rosbag processing tasks.It also handles connections to external services such as InfluxDB for data storage.

    Attributes:
        nc (NATS): NATS client for receiving requests.
        queue (asyncio.Queue): Queue of rosbags to be processed.
        s3_mounted_dir (str): Directory at which S3 bucket is mounted (if running on cloud).
        topic_exclusion_list (list): Topics to be excluded from processing.
        nats_ip_port (str): IP and port for the NATS server.
        log_level (str): Logging level (debug, info, error).
        log_name (str): Base name for log files.
        log_path (str): Path to store log files.
        log_rotation (int): Log file rotation size in bytes.
        log_handler_type (str): Type of log handler (file, console, all).
        influx_bucket (str): InfluxDB bucket name.
        influx_org (str): InfluxDB organization name.
        influx_token (str): InfluxDB authentication token.
        influx_url (str): URL of the InfluxDB server.
        to_str_fields (list): ROS message fields to convert to strings.
        ignore_fields (list): ROS message fields to ignore.
        is_nats_connected (bool): Flag indicating NATS connection status.
        nats_request_topic (str): NATS topic for receiving rosbag processing requests.
        rosbag_parser (Rosbag2Parser): Object for parsing rosbags.
    """

    def __init__(self):
        #NATS client to receive requests from the web ui
        self.nc = NATS()
        # List of rosbags to be processed
        self.rosbag_queue = []

        # Load config parameters
        # Configured directory to read rosbags from
        self.s3_mounted_dir = os.getenv("S3_MOUNTED_DIR")
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

        #Fields in the ros message to force to string type.
        self.to_str_fields = os.getenv("TO_STR_FIELDS")
        # Fields in the ros message to ignore
        self.ignore_fields = os.getenv("IGNORE_FIELDS")

        self.accepted_file_extensions = os.getenv("ACCEPTED_FILE_EXTENSIONS")

        # Create rosbag parser object
        self.rosbag_parser = Rosbag2Parser(self.influx_bucket, self.influx_org, self.influx_token, self.influx_url, self.topic_exclusion_list, self.s3_mounted_dir, self.to_str_fields, self.ignore_fields, self.logger, self.accepted_file_extensions)

        #nats connection status
        self.is_nats_connected = False

        # Nats request topic
        self.nats_request_topic = os.getenv("NATS_REQUEST_TOPIC")

        #TODO: Add Mysql database connection
        #self.db = _mysql.connect(host="", user="", password="", database="")

    def createLogger(self, log_type):
        """Creates log file for the ServiceManager with configuration items based on the settings input in the params.yaml file"""
        # create log file and set log levels
        self.logger = logging.getLogger(self.log_name)
        now = datetime.now()
        dt_string = now.strftime("_%m_%d_%Y_%H_%M_%S")
        log_name = self.log_name + dt_string + ".log"
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(funcName)s - %(levelname)s - %(message)s')

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

        async def process_nats_request(msg):
            self.logger.info("Entering process nats request")

            data = msg.data.decode()
            msg_json_object = json.loads(data)
            uploaded_path = msg_json_object["uploaded_path"]
            rosbag_name = msg_json_object["filename"]

            rosbag_path = Path(uploaded_path) / rosbag_name
            # Add rosbag name to queue
            self.rosbag_queue.append(rosbag_path)

            # No response sent for the nats request

        async def disconnected_cb():
            self.registered = False
            self.logger.warn("Got disconnected...")

        async def reconnected_cb():
            self.logger.warn("Got reconnected...")

        async def error_cb(err):
            self.logger.error("{0}".format(err))

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
                self.logger.info("Client is trying to connect to NATS Server Done.")

            # Create subscriber for nats
            try:
                await self.nc.subscribe(self.nats_request_topic, cb = process_nats_request)
            except:
                self.logger.warn("Failed to create nats request subscription")


    async def process_rosbag(self):
        # This task is responsible for processing the rosbag in the queue - As long as the queue is not empty - keep processing
        # This is async because we should be able to keep adding items to the rosbag and keep this task active at the same time
        while True:
            if not self.rosbag_parser.is_processing and self.rosbag_queue:
                rosbag_name = Path(self.rosbag_queue[0]).name
                self.logger.info(f"Entering processing for rosbag: {rosbag_name}")

                rosbag_to_process = self.rosbag_queue.pop(0)
                # TODO: Check mysql if rosbag already processed/ Create new entry for rosbag
                self.rosbag_parser.is_processing = True
                await self.rosbag_parser.process_rosbag(rosbag_to_process)

                # TODO: Update mysql entry for rosbag based on whether processing was successful
            await asyncio.sleep(1.0)
