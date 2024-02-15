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

from mcap_ros2.reader import read_ros2_messages
import json
import re
import time
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import ASYNCHRONOUS

import asyncio
from pathlib import Path

class Rosbag2Parser:
    """
    @class Rosbag2Parser
    @brief Handles parsing of ROS2 bag files and uploading data to InfluxDB.

    @details Initializes the Rosbag2Parser with all necessary configurations for processing and uploading ROS2 mcap bag data to
            InfluxDB. This class is responsible for parsing ROS bag files, extracting relevant data based on configuration, and uploading
            the data to an InfluxDB instance.

    Parameters:
        influx_bucket (str): Name of the InfluxDB bucket for data storage.
        influx_org (str): Name of the organization for InfluxDB.
        influx_token (str): Authentication token for InfluxDB.
        influx_url (str): URL to the InfluxDB instance.
        topic_exclusion_list (str): List of topics to be excluded from the parsing.
        log_dir (str): Directory to read rosbags from.
        to_str_fields (str): Fields in the ROS2 message to force to string type.
        ignore_fields (str): Fields in the ROS2 message to ignore during parsing.
        logger (logging.Logger): Logger object for recording processing activities.
    """
    def __init__(self, influx_bucket, influx_org, influx_token, influx_url, topic_exclusion_list, s3_mounted_dir, to_str_fields, ignore_fields, logger, accepted_file_extensions):

        # Set influxdb parameters
        self.influx_bucket = influx_bucket
        self.influx_org = influx_org
        self.influx_client = InfluxDBClient(url=influx_url, token=influx_token, org=influx_org)
        self.topic_exclusion_list = topic_exclusion_list
        self.s3_mounted_dir = s3_mounted_dir
        self.logger = logger

        #Fields in the ros message to force to string type.
        self.to_str_fields= to_str_fields
        # Fields in the ros message to ignore
        self.ignore_fields= ignore_fields

        # Create write API
        self.write_api = self.influx_client.write_api(write_options=ASYNCHRONOUS)

        self.accepted_file_extensions = accepted_file_extensions

        # Processing status
        self.is_processing = False


    async def process_rosbag(self,rosbag_path):

        rosbag2_name = Path(rosbag_path).name

        if Path(rosbag2_name).suffix not in self.accepted_file_extensions:
            raise Exception(f"File type not acceptable for {rosbag2_name}")

        measurement_name = Path(rosbag2_name).stem # Measurement name is rosbag name without mcap extension

        if self.s3_mounted_dir:
            rosbag_path = Path(self.s3_mounted_dir) / Path(rosbag_path)

        # Load the rosbag from the config directory
        for msg in read_ros2_messages(rosbag_path):
            if msg.channel.topic in self.topic_exclusion_list:
                continue

            try:
                topic = msg.channel.topic
                ros_msg = msg.ros_msg
                msg_attributes = self.extract_attributes(ros_msg)
                msg_timestamp = msg.publish_time_ns

                record = f"{measurement_name},topic_name={topic},"

                for attr_name, attr_value in msg_attributes:
                    if attr_name in self.ignore_fields:
                        continue

                    elif attr_name in self.to_str_fields:
                        attr_value = f'"{attr_value}"'
                        record += f"{attr_name}={attr_value},"

                    elif isinstance(attr_value, list):  # Handle arrays
                        record += f'{attr_name}="{str(attr_value)}",'
                    else:
                        if isinstance(attr_value, str):
                            attr_value = f'"{attr_value}"'  # Correctly format string values
                        record += f"{attr_name}={attr_value},"


                # Remove last comma
                record = record[:-1]
                # Add timestamp at the end
                record += f" timestamp={msg_timestamp}"
                #Write record to influx
                self.write_api.write(bucket=self.influx_bucket, org=self.influx_org, record=record)
            except InfluxDBClientError as e:
                self.logger.error("Error from Influx Client: " + str(e))
            except Exception as e:
                self.logger.warn(f"Failed to process ros message with exception: " + str(e))
        self.logger.info(f"Completed rosbag processing for {rosbag2_name}")
        self.is_processing = False


    def extract_attributes(self, obj, parent_attr=None):
        attributes = []
        for attr_name in dir(obj):

            if callable(getattr(obj, attr_name)) or attr_name.startswith("_"):
                continue

            try:
                attr_value = getattr(obj, attr_name)
                if parent_attr:
                    attr_name = f"{parent_attr}.{attr_name}"
                if hasattr(attr_value, '__dict__'):
                    # Recursively extract attributes for nested objects
                    nested_attributes = self.extract_attributes(attr_value, attr_name)
                    attributes.extend(nested_attributes)
                else:
                    attributes.append((attr_name, attr_value))
            except Exception as e:
                self.logger.error("Unable to get attributes for ros message with exception: " + str(e))

        return attributes
