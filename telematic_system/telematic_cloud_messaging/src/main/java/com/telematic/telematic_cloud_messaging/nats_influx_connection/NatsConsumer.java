package com.telematic.telematic_cloud_messaging.nats_influx_connection;

import io.nats.client.*;
import java.io.*;
import java.util.Properties;
import java.nio.charset.StandardCharsets;
import org.springframework.boot.CommandLineRunner;
import com.telematic.telematic_cloud_messaging.nats_influx_connection.InfluxDataWriter;
import com.telematic.telematic_cloud_messaging.message_converters.JSONFlattenerHelper;
import com.telematic.telematic_cloud_messaging.message_converters.JSON2KeyValuePairsConverter;
import org.slf4j.LoggerFactory;
import org.slf4j.Logger;
import org.apache.commons.lang3.exception.ExceptionUtils;

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

    private static final Logger logger = LoggerFactory.getLogger(NatsConsumer.class);

    /**
     * Constructor to instantiate NatsConsumer object
     */
    public NatsConsumer(String nats_uri, String nats_subscribe_str, int nats_max_reconnects) {
        logger.info("Creating new NatsConsumer with sub str: " + nats_subscribe_str);

        this.nats_uri = nats_uri;
        this.nats_subscribe_str = nats_subscribe_str;
        this.nats_max_reconnects = nats_max_reconnects;

        nats_connected = false;
        nc = null;
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
     * Create an asynchronous subsciption to available subjects and publish to influxdb using the InfluxDataWriter
     */
    public void async_subscribe(InfluxDataWriter influxDataWriter) {
        //Create dispatcher object that will be used to call InfluxDataWriter publish method everytime a 
        //message has been received
        Dispatcher d = nc.createDispatcher((msg) -> {
            String str = new String(msg.getData(), StandardCharsets.UTF_8);
            logger.info("Entering dispatcher");
            if(influxDataWriter.config_.influx_bucket_type == Config.BucketType.CLOUD){
                logger.info("Received cloud data");
                influxDataWriter.publishCloudData(str);
            }
            else{
                influxDataWriter.publish(str);
            }
        });  

        try {
            //subscribe to all available subjects on nats server
            logger.info("Entering try");
            d.subscribe(nats_subscribe_str); //subject example: "streets_id.data.v2xhub_scheduling_plan_sub"
            logger.info("Successfully subscribed to nats server data");
        }
        catch (Exception e) {
            logger.error(ExceptionUtils.getStackTrace(e));
        }
  
    }
}
