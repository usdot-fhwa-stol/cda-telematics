package com.telematic.telematic_cloud_messaging.nats_influx_connection;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.CancellationException;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;

import org.apache.commons.lang3.exception.ExceptionUtils;
import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.nats.client.Connection;
import io.nats.client.Dispatcher;
import io.nats.client.Message;
import io.nats.client.Nats;
import io.nats.client.Options;

/**
 * The NatsConsumer object creates a connection to the telematic nats server and subscribes to
 * all available subjects with ".data" in the subject name. It instantiates an InfluxDataWriter object
 * that is used to publish the received data to the Influx database.
 */
public class NatsConsumer {
    //URI where the NATS service is hosted
    String natsUri;
    //Number of reconnect attempts to make to NATS
    int natsMaxReconnects;
    //String used for subscribing to various subjects
    String natsSubscribeStr;
    //boolean for if we are connected to NATS
    boolean natsConnected;
    //connection object
    Connection nc;
    //global list of all available topics from registered units
    List<String> topicList;
    //configurable int used for number of topics to assign per dispatcher
    int topicsPerDispatcher;
    //list of registered unts
    List<String> unitIdList;
    //String for if this NatsConsumer is assigned to platform, streets, or cloud data
    String unitType;
    private static final Logger logger = LoggerFactory.getLogger(NatsConsumer.class);

    /**
     * Constructor to instantiate NatsConsumer object
     */
    public NatsConsumer(String natsUri, String natsSubscribeStr, int natsMaxReconnects, int topicsPerDispatcher,
    String unitIds, String unitType) {
        logger.info("{} creating new NatsConsumer", unitType);

        this.natsUri = natsUri;
        this.natsSubscribeStr = natsSubscribeStr;
        this.natsMaxReconnects = natsMaxReconnects;
        this.topicsPerDispatcher = topicsPerDispatcher;
        this.unitType = unitType;

        this.natsConnected = false;
        this.nc = null;
        this.topicList = new ArrayList<>();
        unitIds = unitIds.replaceAll("\\s+", "");
        this.unitIdList = unitIds.isEmpty()? new ArrayList<>(): Arrays.asList(unitIds.split(","));
        logger.info("{} NatsConsumer unit id list: {}",unitType, unitIdList);
    }

    /**
     * @return true if NatsConsumer is connected to nats server
     */
    public boolean getNatsConnected() {
        return this.natsConnected;
    }

    /**
     * @return nats_uri ip address of nats server
     */
    public String getNatsURI() {
        return this.natsUri;
    }

    /**
     * Attempt to connect to the nats server using the uri from the application.properties file
     * @param uri The uri of the nats server to connect to
     */
    public void natsConnect() {
        try {
            Options options = new Options.Builder().server(natsUri).maxReconnects(natsMaxReconnects).build();
            this.nc = Nats.connect(options);
            logger.info("{} NatsConsumer successfully connected to nats server", this.unitType);
            this.natsConnected = true;
        }
        catch (InterruptedException | IOException e) {
            logger.error(ExceptionUtils.getStackTrace(e));
        }
    }

    /**
     * This method is used to get the list of available topics for each unit that is stored in NATS and updatte
     * the topic list variable
     */
    public void updateAvailableTopicList() {

        for (String unitId: unitIdList) {
            try
            {
                //Use nats request/reply to get available topics for the unit
                String availableTopicString = unitId + ".available_topics";
                Future<Message> future = nc.request(availableTopicString, " ".getBytes(StandardCharsets.UTF_8));
                Message msg = future.get();
                String reply = new String(msg.getData(), StandardCharsets.UTF_8);
                logger.debug("{} NatsConsumer available topics [{}] request. Reply: {}", this.unitType, availableTopicString, reply);

                JSONObject jsonObject = new JSONObject(reply);
                Object topicsObject = jsonObject.get("topics");

                //Add the topics to the topic list if they don't already exist
                if(topicsObject instanceof JSONArray)
                {
                    JSONArray topics = (JSONArray)topicsObject;
                    for(int i=0; i<topics.length(); i++)
                    {
                        String topicName = topics.getJSONObject(i).getString("name");
                        if (!this.topicList.contains(topicName)) {
                            this.topicList.add(topicName);
                            logger.info("{} NatsConsumer added to topic list: {}", this.unitType, topicName);
                        }
                    }
                }

            }
            catch (InterruptedException | ExecutionException | CancellationException e)
            {
                logger.error("{} NatsConsumer no topic response from unit id: {}", this.unitType, unitId);
            }
            catch (Exception e) {
                logger.error(ExceptionUtils.getStackTrace(e));
                logger.error("Request for units failed, and retrying...");
            }
        }
    }

