FROM usdotfhwastoldev/autoware.ai:develop AS base

USER carma

SHELL ["/bin/bash", "-c"]

RUN set -xe \
    && sudo apt-get update \
    && sudo apt-get install -y \
    git \
    vim \
    python3-pip

RUN sudo pip install --upgrade pip nats-py

FROM base AS dep

RUN mkdir /home/carma/ws
WORKDIR /home/carma/ws

COPY --chown=carma ros2_nats_bridge/docker/checkout.sh src/ros2_nats_bridge/docker/checkout.sh
RUN sudo src/ros2_nats_bridge/docker/checkout.sh

COPY --chown=carma ros2_nats_bridge/docker/install.sh src/ros2_nats_bridge/docker/install.sh
RUN src/ros2_nats_bridge/docker/install.sh

FROM base AS install

WORKDIR /home/carma/ws

COPY --from=dep /home/carma/ws/build /ws/build
COPY --from=dep /home/carma/ws/install /ws/install

COPY --chown=carma ros2_nats_bridge/docker/ros_entrypoint.sh ros_entrypoint.sh
RUN chmod +x ros_entrypoint.sh

COPY --chown=carma ros2_nats_bridge src/ros2_nats_bridge

RUN source /opt/ros/foxy/setup.bash && \
    sudo colcon build

RUN sudo rm -rf src /var/lib/apt/lists/*

RUN echo "source /ws/install/setup.bash" >> ~/.bashrc

CMD ["bash"]