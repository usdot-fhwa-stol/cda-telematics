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
    loop = asyncio.new_event_loop()
    t = Thread(target=start_background_loop, args=(loop, stop_event))
    t.start()

    # Schedule nats_connect to run in the background loop
    asyncio.run_coroutine_threadsafe(service_manager.nats_connect(), loop)


    main_loop = asyncio.get_event_loop()
    try:
        main_loop.run_until_complete(service_manager.process_rosbag_queue())
    except Exception as e:
        print(f"Main loop encountered an error: {e}")
        stop_event.set()
        t.join()
        raise
    finally:
        main_loop.close()
        stop_event.set()
        t.join()

if __name__ == '__main__':
    main()
