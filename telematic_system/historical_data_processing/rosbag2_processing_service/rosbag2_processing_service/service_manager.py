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

from datetime import datetime
from .rosbag_processor import Rosbag2Parser
from .config import Config
import json
from pathlib import Path


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
        upload_destination_path (str): Directory at which rosbag is uploaded.
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

    def __init__(self, config=Config()):
        #NATS client to receive requests from the web ui
        self.nc = NATS()
        # List of rosbags to be processed
        self.rosbag_queue = []

        self.config = config

        # Create rosbag parser object
        self.rosbag_parser = Rosbag2Parser(config)

        #nats connection status
        self.is_nats_connected = False

        #TODO: Add Mysql database connection
        #self.db = _mysql.connect(host="", user="", password="", database="")


    async def nats_connect(self):
        """
            connect to nats server on EC2
        """
        # Nats request callback
        async def get_file_path_from_nats(msg):
            self.config.logger.info("Entering process nats request")

            data = msg.data.decode()
            msg_json_object = json.loads(data)

            rosbag_name = msg_json_object["filename"]

            rosbag_path = Path(self.config.upload_destination_path) / rosbag_name
            # Add rosbag name to queue
            self.rosbag_queue.append(rosbag_path)

            # No response sent for the nats request

        async def disconnected_cb():
            self.config.logger.warn("Got disconnected...")

        async def reconnected_cb():
            self.config.logger.warn("Got reconnected...")

        async def error_cb(err):
            self.config.logger.error("{0}".format(err))

        if not self.is_nats_connected:
            try:
                await self.nc.connect(self.config.nats_ip_port,
                                    reconnected_cb=reconnected_cb,
                                    disconnected_cb=disconnected_cb,
                                    error_cb=error_cb,
                                    max_reconnect_attempts=-1)
                self.config.logger.info("Connected to NATS Server!")
                self.is_nats_connected = True
            finally:
                self.config.logger.info("Client is trying to connect to NATS Server Done.")

            # Create subscriber for nats
            try:
                await self.nc.subscribe(self.config.nats_request_topic, cb = get_file_path_from_nats)
            except:
                self.config.logger.warn("Failed to create nats request subscription")


    async def process_rosbag(self):
        # This task is responsible for processing the rosbag in the queue - As long as the queue is not empty - keep processing
        # This is async because we should be able to keep adding items to the rosbag and keep this task active at the same time
        while True:
            if not self.rosbag_parser.is_processing and self.rosbag_queue:
                rosbag_name = Path(self.rosbag_queue[0]).name
                self.config.logger.info(f"Entering processing for rosbag: {rosbag_name}")

                rosbag_to_process = self.rosbag_queue.pop(0)
                # TODO: Check mysql if rosbag already processed/ Create new entry for rosbag

                await self.rosbag_parser.process_rosbag(rosbag_to_process)

                # TODO: Update mysql entry for rosbag based on whether processing was successful
            await asyncio.sleep(1.0)
