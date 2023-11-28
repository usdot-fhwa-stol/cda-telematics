package com.telematic.telematic_cloud_messaging.nats_influx_connection;

import io.nats.client.*;
import java.util.List;
import java.util.ArrayList;
import java.nio.charset.StandardCharsets;
import org.slf4j.LoggerFactory;
import org.slf4j.Logger;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.json.JSONArray;
import org.json.JSONObject;
import java.util.concurrent.CancellationException;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;
import java.util.Arrays;

/**
 * The NatsConsumer object creates a connection to the telematic nats server and subscribes to 
 * all available subjects with ".data" in the subject name. It instantiates an InfluxDataWriter object 
 * that is used to publish the received data to the Influx database.
 */
public class NatsConsumer {
    //URI where the NATS service is hosted
    String nats_uri;
    //Number of reconnect attempts to make to NATS
    int nats_max_reconnects;
    //String used for subscribing to various subjects
    String nats_subscribe_str;
    //boolean for if we are connected to NATS
    boolean nats_connected;
    //connection object
    Connection nc;
    //global list of all available topics from registered units
    List<String> topic_list;
    //configurable int used for number of topics to assign per dispatcher
    int topics_per_dispatcher;
    //list of registered unts
    List<String> unit_id_list;
    //String for if this NatsConsumer is assigned to platform, streets, or cloud data
    String unit_type;
    private static final Logger logger = LoggerFactory.getLogger(NatsConsumer.class);

    /**
     * Constructor to instantiate NatsConsumer object
     */
    public NatsConsumer(String nats_uri, String nats_subscribe_str, int nats_max_reconnects, int topics_per_dispatcher,
    String unit_ids, String unit_type) {
        logger.info(unit_type + " creating new NatsConsumer");

        this.nats_uri = nats_uri;
        this.nats_subscribe_str = nats_subscribe_str;
        this.nats_max_reconnects = nats_max_reconnects;
        this.topics_per_dispatcher = topics_per_dispatcher;
        this.unit_type = unit_type;

        nats_connected = false;
        nc = null;
        topic_list = new ArrayList<String>();
        unit_id_list = Arrays.asList(unit_ids.split(","));
        logger.info(unit_type + " NatsConsumer unit id list: " + unit_id_list);
    }

    /**
     * @return true if NatsConsumer is connected to nats server
     */
    public boolean getNatsConnected() {
        return nats_connected;
    }

    /**
     * @return nats_uri ip address of nats server
     */
    public String getNatsURI() {
        return nats_uri;
    }

    /**
     * Attempt to connect to the nats server using the uri from the application.properties file
     * @param uri The uri of the nats server to connect to
     */
    public void nats_connect() {    
        try {
            Options options = new Options.Builder().server(nats_uri).maxReconnects(nats_max_reconnects).build();
            nc = Nats.connect(options);
            logger.info(unit_type + " NatsConsumer successfully connected to nats server");

            nats_connected = true;
        }
        catch (Exception e) {
            logger.error(ExceptionUtils.getStackTrace(e));
        }
    }
   
    /**
     * This method is used to get the list of available topics for each unit that is stored in NATS and updatte
     * the topic list variable
     */
    public void updateAvailableTopicList() {
        
        for (String unit_id: unit_id_list) {
            try 
            {
                //Use nats request/reply to get available topics for the unit
                String available_topic_string = unit_id + ".available_topics";
                Future<Message> future = nc.request(available_topic_string, " ".getBytes(StandardCharsets.UTF_8));
                Message msg;
                msg = future.get();
                String reply = new String(msg.getData(), StandardCharsets.UTF_8);
                logger.debug(unit_type + " NatsConsumer available topics request. Reply: " + reply);

                JSONObject jsonObject = new JSONObject(reply); 
                JSONArray topicList = jsonObject.getJSONArray("topics");

                //Add the topics to the topic list if they don't already exist
                for(int i=0; i<topicList.length(); i++) 
                {
                    String topicName = topicList.getJSONObject(i).getString("name");
                    if (!topic_list.contains(topicName)) {
                        topic_list.add(topicName);
                        logger.info(unit_type + " NatsConsumer added to topic list: " + topicName);
                    }
                }

            } 
            catch (InterruptedException | ExecutionException | CancellationException e) 
            {
                logger.error(unit_type + " NatsConsumer no topic response from unit id: " + unit_id);
            }
            catch (Exception e) {
                logger.error(ExceptionUtils.getStackTrace(e));
            }
        }     
    }

