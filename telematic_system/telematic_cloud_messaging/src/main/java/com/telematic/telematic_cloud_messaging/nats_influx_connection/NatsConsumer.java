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

@Component
public class NatsConsumer implements CommandLineRunner {
    private String nats_uri;
    String nats_subscribe_str;
    boolean nats_connected;
    Connection nc;

    /**
     * Constructor to instantiate NatsConsumer object
     */
    public NatsConsumer() {
        nats_connected = false;
        nc = null;
    }

    /**
     * Override run method that calls the main function
     * @param args 
     */
    @Override
    public void run(String[] args) {
        main(args);
    }

    /**
     * Main method that connects to the nats server and creates an asynchronous subscription to all available subjects
     */
    public static void main(String[] args) {
        NatsConsumer natsObject = new NatsConsumer();
        InfluxPublisher influxPublisher = new InfluxPublisher();
        JSONFlattenerHelper jsonFlattener = new JSONFlattenerHelper();
        JSON2KeyValuePairsConverter keyValueConverter = new JSON2KeyValuePairsConverter();

        natsObject.getConfigValues();
        natsObject.nats_connect(natsObject.getNatsURI());

        influxPublisher.influx_connect();
        natsObject.async_subscribe(influxPublisher, jsonFlattener, keyValueConverter);
        System.out.println("Waiting for messages now..");
    }

   
    /**
     * @return nats_uri ip address of nats server
     */
    public String getNatsURI() {
        return nats_uri;
    }

    /**
     * Load required configuration values from config.properties file    
     */
    private void getConfigValues() {
        try {
            String configFilePath = "src/main/java/com/telematic/telematic_cloud_messaging/nats_influx_connection/config.properties";

            FileInputStream propsInput = new FileInputStream(configFilePath);
            Properties prop = new Properties();
            prop.load(propsInput);

            nats_uri = prop.getProperty("NATS_URI");
            nats_subscribe_str = prop.getProperty("NATS_SUBJECT_SUBSCRIBE");
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
    
    /**
     * @param uri The uri of the nats server to connect to
     * @return The nats connection object
     */
    public void nats_connect(String uri) {    
        String connection_string = "";
        try {
            Options options = new Options.Builder().server(nats_uri).maxReconnects(5).build();
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
     * Create an asynchronous subsciption to available topics
     */
    public void async_subscribe(InfluxPublisher influxPublisher, JSONFlattenerHelper jsonFlattener, JSON2KeyValuePairsConverter keyValueConverter) {
        Dispatcher d = nc.createDispatcher((msg) -> {
            String str = new String(msg.getData(), StandardCharsets.UTF_8);
            // System.out.println("Received: " + str + " on subject: " + msg.getSubject());

            influxPublisher.publish(str, jsonFlattener, keyValueConverter);
        });  

        try {
            d.subscribe(nats_subscribe_str); //subject example: "streets_id.data.v2xhub_scheduling_plan_sub"
            System.out.println("Successfully subscribed to nats server data");

        }
        catch (Exception e) {
            System.out.println("Could not subscribe to nats server data");
        }
  
    }
}
