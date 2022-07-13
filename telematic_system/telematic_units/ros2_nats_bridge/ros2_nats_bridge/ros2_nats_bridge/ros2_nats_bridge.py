#
# Copyright (C) 2022 LEIDOS.
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

# from .ros2_nats_bridge_node import Ros2NatsBridgeNode

# import asyncio
# import rclpy

# class Ros2NatsBridge():

#     async def spinning(self, node):
#         while rclpy.ok():
#             rclpy.spin_once(node, timeout_sec=0.01)
#             await asyncio.sleep(0.001)

#     async def run(self, loop):

#         logger = rclpy.logging.get_logger('ros2_nats_bridge')

#         rclpy.init()

#         ros2_nats_bridge = Ros2NatsBridgeNode()

#         spin_task = loop.create_task(self.spinning(ros2_nats_bridge))

#         task1 = loop.create_task(ros2_nats_bridge.nats_connection())

#         task2 = loop.create_task(ros2_nats_bridge.register_node())

#         task3 = loop.create_task(ros2_nats_bridge.create_custom_topic_subscribers())

#         try:
#             await spin_task, task1, task2, task3
#         except asyncio.exceptions.CancelledError:
#             logger.error("asyncio.exceptions.CancelledError")

#         rclpy.shutdown()

#     def start(self):
#         logger = rclpy.logging.get_logger('ros2_nats_bridge')
#         loop = asyncio.get_event_loop()
#         try:
#             loop.run_until_complete(self.run(loop=loop))
#         except KeyboardInterrupt:
#             logger.info("Received exit, Exiting.")