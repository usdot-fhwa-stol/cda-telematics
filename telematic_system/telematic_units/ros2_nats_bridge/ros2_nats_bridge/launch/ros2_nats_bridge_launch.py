from launch import LaunchDescription
from launch_ros.actions import Node
import os
from ament_index_python.packages import get_package_share_directory

def generate_launch_description():
    config = os.path.join(
        get_package_share_directory('ros2_nats_bridge'),
        'config',
        'params.yaml'
        )

    return LaunchDescription([
        Node(
            package='ros2_nats_bridge',
            executable='main',
            name='ros2_nats_bridge',
            output='screen',
            emulate_tty=True,
            parameters = [config, {"NATS_SERVER_IP_PORT": os.getenv('NATS_SERVER_IP_PORT')}],
            arguments=['--ros-args', '--log-level', 'info']
        )
    ])