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
COPY telematic_system/telematic_units/carma_vehicle_bridge ws
RUN ls -a
RUN cd ws && ls -a && pwd && ros2_nats_bridge/docker/checkout.sh
COPY telematic_system/telematic_units/carma_vehicle_bridge/ros2_nats_bridge/docker/checkout.sh src/ros2_nats_bridge/docker/checkout.sh
#COPY ros2_nats_bridge/docker/checkout.sh src/ros2_nats_bridge/docker/checkout.sh
RUN sudo src/ros2_nats_bridge/docker/checkout.sh

COPY telematic_system/telematic_units/carma_vehicle_bridge/ros2_nats_bridge/docker/install.sh src/ros2_nats_bridge/docker/install.sh
RUN src/ros2_nats_bridge/docker/install.sh

#RUN source /opt/ros/foxy/setup.bash && \
    #colcon build

FROM base AS install

WORKDIR /ws

COPY --from=dep /ws/build /ws/build
COPY --from=dep /ws/install /ws/install

COPY telematic_system/telematic_units/carma_vehicle_bridge/ros2_nats_bridge/docker/ros_entrypoint.sh ros_entrypoint.sh
COPY telematic_system/telematic_units/carma_vehicle_bridge/ros2_nats_bridge src/ros2_nats_bridge

#COPY ros2_nats_bridge/docker/ros_entrypoint.sh ros_entrypoint.sh
RUN chmod +x ros_entrypoint.sh

#COPY ros2_nats_bridge src/ros2_nats_bridge

RUN source /opt/ros/foxy/setup.bash && \
    colcon build

RUN sudo rm -rf src /var/lib/apt/lists/*

RUN echo "source /ws/install/setup.bash" >> ~/.bashrc

CMD ["bash"]
