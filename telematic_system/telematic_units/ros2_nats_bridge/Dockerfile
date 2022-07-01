FROM ros:foxy AS base

SHELL ["/bin/bash", "-c"]

RUN set -xe \
    && apt-get update \
    && apt-get install -y \
    git \
    vim \
    python3-pip

RUN pip install --upgrade pip nats-py

FROM base AS workspace

WORKDIR /ws

RUN ls -a && pwd
COPY telematic_system/telematic_units/ros2_nats_bridge/ros2_nats_bridge/docker/checkout.sh ws/ros2_nats_bridge/docker/checkout.sh

RUN ws/ros2_nats_bridge/docker/checkout.sh

RUN source /opt/ros/foxy/setup.bash && \
    colcon build

FROM base AS install

WORKDIR /ws

COPY --from=workspace /ws/build /ws/build
COPY --from=workspace /ws/install /ws/install

COPY telematic_system/telematic_units/ros2_nats_bridge/ros2_nats_bridge/docker/ros_entrypoint.sh ros_entrypoint.sh

COPY telematic_system/telematic_units/ros2_nats_bridge ws/ros2_nats_bridge

RUN source /opt/ros/foxy/setup.bash && \
    colcon build

RUN rm -rf src /var/lib/apt/lists/*

RUN echo "source /ws/install/setup.bash" >> ~/.bashrc

CMD ["bash"]
