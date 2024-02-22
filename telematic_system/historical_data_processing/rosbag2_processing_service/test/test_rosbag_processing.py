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

import pytest

from rosbag2_processing_service.config import Config
from rosbag2_processing_service.rosbag_processor import Rosbag2Parser
from unittest import TestCase
import asyncio
from aiounittest import AsyncTestCase

pytest_plugins = ('pytest_asyncio')


class Rosbag2ParserTestClass(AsyncTestCase):
    @pytest.mark.asyncio
    async def test_rosbag_processor_declare(self):
        config = Config()

        # Declare rosbag processor object
        rosbag_parser = Rosbag2Parser(config)
        assert rosbag_parser.config.influx_org == config.influx_org

        with pytest.raises(Exception):
            loop = asyncio.new_event_loop()
            yield loop
            await rosbag_parser.process_rosbag("incorrect_file_type.txt")
            loop.close

    def test_process_rosbag(self):
        config = Config()
        config.upload_destination_path = "./test"
        config.topic_exclusion_list = ["/topic_2"]

        rosbag_parser = Rosbag2Parser(config)
        rosbag_parser.process_rosbag("test_rosbag.mcap")

        config.to_str_fields = ["stamp"]
        config.ignore_fields = ["position"]

        rosbag_parser2 = Rosbag2Parser(config)
        rosbag_parser2.process_rosbag("test_rosbag.mcap")

        with pytest.raises(Exception):
            rosbag_parser.process_rosbag("mock_rosbag.mcap")