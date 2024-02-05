# This task is to process a single rosbag from the queue and push the data to influx
from mcap_ros2.reader import read_ros2_messages
import json
import re
import time
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import ASYNCHRONOUS

import asyncio
import os


# TODO: Add json flattener like the messaging server


class Rosbag2Parser:
    # Class that defines the rosbag parser
    # Stores the global definitions that don't change on each iteration of rosbag processing
    # influx authentication
    def __init__(self, influx_bucket, influx_org, influx_token, influx_url, topic_exclusion_list, log_dir, logger):

        # Set influxdb parameters
        self.influx_bucket = influx_bucket
        self.influx_org = influx_org
        self.influx_client = InfluxDBClient(url=influx_url, token=influx_token, org=influx_org)
        self.topic_exclusion_list = topic_exclusion_list
        self.log_dir = log_dir
        self.logger = logger

        # Create write API
        self.write_api = self.influx_client.write_api(write_options=ASYNCHRONOUS)

        # Processing status
        self.is_processing = False


    async def process_rosbag(self,rosbag2_name):
        measurement_name = rosbag2_name.split('.')[0] # Measurement name is rosbag name without mcap extension
        rosbag_path = os.path.join(self.log_dir, rosbag2_name)


        # Load the rosbag from the config directory
        for msg in read_ros2_messages(rosbag_path):
            try:
                if msg.channel.topic not in self.topic_exclusion_list:
                    topic = msg.channel.topic
                    ros_msg = msg.ros_msg
                    msg_attributes = self.extract_attributes(ros_msg)
                    msg_timestamp = msg.publish_time_ns

                    record = f"{measurement_name},topic_name={topic},"

                    for attr_name, attr_value in msg_attributes:
                        if isinstance(attr_value, list):  # Handle arrays
                            for i, val in enumerate(attr_value):
                                record += f"{attr_name}_{i}={val},"  # Split array into individual fields
                        else:
                            if isinstance(attr_value, str):
                                attr_value = f'"{attr_value}"'  # Correctly format string values
                            record += f"{attr_name}={attr_value},"


                    # Remove last comma
                    record = record[:-1]
                    # Add timestamp at the end
                    record += f",topic={topic} timestamp={msg_timestamp}"

                    #Write record to influx
                    self.write_api.write(bucket=self.influx_bucket, org=self.influx_org, record=record)

            except Exception as e:
                self.logger.warn(f"Failed to process ros message with exception: " + str(e))

        self.is_processing = False


    def extract_attributes(self, obj, parent_attr=None):
        attributes = []
        for attr_name in dir(obj):
            if not callable(getattr(obj, attr_name)) and not attr_name.startswith("__") and not attr_name.startswith("_"):
                attr_value = getattr(obj, attr_name)
                if parent_attr:
                    attr_name = f"{parent_attr}.{attr_name}"
                if hasattr(attr_value, '__dict__'):
                    # Recursively extract attributes for nested objects
                    nested_attributes = self.extract_attributes(attr_value, attr_name)
                    attributes.extend(nested_attributes)
                else:
                    attributes.append((attr_name, attr_value))
        return attributes
