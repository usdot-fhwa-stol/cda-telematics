from kafka import KafkaConsumer
# from .config import params
import json

class KafkaRead():

    #Creates a KafkaConsumer object that connects to the Kafka port 9092
    def __init__(self):

        #auto_offset_reset handles where consumer restarts reading after breaking down or being turned off 
        #("latest" --> start reading at the end of the log, "earliest" --> start reading at latest committed offset)
        #group_id is the consumer group to which this belongs (consumer needs to be part of group to make auto commit work)
        self.consumer = KafkaConsumer(
            bootstrap_servers=['localhost:9092'],
            auto_offset_reset='earliest',
            enable_auto_commit=True,
            group_id='my-group',
            value_deserializer=lambda x: json.loads(x.decode('utf-8')))
        

    #Returns a list of all available carma streets topics
    def list_topics(self):
        topic_list = []
        for topic in self.consumer.topics():
            topic_list.append(topic)
        
        return topic_list

    #Subscribes to the input list of carma streets topics
    #Topic subscriptions are not incremental: this list will replace the current assignment (if there is one).
    def topic_subscribe(self, topic_list):
        try:
            self.consumer.subscribe(topics=topic_list)
            #TODO need to figure out way to print out topics we failed to subscribe to
            print("Successfully subscribed to the following topics: " + str(topic_list))
        except:
            print("Error subscribing to a topic")

    #read the kafka data over the specified topic
    def kafka_read(self):
        for message in self.consumer:
            message = message.value
            timestamp = message['metadata']['timestamp']
            intersection = message['metadata']['intersection_type']
            payload = message['payload']

            print("Timestamp: " + str(timestamp) + " intersection: " + str(intersection) + " payload: " + str(payload))