    /**
     * Helper method that is used to dynamically create new Dispatcher objects that publish to Influx when a message is received
     * @param influxDataWriter the Influx writer object
     * @return the created Dispatcher
     */
    public Dispatcher createNewDispatcher(InfluxDataWriter influxDataWriter) {
        Dispatcher d = nc.createDispatcher((msg) -> {
            String str = new String(msg.getData(), StandardCharsets.UTF_8);

            if(nats_subscribe_str.equals(influxDataWriter.config_.cloud_subscription_topic)){
                influxDataWriter.publishCloudData(str);
            }
            else{
                influxDataWriter.publish(str);
            }
        });
        
        return d;
    }
    
    /**
     * Create an asynchronous subsciption to available subjects and publish to influxdb using the InfluxDataWriter
     */
    public void async_subscribe(InfluxDataWriter influxDataWriter, List<String> newTopicList) {
        logger.info(unit_type + " NatsConsumer in async subscribe");

        //get size of the new topic list
        int newTopicListSize = newTopicList.size();

        //calculate the number of dispatchers to create based on the topic list size
        int numberDispatchers = 1;
        
        //if there is a remainder in division, need to add 1 dispatcher 
        if ((newTopicListSize % topics_per_dispatcher) > 0) {
            numberDispatchers = (newTopicListSize / topics_per_dispatcher) + 1;
        }
        //if the new topic list size is a multiple of the topics_per_dispatcher, simply divide the two
        else {
            numberDispatchers = newTopicListSize / topics_per_dispatcher;
        }

        int iterator = 0;

        //Create desired number of dispatchers based on number of topics, and configured topic per dispatcher value
        for (int i = 0; i < numberDispatchers; i++) {
            logger.info(unit_type + " NatsConsumer creating dispatcher number " + String.valueOf(i));

            Dispatcher newDispatcher = createNewDispatcher(influxDataWriter);
            //Get the topics that this dispatcher should subscribe to
            List<String> topicsToSubscribe = new ArrayList<String>();

            //First check if the (newTopicListSize - iterator) is smaller than the topics_per_dispatcher
            //If it is, the sublist will start at the iterator and go to the end of the list
            //NOTE: subList is between first parameter, inlusive, to second parameter, exclusive
            if ((newTopicListSize - iterator) < topics_per_dispatcher) {
                topicsToSubscribe = newTopicList.subList(iterator, newTopicListSize);
            }
            //Get the next topics_per_dispatcher elements and update the iterator
            else {
                topicsToSubscribe = newTopicList.subList(iterator, iterator+topics_per_dispatcher);

                iterator += topics_per_dispatcher;
            }

            //Iterate through and subscribe to each topic
            for (String topic: topicsToSubscribe) {
                //need to remove slashes from topic name to match nats subject format
                String topicStr = topic.replace("/", "");
                newDispatcher.subscribe(nats_subscribe_str+topicStr);
                logger.info(unit_type + " NatsConsumer dispatcher " + String.valueOf(i) + " subscribed to " + nats_subscribe_str+topicStr);
            }
        }       
    }

    /**
     * This will be run every 30 seconds to update the global topic list variable and call async_subscribe
     * to create dispatchers for these new topics
     */
    public void unitStatusCheck(InfluxDataWriter influxDataWriter) {
        logger.info(unit_type + " NatsConsumer checking for new topics");
        //Set topic_list_old to the current topic_list
        List<String> topic_list_old = new ArrayList<String>(topic_list);

        //update the topic_list
        this.updateAvailableTopicList();

        //Create a copy of the current topic list and compare with the old topic list copy
        List<String> currentListCopy =  new ArrayList<String>(topic_list);
        //Remove all variable that were in the topic_list_old variable. This leaves only the new topics
        //in this currentListCopy variable
        currentListCopy.removeAll(topic_list_old);

        //Check if there are newly added elements and create dispatchers using async_subscribe
        if (currentListCopy.size() > 0)
        {
            this.async_subscribe(influxDataWriter, currentListCopy);
        }
        
    }
}
