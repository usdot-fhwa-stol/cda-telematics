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
from .config import ProcessingStatus
import json
from pathlib import Path

import mysql.connector
from mysql.connector import Error
import time


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
        # NATS client to receive requests from the web ui
        self.nc = NATS()
        # List of rosbags to be processed
        self.rosbag_queue = []

        self.config = config

        # Create rosbag parser object
        self.rosbag_parser = Rosbag2Parser(config)

        # nats connection status
        self.is_nats_connected = False

        self.last_processed_rosbag = ""

        self.mysql_conn = self.create_mysql_conn()

    async def nats_connect(self):
        """
            connect to nats server on EC2
        """

        # No response sent for the nats request

        async def nats_disconnected_cb():
            self.config.logger.warn("Got disconnected...")

        async def nats_reconnected_cb():
            self.config.logger.warn("Got reconnected...")

        async def nats_error_cb(err):
            self.config.logger.error("{0}".format(err))

        if not self.is_nats_connected:
            try:

                await self.nc.connect(self.config.nats_ip_port, reconnected_cb=nats_reconnected_cb, disconnected_cb=nats_disconnected_cb,
                                    error_cb=nats_error_cb, connect_timeout=3, max_reconnect_attempts=-1)
                self.config.logger.info("Connected to NATS Server!")
                self.is_nats_connected = True
            except asyncio.TimeoutError:
                self.config.logger.error("Timeout trying to await nats connect")
            except ConnectionRefusedError:
                self.config.logger.error("Connect refused trying to connect to nats")
            except Exception as e:
                self.config.logger.error("Unable to connect to NATS")

            # Create subscriber for nats
            try:
                await self.nc.subscribe(self.config.nats_request_topic, cb = self.get_file_path_from_nats)
            except Exception as e:
                self.config.logger.warn(f"Failed to create nats request subscription with exception {e}")

    # Nats request callback
    async def get_file_path_from_nats(self, msg):

        data = msg.data.decode()
        msg_json_object = json.loads(data)

        rosbag_path = msg_json_object["filepath"]
        self.config.logger.info(f"Received nats request to process {rosbag_path}")

        # Add rosbag name to queue
        self.rosbag_queue.append(rosbag_path)

    async def process_rosbag_queue(self):
        # This task is responsible for processing the rosbag in the queue - As long as the queue is not empty - keep processing
        while True:
            if not self.rosbag_parser.is_processing and self.rosbag_queue:
                # Get the mysql entry name: org-name/<bag-file.mcap>
                rosbag_complete_path = Path(self.rosbag_queue[0])
                rosbag_mysql_filename = str(rosbag_complete_path.relative_to(Path(self.config.upload_destination_path)))

                # Update mysql status to Processing
                self.update_mysql_entry(rosbag_mysql_filename, ProcessingStatus.IN_PROGRESS.value)

                self.last_processed_rosbag = rosbag_mysql_filename

                processing_status, processing_err_msg = await self.rosbag_parser.process_rosbag(self.rosbag_queue.pop(0))
                # Update mysql entry for rosbag based on whether processing was successful or not
                self.update_mysql_entry(rosbag_mysql_filename, processing_status, processing_err_msg)

            await asyncio.sleep(1.0)

    def create_mysql_conn(self):

        try:
            conn = mysql.connector.connect(user= self.config.mysql_user, password= self.config.mysql_password,
                            host= self.config.mysql_host,
                            database= self.config.mysql_db, port = self.config.mysql_port)
            self.config.logger.info("Connected to MySQL database!")
            return conn
        except mysql.connector.Error as err:
            self.config.logger.error(f"Error connecting to mysql database: {err.msg}")


    def update_mysql_entry(self, file_name, process_status, process_error_msg="NA"):
        # This method updates the mysql database entry for the rosbag to process
        # Update the update fields with update values
        if not self.mysql_conn.is_connected():
            # TODO restart service if not connected
            self.config.logger.error("Mysqldb not connected")


        try:
            cursor = self.mysql_conn.cursor()

            # Update the given tries with processing status and error msg
            query = """UPDATE file_infos SET process_status=%s, process_error_msg=%s WHERE original_filename=%s"""
            cursor.execute(query, (process_status, process_error_msg, file_name))
            self.mysql_conn.commit()

            self.config.logger.info(f"Updated mysql entry for {file_name} to {process_status}")
            cursor.close()

        except mysql.connector.Error as e:
            self.config.logger.error(f"Failed to update mysql table with error: {e}")
