#
# Copyright (C) 2022 LEIDOS.
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
from streets_nats_bridge import StreetsNatsBridge
import sys
import asyncio

def main(args=None):           
    #Create StreetsNatsBridge object and asyncio loop
    streets_nats_bridge = StreetsNatsBridge()
    loop = asyncio.get_event_loop()

    #Attempt to create a kafka consumer 
    try:
        streets_nats_bridge.createKafkaConsumer()
    except:
        print("No CARMA Streets Kafka broker available..exiting")
        sys.exit(0)

    #If Kafka consumer was created, subscribe to all available carma-streets kafka topics
    if streets_nats_bridge.getConsumerStatus():
        streets_nats_bridge.topic_subscribe()

        #Create asyncio tasks for nats server operations
        loop = asyncio.get_event_loop()
        tasks = [
            loop.create_task(streets_nats_bridge.nats_connect()),
            loop.create_task(streets_nats_bridge.register_unit()),
            loop.create_task(streets_nats_bridge.available_topics()),
            loop.create_task(streets_nats_bridge.publish_topics()),
            loop.create_task(streets_nats_bridge.kafka_read())
        ]

    #Run asyncio until tasks are complete
    loop.run_forever()
    loop.run_until_complete(asyncio.wait(tasks))
    loop.close()

if __name__ == '__main__':
    main()
