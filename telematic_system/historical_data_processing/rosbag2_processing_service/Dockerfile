FROM ros:foxy as base

SHELL ["/bin/bash", "-c"]

RUN set -xe \
    && sudo apt-get update -y \
    && sudo apt-get install -y \
    git \
    vim \
    python3-pip

FROM base AS dep

WORKDIR /ws

COPY rosbag2_processing_service src/rosbag2_processing_service
RUN sudo src/rosbag2_processing_service/docker/checkout.sh
RUN src/rosbag2_processing_service/docker/install.sh

COPY rosbag2_processing_service/docker/entrypoint.sh
RUN chmod +x entrypoint.sh

RUN sudo rm -rf src /var/lib/apt/lists/*

RUN echo "source /ws/install/setup.bash" >> ~/.bashrc

CMD ["bash"]