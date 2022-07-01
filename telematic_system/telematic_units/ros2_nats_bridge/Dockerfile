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

COPY . ws

RUN cd ws && ls -la
Run ws/ros2_nats_bridge/docker/checkout.sh

RUN source /opt/ros/foxy/setup.bash && \
    colcon build

FROM base AS install

WORKDIR /ws

COPY --from=workspace /ws/build /ws/build
COPY --from=workspace /ws/install /ws/install

COPY ros2_nats_bridge/docker/ros_entrypoint.sh ros_entrypoint.sh

COPY ros2_nats_bridge ws/ros2_nats_bridge

RUN source /opt/ros/foxy/setup.bash && \
    colcon build

RUN rm -rf src /var/lib/apt/lists/*

RUN echo "source /ws/install/setup.bash" >> ~/.bashrc

CMD ["bash"]
