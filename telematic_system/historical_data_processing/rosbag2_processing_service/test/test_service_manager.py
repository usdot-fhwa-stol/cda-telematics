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
import json
import datetime
import os
import tempfile
import asyncio

from unittest import TestCase
from unittest.mock import patch, MagicMock, AsyncMock
from nats.aio.client import Client as NATS
from influxdb_client import InfluxDBClient

from rosbag2_processing_service.config import Config
from rosbag2_processing_service.service_manager import ServiceManager
from rosbag2_processing_service.rosbag_processor import Rosbag2Parser


class ServiceManagerTestClass(TestCase):

    @pytest.mark.asyncio
    def test_service_manager_declare(self):

        self.assertTrue(True)