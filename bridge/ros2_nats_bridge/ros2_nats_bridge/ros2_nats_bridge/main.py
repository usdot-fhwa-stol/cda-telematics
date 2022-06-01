from .ros2_nats_bridge import Ros2NatsBridge

def main(args=None):
    ros2_nats_bridge = Ros2NatsBridge()
    ros2_nats_bridge.start()

if __name__ == '__main__':
    main()