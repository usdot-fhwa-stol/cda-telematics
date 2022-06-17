# ros2 nats bridge

## Overview

This is a ros2 nats bridge. this package is meant to create conection between ros nodes and nats server and allow for tranmition of data from both ends.

**Keywords:** ros2, nats, cda-telematics

### License

The source code is released under a [BSD 3-Clause license](ros_package_template/LICENSE).

The PACKAGE NAME package has been tested under [ROS] foxy on respectively Ubuntu 18.04.
This code, expect that it changes often and any fitness for a particular purpose is disclaimed.

[![Build Status]()]()

## Installation

### Building from Source

#### Dependencies

ROS: http://www.ros.org
Nats.io: https://github.com/nats-io/nats.py
carma-msgs: https://github.com/usdot-fhwa-stol/carma-msgs.git

#### Building

To build from source, clone the latest version from this repository into your catkin workspace and compile the package using

	cd ws/src
	git clone --depth=1 https://github.com/usdot-fhwa-stol/carma-msgs.git --branch  $BRANCH
    git clone --depth=1 https://github.com/usdot-fhwa-stol/cda-telematics.git --branch  $BRANCH
	cd ../
	colcon build

### Running in Docker

Docker is a great way to run an application with all dependencies and libraries bundles together. 
Make sure to [install Docker](https://docs.docker.com/get-docker/) first. 

command to start the container :

	docker run -ti --rm --name ros2_nats_bridge --network host ros2-nats-bridge:latest bash

### Unit Tests

Run the unit tests with

	colcon test --select-package ros2_nats_bridge

## Usage

Run the main node with

	ros2 launch ros2_nats_bridge ros2_nats_bridge_launch.py

    or 

    ros2 run ros2_nats_bridge main

## Config files

Config file config/params.yaml

* **params.yaml** this config file includes all the parameters needed by ros2 nats bridge

## Launch files

* **ros2_nats_bridge_launch.py:** will launch ros2 to nats bridge 

## Nodes

### ros_package_template

This node creates a bridge between nats and ros and enables the software to publish ros messages in nats framework.

#### Subscribed Topics

* **`/*`** ([all type of messages available])

	all the topics that are selected by nats server is subscribed and published.

#### Parameters

* **`NATS_SERVER_IP_PORT`** (string, default: "nats://0.0.0.0:4222")

	The IP address of nats server.



## Bugs & Feature Requests

Please report bugs and request features using the [Issue Tracker](https://github.com/usdot-fhwa-stol/cda-telematics/issues).


[ROS]: http://www.ros.org
[Nats.io]: https://github.com/nats-io/nats.py
[carma-msgs]: https://github.com/usdot-fhwa-stol/carma-msgs.git
