#  Copyright (C) 2024 LEIDOS.
#
#  Licensed under the Apache License, Version 2.0 (the "License"); you may not
#  use this file except in compliance with the License. You may obtain a copy of
#  the License at
#
#  http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
#  WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
#  License for the specific language governing permissions and limitations under
#  the License

FROM ros:foxy as base

SHELL ["/bin/bash", "-c"]

RUN sudo apt-get update -y \
    && sudo apt-get install -y \
    git \
    nano \
    python3-pip

WORKDIR /ws

COPY rosbag2_processing_service src/rosbag2_processing_service
RUN chmod +x /ws/src/rosbag2_processing_service/docker/*
RUN sudo bash /ws/src/rosbag2_processing_service/docker/checkout.sh
RUN sudo bash /ws/src/rosbag2_processing_service/docker/install.sh

COPY rosbag2_processing_service/docker/entrypoint.sh entrypoint.sh
RUN chmod +x entrypoint.sh

RUN sudo rm -rf src /var/lib/apt/lists/*

RUN echo "source /ws/install/setup.bash" >> ~/.bashrc

CMD ["bash"]