#!/bin/bash
set -e

source /opt/ros/foxy/setup.bash
source /home/ros2_ws/install/setup.bash

ros2 launch ros2_nats_bridge ros2_nats_bridge_launch.py