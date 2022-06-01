from .ros2_nats_bridge_node import Ros2NatsBridgeNode

import asyncio
import rclpy

class Ros2NatsBridge():

    async def spinning(self, node):
        while rclpy.ok():
            rclpy.spin_once(node, timeout_sec=0.01)
            await asyncio.sleep(0.001)

    async def run(self, loop):

        logger = rclpy.logging.get_logger('ros2_nats_bridge')

        # init ros2
        rclpy.init()

        ros2_nats_bridge = Ros2NatsBridgeNode()

        spin_task = loop.create_task(self.spinning(ros2_nats_bridge))

        task1 = loop.create_task(ros2_nats_bridge.nats_connection())

        task2 = loop.create_task(ros2_nats_bridge.register_node())

        task3 = loop.create_task(ros2_nats_bridge.create_custom_topic_subscribers())

        try:
            await spin_task, task1, task2, task3
        except asyncio.exceptions.CancelledError:
            logger.error("asyncio.exceptions.CancelledError")

        rclpy.shutdown()

    def start(self):
        logger = rclpy.logging.get_logger('ros2_nats_bridge')
        loop = asyncio.get_event_loop()
        try:
            loop.run_until_complete(self.run(loop=loop))
        except KeyboardInterrupt:
            logger.info("Received exit, Exiting.")