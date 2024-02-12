#Install processing service required libraries
sudo pip install --upgrade pip nats-py
sudo pip install influxdb
sudo pip install influxdb_client
sudo pip install rosbag2-storage-mcap

# Build rosbag2
cd /ws/
source /opt/ros/foxy/setup.bash
colcon build