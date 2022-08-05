#!/bin/bash

#  Copyright (C) 2018-2021 LEIDOS.
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
#  the License.

# CARMA packages checkout script
# Optional argument to set the root checkout directory with no ending '/' default is '~'

set -exo pipefail

dir=/ws
while [[ $# -gt 0 ]]; do
      arg="$1"
      case $arg in
            -d|--develop)
                  BRANCH=develop
                  shift
            ;;
            -r|--root)
                  dir=$2
                  shift
                  shift
            ;;
      esac
done

cd ${dir}/src


# clone carma repos

# if [[ "$BRANCH" = "develop" ]]; then
#       git clone --depth=1 https://github.com/usdot-fhwa-stol/carma-msgs.git --branch  $BRANCH
#       git clone --depth=1 https://github.com/usdot-fhwa-stol/novatel_gps_driver.git --branch $BRANCH
#       git clone --depth=1 https://github.com/usdot-fhwa-stol/carma-ssc-interface-wrapper.git --branch $BRANCH
# else
#       git clone --depth=1 https://github.com/usdot-fhwa-stol/carma-msgs.git --branch develop
#       git clone --depth=1 https://github.com/usdot-fhwa-stol/novatel_gps_driver.git --branch develop
#       git clone --depth=1 https://github.com/usdot-fhwa-stol/carma-ssc-interface-wrapper.git --branch develop
# fi 

# rm -rf carma-ssc-interface-wrapper/ssc_interface_wrapper_ros2 carma-ssc-interface-wrapper/ssc_interface_wrapper

# sudo git clone https://github.com/NewEagleRaptor/raptor-dbw-ros2.git raptor-dbw-ros2 --branch foxy 
# cd raptor-dbw-ros2
# sudo git reset --hard 4ad958dd07bb9c7128dc75bc7397bc8f5be30a3c
# cd ..

# rm -rf can_dbc_parser raptor_dbw_can raptor_dbw_joystick raptor_pdu

# # Install automotive_autonomy_msgs
# sudo git clone https://github.com/astuff/automotive_autonomy_msgs.git automotive_autonomy_msgs --branch master
# cd automotive_autonomy_msgs 
# sudo git reset --hard 191dce1827023bef6d69b31e8c2514cf82bf10c5
# cd ..

# apt-get install -y ros-foxy-lgsvl-msgs \
#                    ros-foxy-udp-msgs \
#                    ros-foxy-rosapi-msgs \
#                    ros-foxy-rosbridge-msgs \
#                    ros-foxy-automotive-platform-msgs \
#                    ros-foxy-gps-msgs \
#                    ros-foxy-autoware-auto-msgs

# sudo apt install apt-transport-https
# sudo sh -c 'echo "deb [trusted=yes] https://s3.amazonaws.com/autonomoustuff-repo/ $(lsb_release -sc) main" > /etc/apt/sources.list.d/autonomoustuff-public.list'
# sudo apt update
# sudo apt install -y ros-foxy-pacmod3-msgs ros-foxy-pcl-msgs

# sudo git clone https://github.com/usdot-fhwa-stol/autoware.ai.git
# cd autoware.ai
# sed -i.bak '/find_package(ros_environment REQUIRED)/d' messages/*/CMakeLists.txt
# sed -i.bak '/find_package(ros_environment REQUIRED)/d' jsk_common_msgs/*/CMakeLists.txt

# mv jsk_common_msgs ../carma-msgs/jsk_common_msgs
# mv jsk_recognition ../carma-msgs/jsk_recognition
# mv messages ../carma-msgs/messages

# cd ..
# rm -rf autoware.ai