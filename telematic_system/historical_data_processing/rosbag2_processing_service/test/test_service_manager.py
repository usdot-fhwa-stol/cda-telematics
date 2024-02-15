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

from rosbag2_processing_service.service_manager import ServiceManager
from rosbag2_processing_service.rosbag_processor import Rosbag2Parser

@pytest.fixture
def mock_influxdb_client():
    with patch('rosbag2_processing_service.ServiceManager.InfluxDBClient') as MockClient:
        # Mock the write_api() method
        mock_write_api = MagicMock()
        MockClient.return_value.write_api.return_value = mock_write_api
        yield MockClient

@pytest.fixture
def mock_nats_client():
    with patch('rosbag2_processing_service.ServiceManager.NATS') as MockNATS:

        async def mock_subscribe(subject, cb, *args, **kwargs):
            mock_nats_client.callback = cb
            return None

        # Mock the connect and subscribe methods
        MockNATS.return_value.connect = AsyncMock(return_value=None)  # Simulates successful connection
        MockNATS.return_value.subscribe = mock_subscribe
        mock_nats_client.callback = None
        yield MockNATS

class ServiceManagerTestClass(TestCase):

    @pytest.mark.asyncio
    async def test_service_manager_declare(self):

        assert os.getenv("INFLUX_ORG") == "my-org"

        service_manager = ServiceManager()
        await service_manager.nats_connect()
        # Assertions to ensure connect was called.
        mock_nats_client.return_value.connect.assert_awaited_once()


        # Ensure the subscription callback has been captured
        assert mock_nats_client.callback is not None

        # Mock NATS message
        class MockMessage:
            def __init__(self, data):
                self.data = data.encode()  # Simulating NATS message data as bytes

        # Simulate receiving a message
        mock_message = MockMessage(json.dumps({"filepath": "something/rosbag2.mcap"}))
        await mock_nats_client.callback(mock_message)


        assert "rosbag2.mcap" in service_manager.rosbag_queue
