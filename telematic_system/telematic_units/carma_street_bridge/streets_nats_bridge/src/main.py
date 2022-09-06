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
from kafka_consumer import KafkaRead

def main(args=None):  
    #Create a kafka consumer and list all available carma streets topics
    kafka_consumer = KafkaRead()
    carma_streets_topics = kafka_consumer.list_topics()

    #Attempt to subscribe to all topics and read in data
    kafka_consumer.topic_subscribe(carma_streets_topics)
    kafka_consumer.kafka_read()

if __name__ == '__main__':
    main()
