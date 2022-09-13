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
from kafka_consumer import KafkaConsume
from nats_publish import NatsPublish
import sys
import yaml
import asyncio

def main(args=None):

    #Retrieve config values
    with open('../config/params.yaml', 'r') as file:
        config = yaml.safe_load(file)

    kafka_ip = config['streets_nats_bridge']['streets_parameters']['KAFKA_BROKER_IP']
    kafka_port = config['streets_nats_bridge']['streets_parameters']['KAFKA_BROKER_PORT']
    nats_ip = config['streets_nats_bridge']['streets_parameters']['NATS_IP']
    nats_port = config['streets_nats_bridge']['streets_parameters']['NATS_PORT']
    unit_id = config['streets_nats_bridge']['streets_parameters']['UNIT_ID']
    unit_type = config['streets_nats_bridge']['streets_parameters']['UNIT_TYPE']

    #Attempt to create a kafka consumer 
    try:
        kafka_consumer = KafkaConsume(kafka_ip, kafka_port)
    except:
        print("No CARMA Streets Kafka broker available..exiting")
        sys.exit(0)

    #If a connection was made, subscribe to all topics and read in data
    if kafka_consumer.getConsumerStatus():
        carma_streets_topics = kafka_consumer.list_topics()       
        
        # Create asyncio loop and Nats publisher object
        loop = asyncio.get_event_loop()
        nats_publisher = NatsPublish(nats_ip, nats_port, unit_id, unit_type, carma_streets_topics)

        #Create tasks to connect to the nats server and register this unit
        tasks = [
            loop.create_task(kafka_consumer.topic_subscribe(carma_streets_topics)),
            loop.create_task(nats_publisher.nats_connect()),
            loop.create_task(nats_publisher.register_unit()),
            # loop.create_task(kafka_consumer.kafka_read()),
            loop.create_task(nats_publisher.available_topics()),
            loop.create_task(nats_publisher.publish_topics())
        ]

        loop.run_forever()
        loop.run_until_complete(asyncio.wait(tasks))
        loop.close()

if __name__ == '__main__':
    main()
