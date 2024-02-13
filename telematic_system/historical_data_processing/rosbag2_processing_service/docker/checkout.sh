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

# Checkout rosbag2
cd /ws/src/
git clone https://github.com/ros2/rosbag2.git --branch foxy-future
cd rosbag2
git checkout 67564a42d850d0bad4bb076e359faa6b27a07d98
