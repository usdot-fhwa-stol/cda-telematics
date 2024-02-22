#!/bin/bash

#  Copyright (C) 2024 LEIDOS.
#
#  Licensed under the Apache License, Version 2.0 (the "License"); you may not
#  use this file except in compliance with the License. You may obtain a copy of
#  the License at
#
#  http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
#  WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
#  License for the specific language governing permissions and limitations under
#  the License

#Install processing service required libraries
cd /ws/
sudo python3 -m pip install nats-py \
    influxdb \
    influxdb_client \
    mcap-ros2-support \
    pathlib \
    pytest-env \
    pytest-asyncio \
    aiounittest

source /opt/ros/foxy/setup.bash
sudo apt update
sudo apt install -y apt-utils \
                python3-pybind11 \
                ros-foxy-test-msgs \
                python3-colcon-common-extensions

# Build rosbag2
colcon build --packages-up-to rosbag2_processing_service