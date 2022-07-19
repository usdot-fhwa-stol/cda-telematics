source /opt/ros/foxy/setup.bash
colcon build --packages-up-to autoware_lanelet2_msgs autoware_can_msgs
# colcon build --packages-up-to jsk_common_msgs
rm -rf src/autoware.ai
colcon build