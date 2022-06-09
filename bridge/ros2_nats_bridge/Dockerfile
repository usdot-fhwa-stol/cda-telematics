FROM ros:foxy

SHELL ["/bin/bash", "-c"]

WORKDIR /home/ros2_ws

RUN set -xe \
    && apt-get update \
    && apt-get install -y git python3-pip

RUN pip install nats-py

COPY ros2_nats_bridge src/ros2_nats_bridge

RUN src/ros2_nats_bridge/docker/checkout.sh

RUN source /opt/ros/foxy/setup.bash && \
    colcon build

ENTRYPOINT ["src/ros2_nats_bridge/docker/ros_entrypoint.sh"]
