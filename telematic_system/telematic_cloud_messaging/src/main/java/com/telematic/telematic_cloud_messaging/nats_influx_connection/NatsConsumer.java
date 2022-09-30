package com.telematic.telematic_cloud_messaging.nats_influx_connection;

import org.springframework.stereotype.Component;
import io.nats.client.*;
import java.io.*;
import java.util.Properties;
import java.nio.charset.StandardCharsets;
import org.springframework.boot.CommandLineRunner;
import com.telematic.telematic_cloud_messaging.nats_influx_connection.InfluxPublisher;
import com.telematic.telematic_cloud_messaging.message_converters.JSONFlattenerHelper;
import com.telematic.telematic_cloud_messaging.message_converters.JSON2KeyValuePairsConverter;

/**
 * The NatsConsumer object creates a connection to the telematic nats server and subscribes to 
 * all available subjects. It instantiates an InfluxPublisher object that is used to publish the
 * received data to the Influx database.
 */
public class NatsConsumer {
    String nats_uri;
    int nats_max_reconnects;
    String nats_subscribe_str;
    boolean nats_connected;
    Connection nc;

    /**
     * Constructor to instantiate NatsConsumer object
     */
    public NatsConsumer(String nats_uri, String nats_subscribe_str, int nats_max_reconnects) {
        System.out.println("Creating new NatsConsumer");

        this.nats_uri = nats_uri;
        this.nats_subscribe_str = nats_subscribe_str;
        this.nats_max_reconnects = nats_max_reconnects;

        nats_connected = false;
        nc = null;
    }

    /**
     * @return nats_uri ip address of nats server
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
     * Attempt to connect to the nats server using the uri from the config.properties file
     * @param uri The uri of the nats server to connect to
     */
    public void nats_connect(String uri) {    
        String connection_string = "";
        try {
            Options options = new Options.Builder().server(uri).maxReconnects(nats_max_reconnects).build();
            nc = Nats.connect(options);
            connection_string = "Successfully connected to nats server";
            System.out.println(connection_string);

            nats_connected = true;
        }
        catch (Exception e) {
            connection_string = "Connection exception: " + e;
            System.out.println(connection_string);
        }
    }
   
    /**
     * Create an asynchronous subsciption to available subjects and publish to influxdb using the InfluxPublisher
     */
    public void async_subscribe(InfluxPublisher influxPublisher, JSONFlattenerHelper jsonFlattener, JSON2KeyValuePairsConverter keyValueConverter) {
        //Create dispatcher object that will be used to call InfluxPublisher publish method everytime a 
        //message has been received
        Dispatcher d = nc.createDispatcher((msg) -> {
            String str = new String(msg.getData(), StandardCharsets.UTF_8);
            influxPublisher.publish(str, jsonFlattener, keyValueConverter);
        });  

        try {
            //subscribe to all available subjects on nats server
            d.subscribe(nats_subscribe_str); //subject example: "streets_id.data.v2xhub_scheduling_plan_sub"
            System.out.println("Successfully subscribed to nats server data");

        }
        catch (Exception e) {
            System.out.println("Could not subscribe to nats server data");
        }
  
    }
}
