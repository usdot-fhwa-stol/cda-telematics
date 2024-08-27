#
# Copyright (C) 2024 LEIDOS.
#
# Licensed under the Apache License, Version 2.0 (the "License"); you may not
# use this file except in compliance with the License. You may obtain a copy of
# the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
# WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
# License for the specific language governing permissions and limitations under
# the License.
#

import asyncio
from .config import Config
from .config import ProcessingStatus
from .service_manager import ServiceManager
from threading import Event, Thread


def main():

    def start_background_loop(loop: asyncio.AbstractEventLoop, stop_event: Event) -> None:
        asyncio.set_event_loop(loop)
        while not stop_event.is_set():
            loop.run_until_complete(asyncio.sleep(0.1))
        loop.stop()
        loop.close()

    config = Config()

    service_manager = ServiceManager(config)
    stop_event = Event()

    nats_loop = asyncio.new_event_loop()
    t1 = Thread(target=start_background_loop, args=(nats_loop, stop_event))
    t1.start()

    rosbag_processing_loop = asyncio.new_event_loop()
    t2 = Thread(target=start_background_loop, args=(rosbag_processing_loop, stop_event))
    t2.start()


    try:
        nats_future = asyncio.run_coroutine_threadsafe(service_manager.nats_connect(), nats_loop)
        rosbag_processing_future = asyncio.run_coroutine_threadsafe(service_manager.process_rosbag_queue(), rosbag_processing_loop)

        nats_future.result()
        rosbag_processing_future.result()
    except Exception as e:

        # If service crashed before updating processing status try update
        if service_manager.rosbag_parser.is_processing:
            try:
                service_manager.update_mysql_entry(service_manager.last_processed_rosbag, ProcessingStatus.ERROR.value, "Uncaught error while processing rosbag")
            except Exception as e:
                service_manager.config.logger.error(f"Could not update processing status for rosbag {service_manager.last_processed_rosbag}")

        stop_event.set()
    finally:
        t1.join()
        t2.join()


if __name__ == '__main__':
    main()
