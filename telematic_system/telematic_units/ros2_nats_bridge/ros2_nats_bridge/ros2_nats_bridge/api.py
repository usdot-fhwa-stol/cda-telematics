import asyncio
import json

from rclpy.node import Node
from nats.aio.client import Client as NATS

from std_msgs.msg import String
import rosidl_runtime_py

class Ros2NatsBridgeNode(Node):

    def __init__(self):
        super().__init__('minimal_publisher')
        self.nc = NATS()
        self.registered = False
        self.subsribers_list = {}

        self.vehicle_info = {"UniteId": "vehicle_id", 
                             "UnitType": "platform"
                            }

        timer_period = 0.5  # seconds
        self.timer = self.create_timer(timer_period, self.timer_callback)
        self.i = 0

    def timer_callback(self):
        msg = String()
        msg.data = 'heartbeat: %d' % self.i
        self.get_logger().info('"%s"' % msg.data)
        self.i += 1

    async def nats_connect(self):

        async def disconnected_cb():
            self.registered = False
            self.get_logger().warn("Got disconnected...")

        async def reconnected_cb():
            self.get_logger().warn("Got reconnected...")

        async def error_cb(err):
            self.get_logger().error("{0}".format(err) )

        try:
            await self.nc.connect("nats://0.0.0.0:4222",
                            reconnected_cb=reconnected_cb,
                            disconnected_cb=disconnected_cb,
                            error_cb=error_cb,
                            max_reconnect_attempts=-1)
        finally:
            self.get_logger().warn("Client is connected To Server.")

    async def register_node(self):
        """
            send request to server to register node and waits for ack 
        """

        self.vehicle_info["TimeStamp"] = self.get_clock().now().nanoseconds
        vehicle_info_message = json.dumps(self.vehicle_info).encode('utf8')

        while(True):
            try:
                self.get_logger().debug("Server status {0}".format(self.nc.is_connected))
                if(self.nc.is_connected and not self.registered):
                    self.get_logger().debug("Registering node ... ")
                    try:
                        response = await self.nc.request("register_node", vehicle_info_message, timeout=1)
                        self.get_logger().warn("Registering node received response: {message}".format(message=response.data.decode()))
                    finally:
                        self.registered = True
            except:
                self.registered = False
                pass

            await asyncio.sleep(0.01)

    async def available_topics(self):
        """
            receives request from server and responds with available topics
        """

        async def send_list_of_topics(msg):
            self.get_logger().warn(f"Received a message on '{msg.subject} {msg.reply}': {msg.data.decode()}")

            self.vehicle_info["TimeStamp"] = self.get_clock().now().nanoseconds
            self.vehicle_info["topics"] = [{"name": name, "type": types[0]}  for name, types in self.get_topic_names_and_types()]

            message = json.dumps(self.vehicle_info).encode('utf8')
                        
            await self.nc.publish(msg.reply, message)

        while True:
            if(self.registered):
                try:
                    sub = await self.nc.subscribe("vehicle_id.available_topics", "vehicle_id", send_list_of_topics)
                finally:
                    self.get_logger().debug("available_topics")

            await asyncio.sleep(0.01)

    async def publish_topics(self):
        """
            receives request from server to create subscirber to selected topics and publish data
        """

        async def topic_request(msg):
            """
                process request message
                import message type to scope
                create subscriber for every topic in request message
            """
            self.get_logger().warn(f"Received a message on '{msg.subject} {msg.reply}': {msg.data.decode()}")
            await self.nc.publish(msg.reply, b"request received!")
            data = json.loads(msg.data.decode("utf-8"))

            topics = [v for i,v in enumerate(self.get_topic_names_and_types()) if v[0] in data["topics"]]

            for i in topics:
                topic = i[0]
                msg_type = i[1][0]

                if(topic not in self.subsribers_list):
                    self.get_logger().warn(f"Create a callback for '{topic} with type {msg_type}'.")
                    msg_type = msg_type.split('/')
                    exec("from " + msg_type[0] + '.' + msg_type[1] + " import " + msg_type[2])
                    call_back = self.CallBack(topic, self.nc, "vehicle_id")
                    self.subsribers_list[topic] = self.create_subscription(eval(msg_type[2]), topic, call_back.listener_callback, 10)

        while True:
            self.get_logger().debug("Waiting for server to select topics ...")
            try:
                sub = await self.nc.subscribe("vehicle_id.publish_topics", "worker", topic_request)
            finally:
                self.get_logger().debug("Waiting for available_topics")
            await asyncio.sleep(0.01)

    class CallBack(): 
        def __init__(self, topic_name, nc, node_id):
            """
                initilize CallBack class
                declare Nats client 
                publish message to nats server
            """

            self.node_id = node_id
            self.topic_name = node_id + ".data" + topic_name.replace("/",".")
            self.nc = nc

        async def listener_callback(self, msg):
            """
                listener callback function to publish message to nats server
                convert message to json format
            """

            json_message = json.dumps(rosidl_runtime_py.convert.message_to_ordereddict(msg)).encode('utf8')
            print("sending message on ", self.topic_name)

            await self.nc.publish(self.topic_name, json_message)
