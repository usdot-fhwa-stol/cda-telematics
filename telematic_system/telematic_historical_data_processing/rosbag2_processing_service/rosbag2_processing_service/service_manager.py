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
                 self.logger.error("Unable to connect to NATS")

            # Create subscriber for nats
            try:
                await self.nc.subscribe(self.config.nats_request_topic, cb = self.get_file_path_from_nats)
            except Exception as e:
                self.config.logger.warn(f"Failed to create nats request subscription with exception {e}")

    # Nats request callback
    async def get_file_path_from_nats(self, msg):
        self.config.logger.info("Entering process nats request")

        data = msg.data.decode()
        msg_json_object = json.loads(data)

        rosbag_name = msg_json_object["filename"]

        rosbag_path = Path(self.config.upload_destination_path) / rosbag_name
        # Add rosbag name to queue
        self.rosbag_queue.append(rosbag_path)

    async def process_rosbag(self):
        # This task is responsible for processing the rosbag in the queue - As long as the queue is not empty - keep processing
        while True:
            if not self.rosbag_parser.is_processing and self.rosbag_queue:
                self.rosbag_parser.process_rosbag(self.update_first_rosbag_status())

                # TODO: Update mysql entry for rosbag based on whether processing was successful
            await asyncio.sleep(1.0)

    def create_mysql_conn(self):

        try:
            conn = mysql.connector.connect(user= self.config.mysql_host, password= self.config.mysql_password,
                              host= self.config.mysql_host,
                              database= self.config.mysql_db)
        except mysql.connector.Error as err:
            if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
                self.config.logger.error("Mysql User name or password not accepted")
            elif err.errno == errorcode.ER_BAD_DB_ERROR:
                self.config.logger.error("Mysql Database does not exist")
            else:
                self.config.logger.error(err)

        return conn


    def update_first_rosbag_status(self):
        rosbag_name = Path(self.rosbag_queue[0]).name
        self.config.logger.info(f"Entering processing for rosbag: {rosbag_name}")

        rosbag_to_process = self.rosbag_queue.pop(0)
        # TODO: Check mysql if rosbag already processed/ Create new entry for rosbag

        return rosbag_to_process

    def update_mysql_entry(self, update_fields, update_values):
        # This method updates the mysql database entry for the rosbag to process
        # Update the update fields with update values
        try:
            cursor = self.mysql_conn.cursor()
            sql_select_query = """SELECT * FROM file_infos"""
            cursor.execute(sql_select_query)
            record = cursor.fetchnone()
            self.config.logger.info(record)
        except mysql.connector.Error as e:
            self.config.error(f"Failed to update mysql table with error: {e}")
