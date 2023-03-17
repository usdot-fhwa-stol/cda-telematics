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
import java.net.http.HttpClient;
import java.net.http.HttpClient.Redirect;
import java.net.http.HttpClient.Version;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpResponse.BodyHandlers;
import java.time.Duration;
import org.json.JSONArray;
import org.json.JSONObject;

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
    List<String> nats_subject_list;
    List<String> registered_unit_id_list;
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
        nats_subject_list = new ArrayList<String>();
        registered_unit_id_list = new ArrayList<String>();

        // this.createDispatcherTopicList();
        // logger.info("Creating dispatcher topic list..");

        logger.info("Getting registered units..");
        this.getRegisteredUnits();    }

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
     * @return registered_unit_id_list list of registered units
     */
    public List<String> getRegisteredUnitIDList() {
        return registered_unit_id_list;
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
     * Make call to TopicsService to get all of the registered units and populate the class's list
     */
    public void getRegisteredUnits() {
        HttpClient client = HttpClient.newBuilder().version(Version.HTTP_2).followRedirects(Redirect.NORMAL).build();
        String response = "";

        try {
            HttpRequest request = HttpRequest.newBuilder()
            .uri(new URI(nats_api+"registeredUnits"))
            .GET()
            .timeout(Duration.ofSeconds(10))
            .build();

            response = client.send(request, BodyHandlers.ofString()).body();
            logger.info("registeredUnits response: " + response);

            JSONArray unitJsonArray = new JSONArray(response); 

            for(int i=0; i<unitJsonArray.length(); i++) 
            {
                JSONObject arrayJsonObject = unitJsonArray.getJSONObject(i);
                String unit_id = arrayJsonObject.getString("unit_id"); 
                if (!registered_unit_id_list.contains(unit_id)) {
                    registered_unit_id_list.add(unit_id);
                    logger.info("Added to registered unit list: " + unit_id);
                }
            }            
        }
        catch (URISyntaxException e)
        {
            logger.error(ExceptionUtils.getStackTrace(e));

        }  
        catch (Exception e)
        {
            logger.error(ExceptionUtils.getStackTrace(e));
        }
    }
    
    /**
     * This dispatcher is created to get the list of available topics for each unit that is stored in NATS
     */
    public void createDispatcherTopicList(String unit_id) {

        HttpClient client = HttpClient.newBuilder().version(Version.HTTP_2).followRedirects(Redirect.NORMAL).build();
        String response = "";

        try {
            HttpRequest request = HttpRequest.newBuilder()
            .uri(new URI(nats_api+"/requestAvailableTopics/"+unit_id))
            .GET()
            .timeout(Duration.ofSeconds(10))
            .build();

            response = client.send(request, BodyHandlers.ofString()).body();

            JSONObject jsonObject = new JSONObject(response); 
            JSONArray topicList = jsonObject.getJSONArray("topics");
            logger.info("requestAvailableTopics for unit " + unit_id + "response: " + topicList);
        }
        catch (URISyntaxException e)
        {
            logger.error(ExceptionUtils.getStackTrace(e));

        }  
        catch (Exception e)
        {
            logger.error(ExceptionUtils.getStackTrace(e));
        }
    }

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
        int currentSize = nats_subject_list.size();

        Dispatcher newDispatcher = createNewDispatcher(influxDataWriter);

        //Subscribe to all subjects to populate the subject list
        // try {
        //     //subscribe to all available subjects on nats server
        //     d.subscribe(nats_subscribe_str); //subject example: "streets_id.data.v2xhub_scheduling_plan_sub"
        //     logger.info("Successfully subscribed to nats server data");
        // }
        // catch (Exception e) {
        //     logger.error(ExceptionUtils.getStackTrace(e));
        // }

        //Create dispatcher object that will be used to call InfluxDataWriter publish method everytime a 
        //message has been received
        // Dispatcher d = nc.createDispatcher((msg) -> {
        //     String str = new String(msg.getData(), StandardCharsets.UTF_8);
            
        //     nats_subject_list.add(msg.getSubject());
        //     logger.info("Added to nats subject list: " + msg.getSubject());

        //     if(nats_subscribe_str.equals(influxDataWriter.config_.cloud_subscription_topic)){
        //         logger.info("Received cloud data");
        //         influxDataWriter.publishCloudData(str);
        //     }
        //     else{
        //         influxDataWriter.publish(str);
        //     }
        // });  

        // try {
        //     //subscribe to all available subjects on nats server
        //     d.subscribe(nats_subscribe_str); //subject example: "streets_id.data.v2xhub_scheduling_plan_sub"
        //     logger.info("Successfully subscribed to nats server data");
        // }
        // catch (Exception e) {
        //     logger.error(ExceptionUtils.getStackTrace(e));
        // }
  
    }
}
