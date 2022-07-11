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

if [[ "$BRANCH" = "develop" ]]; then
      git clone --depth=1 https://github.com/usdot-fhwa-stol/carma-msgs.git --branch  $BRANCH
      git clone --depth=1 https://github.com/usdot-fhwa-stol/carma-ssc-interface-wrapper.git --branch $BRANCH
      git clone --depth=1 https://github.com/usdot-fhwa-stol/novatel_gps_driver.git --branch $BRANCH
      git clone https://github.com/usdot-fhwa-stol/carma-utils.git --branch $BRANCH
else
      git clone --depth=1 https://github.com/usdot-fhwa-stol/carma-msgs.git --branch develop
      git clone --depth=1 https://github.com/usdot-fhwa-stol/carma-ssc-interface-wrapper.git --branch develop
      git clone --depth=1 https://github.com/usdot-fhwa-stol/novatel_gps_driver.git --branch develop
      git clone https://github.com/usdot-fhwa-stol/carma-utils.git --branch develop
fi 

git clone https://github.com/NewEagleRaptor/raptor-dbw-ros2.git --branch foxy
cd raptor-dbw-ros2
git reset --hard 4ad958dd07bb9c7128dc75bc7397bc8f5be30a3c
cd ..

git clone https://github.com/astuff/pacmod3.git --branch ros2_master
cd pacmod3
sudo git reset --hard 159ef36f26726cf8d7f58e67add8c8319a67ae85
cd ..

git clone https://github.com/astuff/kvaser_interface.git --branch ros2_master
cd kvaser_interface
sudo git reset --hard d7ea2fb82a1b61d0ce4c96d1422599f7ee6ed1b7
cd ..

git clone https://github.com/astuff/automotive_autonomy_msgs.git --branch master
cd automotive_autonomy_msgs
sudo git reset --hard 191dce1827023bef6d69b31e8c2514cf82bf10c5
cd ..

git clone https://github.com/astuff/astuff_sensor_msgs 
cd astuff_sensor_msgs
git checkout 41d5ef0c33fb27eb3c9ba808b51332bcce186a83

# Disable ibeo_msgs
cd ibeo_msgs
echo "" > COLCON_IGNORE
cd ../astuff_sensor_msgs
echo "" > COLCON_IGNORE
