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
from .service_manager import ServiceManager

from dotenv import load_dotenv

load_dotenv('/home/carma/cda-telematics/telematic_system/historical_data_processing/rosbag2_processing_service/.env')


def main(args=None):

    loop = asyncio.get_event_loop()

    service_manager = ServiceManager()

    tasks = [
        loop.create_task(service_manager.nats_connect()),
        loop.create_task(service_manager.process_rosbag())
    ]

    loop.run_until_complete(asyncio.wait(tasks))

    loop.close()

if __name__ == '__main__':
    main()
