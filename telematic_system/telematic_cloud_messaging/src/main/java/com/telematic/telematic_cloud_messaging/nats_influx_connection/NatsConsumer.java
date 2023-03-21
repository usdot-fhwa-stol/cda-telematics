package com.telematic.telematic_cloud_messaging.nats_influx_connection;

import io.nats.client.*;
import java.io.*;
import java.util.Properties;
import java.util.List;
import java.util.ArrayList;
import java.nio.charset.StandardCharsets;
import org.springframework.boot.CommandLineRunner;
import com.telematic.telematic_cloud_messaging.nats_influx_connection.InfluxDataWriter;
import com.telematic.telematic_cloud_messaging.message_converters.JSONFlattenerHelper;
import com.telematic.telematic_cloud_messaging.message_converters.JSON2KeyValuePairsConverter;
import org.slf4j.LoggerFactory;
import org.slf4j.Logger;
import org.apache.commons.lang3.exception.ExceptionUtils;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.Duration;
import org.json.JSONArray;
import org.json.JSONObject;
import java.util.concurrent.CancellationException;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;

/**
 * The NatsConsumer object creates a connection to the telematic nats server and subscribes to 
 * all available subjects with ".data" in the subject name. It instantiates an InfluxDataWriter object 
 * that is used to publish the received data to the Influx database.
 */
public class NatsConsumer {
    String nats_uri;
    int nats_max_reconnects;
    String nats_subscribe_str;
    boolean nats_connected;
    Connection nc;
    List<String> topic_list;
    List<String> topic_list_old;
    String nats_api;
    int topics_per_dispatcher;

    private static final Logger logger = LoggerFactory.getLogger(NatsConsumer.class);

    /**
     * Constructor to instantiate NatsConsumer object
     */
    public NatsConsumer(String nats_uri, String nats_subscribe_str, int nats_max_reconnects, String nats_api, int topics_per_dispatcher) {
        logger.info("Creating new NatsConsumer");

        this.nats_uri = nats_uri;
        this.nats_subscribe_str = nats_subscribe_str;
        this.nats_max_reconnects = nats_max_reconnects;
        this.nats_api = nats_api;
        this.topics_per_dispatcher = topics_per_dispatcher;

        nats_connected = false;
        nc = null;
        topic_list = new ArrayList<String>();
        topic_list_old = new ArrayList<String>();
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
            logger.info("Successfully connected to nats server");

            nats_connected = true;
        }
        catch (Exception e) {
            logger.error(ExceptionUtils.getStackTrace(e));
        }
    }
   
    /**
     * This dispatcher is created to get the list of available topics for each unit that is stored in NATS
     */
    public void updateAvailableTopicList() {
	String error_msg = "";
    	try {
            	Future<Message> future = nc.request("streets_id.available_topics", "test".getBytes(StandardCharsets.UTF_8));
	        Message msg;
            	msg = future.get();
            	String reply = new String(msg.getData(), StandardCharsets.UTF_8);
            	logger.debug("Available topics request. Reply: " + reply);

            	JSONObject jsonObject = new JSONObject(reply); 
            	JSONArray topicList = jsonObject.getJSONArray("topics");

            	//Add the topics to the topic list if they don't already exist
            	for(int i=0; i<topicList.length(); i++) 
            	{
                	String topicName = topicList.getJSONObject(i).getString("name");
                	if (!topic_list.contains(topicName)) {
                    		topic_list.add(topicName);
                    		logger.info("Added to topic list: " + topicName);
                	}
            	}
            
            	//Update the old topic list variable for comparison in the status check method
            	topic_list_old = new ArrayList<String>(topic_list);

        } catch (InterruptedException | ExecutionException e) {
            error_msg = "Response interrupted for subject: ";
            logger.error(error_msg, e);
        } catch (CancellationException e) {
            error_msg = "No response ";
            logger.error(error_msg, e);
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
                logger.info("Received cloud data");
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
    public void async_subscribe(InfluxDataWriter influxDataWriter) {
        //get current number of subjects subscribed to
        int currentSize = topic_list.size();
        int numberDispatchers = currentSize / topics_per_dispatcher;
        int subjectListIterator = 0;

        //Create desired number of dispatchers based on number of topics, and configured topic per dispatcher value
        for (int i = 0; i < numberDispatchers; i++) {
            logger.info("Creating dispatcher number " + String.valueOf(i));

            Dispatcher newDispatcher = createNewDispatcher(influxDataWriter);
            //Get the topics that this dispatcher should subscribe to
            List<String> topicsToSubscribe = topic_list.subList(subjectListIterator, subjectListIterator+topics_per_dispatcher);
            //Iterate through and subscribe to each topic
            for (String topic: topicsToSubscribe) {
                //need to remove slashes from topic name to match nats subject format
                String topicStr = topic.replace("/", "");
                newDispatcher.subscribe(nats_subscribe_str+topicStr);
                logger.info("Dispatcher " + String.valueOf(i) + " subscribed to " + nats_subscribe_str+topicStr);
            }
            //Update the iterator to move to the next set of topics
            subjectListIterator = subjectListIterator + topics_per_dispatcher;

        }       
    }

    /**
     * This will be run every minute to check if the registered units have changed and update the topic list accordingly
     */
    public void unitStatusCheck(InfluxDataWriter influxDataWriter) {
        logger.info("Checking for new topics");

        //Create a copy of the current topic list and compare with the old topic list copy
        List<String> currentListCopy =  new ArrayList<String>(topic_list);
        currentListCopy.removeAll(topic_list_old);

        //Create a new dispatcher for each new topic
        for (String topic: currentListCopy) 
        {
            Dispatcher newDispatcher = createNewDispatcher(influxDataWriter);
            //need to remove slashes from topic name to match nats subject format
            String topicStr = topic.replace("/", "");
            newDispatcher.subscribe(nats_subscribe_str+topicStr);
            logger.info("Creating new dispatcher for " + nats_subscribe_str+topicStr);
        }
    }
}
