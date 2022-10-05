FROM ros:foxy-ros1-bridge AS base

SHELL ["/bin/bash", "-c"]

RUN set -xe \
    && sudo apt-get update \
    && sudo apt-get install -y \
    git \
    vim \
    python3-pip

RUN sudo pip install --upgrade pip nats-py

FROM base AS dep

WORKDIR /ws

COPY ros2_nats_bridge/docker/checkout.sh src/ros2_nats_bridge/docker/checkout.sh
RUN sudo src/ros2_nats_bridge/docker/checkout.sh

COPY ros2_nats_bridge/docker/install.sh src/ros2_nats_bridge/docker/install.sh
RUN src/ros2_nats_bridge/docker/install.sh

FROM base AS install

WORKDIR /ws
COPY --from=dep /ws/build /ws/build
COPY --from=dep /ws/install /ws/install

COPY ros2_nats_bridge/docker/ros_entrypoint.sh ros_entrypoint.sh
RUN chmod +x ros_entrypoint.sh

COPY ros2_nats_bridge src/ros2_nats_bridge

RUN source /opt/ros/foxy/setup.bash && \
    colcon build

RUN sudo rm -rf src /var/lib/apt/lists/*

RUN echo "source /ws/install/setup.bash" >> ~/.bashrc

CMD ["bash"]