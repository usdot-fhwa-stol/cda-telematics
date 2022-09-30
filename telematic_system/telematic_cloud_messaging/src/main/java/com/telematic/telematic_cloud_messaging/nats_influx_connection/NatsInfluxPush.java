package com.telematic.telematic_cloud_messaging.nats_influx_connection;

import org.springframework.stereotype.Component;
import org.springframework.boot.CommandLineRunner;
import java.io.*;
import java.util.Properties;
import com.telematic.telematic_cloud_messaging.nats_influx_connection.InfluxPublisher;
import com.telematic.telematic_cloud_messaging.nats_influx_connection.NatsConsumer;
import com.telematic.telematic_cloud_messaging.message_converters.JSONFlattenerHelper;
import com.telematic.telematic_cloud_messaging.message_converters.JSON2KeyValuePairsConverter;

/**
 * The NatsConsumer object creates a connection to the telematic nats server and subscribes to 
 * all available subjects. It instantiates an InfluxPublisher object that is used to publish the
 * received data to the Influx database.
 */
@Component
public class NatsInfluxPush implements CommandLineRunner {
    static String nats_uri;    
    static String influx_uri;
    static String influx_bucket;
    static String influx_org;
    static String influx_org_id;
    static String influx_token;
    static String influx_username;
    static String influx_pwd;
    static int nats_max_reconnects;
    static String nats_subscribe_str;

    /**
     * Constructor to instantiate NatsConsumer object
     */
    public NatsInfluxPush() {
        System.out.println("Creating new NatsInfluxPush");
    }

    /**
     * Load required configuration values from config.properties file    
     */
    static void getConfigValues() {
        try {
            String configFilePath = "src/main/java/com/telematic/telematic_cloud_messaging/nats_influx_connection/config.properties";

            FileInputStream propsInput = new FileInputStream(configFilePath);
            Properties prop = new Properties();
            prop.load(propsInput);

            nats_uri = prop.getProperty("NATS_URI");
            nats_subscribe_str = prop.getProperty("NATS_SUBJECT_SUBSCRIBE");
            nats_max_reconnects = Integer.parseInt(prop.getProperty("NATS_MAX_RECONNECTS"));
            influx_uri = "http://" + prop.getProperty("INFLUX_URI") + ":" + prop.getProperty("INFLUX_PORT");
            influx_username = prop.getProperty("INFLUX_USERNAME");
            influx_pwd = prop.getProperty("INFLUX_PWD");
            influx_bucket = prop.getProperty("INFLUX_BUCKET");
            influx_org = prop.getProperty("INFLUX_ORG");
            influx_org_id = prop.getProperty("INFLUX_ORG_ID");
            influx_token = prop.getProperty("INFLUX_TOKEN");

        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
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
        getConfigValues();

        NatsConsumer natsObject = new NatsConsumer(nats_uri, nats_subscribe_str, nats_max_reconnects);
        InfluxPublisher influxPublisher = new InfluxPublisher(influx_uri, influx_username, influx_pwd, influx_bucket,
        influx_org, influx_org_id, influx_token);

        JSONFlattenerHelper jsonFlattener = new JSONFlattenerHelper();
        JSON2KeyValuePairsConverter keyValueConverter = new JSON2KeyValuePairsConverter();

        natsObject.nats_connect(natsObject.getNatsURI());

        //If we successfully connect to the nats server, then subscribe to data and publish
        if (natsObject.getNatsConnected())
        {
            influxPublisher.influx_connect();
            natsObject.async_subscribe(influxPublisher, jsonFlattener, keyValueConverter);
            System.out.println("Waiting for data from nats..");
        }
    }
}