    /**
     * Helper method that is used to dynamically create new Dispatcher objects that publish to Influx when a message is received
     * @param influxDataWriter the Influx writer object
     * @return the created Dispatcher
     */
    public Dispatcher createNewDispatcher(InfluxDataWriter influxDataWriter) {
        return nc.createDispatcher((msg) -> {
            String str = new String(msg.getData(), StandardCharsets.UTF_8);

            if(natsSubscribeStr.equals(influxDataWriter.influxConfig.cloudSubscriptionTopic)){
                influxDataWriter.publishCloudData(str);
            }
            else{
                influxDataWriter.publish(str);
            }
        });
    }

    /**
     * Create an asynchronous subsciption to available subjects and publish to influxdb using the InfluxDataWriter
     */
    public void asyncSubscribe(InfluxDataWriter influxDataWriter, List<String> newTopicList) {
        logger.info("{} NatsConsumer in async subscribe", unitType);

        //get size of the new topic list
        int newTopicListSize = newTopicList.size();

        //calculate the number of dispatchers to create based on the topic list size
        int numberDispatchers = 1;

        //if there is a remainder in division, need to add 1 dispatcher
        if ((newTopicListSize % topicsPerDispatcher) > 0) {
            numberDispatchers = (newTopicListSize / topicsPerDispatcher) + 1;
        }
        //if the new topic list size is a multiple of the topics_per_dispatcher, simply divide the two
        else {
            numberDispatchers = newTopicListSize / topicsPerDispatcher;
        }

        int iterator = 0;

        //Create desired number of dispatchers based on number of topics, and configured topic per dispatcher value
        for (int i = 0; i < numberDispatchers; i++) {
            logger.info("{} NatsConsumer creating dispatcher number {}", unitType, i);

            Dispatcher newDispatcher = createNewDispatcher(influxDataWriter);
            //Get the topics that this dispatcher should subscribe to
            List<String> topicsToSubscribe = new ArrayList<>();

            //First check if the (newTopicListSize - iterator) is smaller than the topics_per_dispatcher
            //If it is, the sublist will start at the iterator and go to the end of the list
            //NOTE: subList is between first parameter, inlusive, to second parameter, exclusive
            if ((newTopicListSize - iterator) < topicsPerDispatcher) {
                topicsToSubscribe = newTopicList.subList(iterator, newTopicListSize);
            }
            //Get the next topics_per_dispatcher elements and update the iterator
            else {
                topicsToSubscribe = newTopicList.subList(iterator, iterator+topicsPerDispatcher);

                iterator += topicsPerDispatcher;
            }

            //Iterate through and subscribe to each topic
            for (String topic: topicsToSubscribe) {
                //need to remove slashes from topic name to match nats subject format
                String topicStr = topic.replace("/", "");
                newDispatcher.subscribe(natsSubscribeStr+topicStr);
                logger.info("{} NatsConsumer dispatcher {} subscribed to {}{}", unitType, i, natsSubscribeStr,
                        topicStr);
            }
        }
    }

    /**
     * This will be run every 30 seconds to update the global topic list variable and call asyncSubscribe
     * to create dispatchers for these new topics
     */
    public void unitStatusCheck(InfluxDataWriter influxDataWriter) {
        logger.info("{} NatsConsumer checking for new topics",unitType);
        //Set topicListOld to the current topic_list
        List<String> topicListOld = new ArrayList<>(topicList);

        //update the topic_list
        updateAvailableTopicList();

        //Create a copy of the current topic list and compare with the old topic list copy
        List<String> currentListCopy =  new ArrayList<>(topicList);
        //Remove all variable that were in the topicListOld variable. This leaves only the new topics
        //in this currentListCopy variable
        currentListCopy.removeAll(topicListOld);

        //Check if there are newly added elements and create dispatchers using asyncSubscribe
        if (!currentListCopy.isEmpty())
        {
            asyncSubscribe(influxDataWriter, currentListCopy);
        }

    }
}
