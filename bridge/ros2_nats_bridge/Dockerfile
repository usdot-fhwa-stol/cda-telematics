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

COPY ros2_nats_bridge/docker/checkout.sh src/ros2_nats_bridge/docker/checkout.sh

RUN src/ros2_nats_bridge/docker/checkout.sh

RUN source /opt/ros/foxy/setup.bash && \
    colcon build

FROM base AS install

WORKDIR /ws

COPY --from=workspace /ws/build /ws/build
COPY --from=workspace /ws/install /ws/install

COPY ros2_nats_bridge src/ros2_nats_bridge

RUN source /opt/ros/foxy/setup.bash && \
    colcon build

RUN rm -rf src /var/lib/apt/lists/*

RUN echo "source /ws/install/setup.bash" >> ~/.bashrc

CMD ["bash"]
