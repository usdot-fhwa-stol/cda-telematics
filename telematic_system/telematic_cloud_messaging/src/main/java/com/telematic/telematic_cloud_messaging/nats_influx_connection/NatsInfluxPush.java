// package com.telematic.telematic_cloud_messaging.nats_influx_connection;

// import org.springframework.stereotype.Component;
// import org.springframework.boot.CommandLineRunner;
// import java.io.*;
// import java.util.Properties;
// import com.telematic.telematic_cloud_messaging.nats_influx_connection.InfluxDataWriter;
// import com.telematic.telematic_cloud_messaging.nats_influx_connection.NatsConsumer;
// import com.telematic.telematic_cloud_messaging.message_converters.JSONFlattenerHelper;
// import com.telematic.telematic_cloud_messaging.message_converters.JSON2KeyValuePairsConverter;
// import org.slf4j.LoggerFactory;
// import org.slf4j.Logger;
// import org.apache.commons.lang3.exception.ExceptionUtils;
// import java.lang.Thread;

// /**
//  * The NatsInfluxPush object instantiates a NatsConsumer that creates a connection to the telematic nats server 
//  * and subscribes to all available subjects. It also instantiates an InfluxDataWriter object that is used to publish the
//  * received data to the Influx database.
//  */
// @Component
// public class NatsInfluxPush implements CommandLineRunner {
//     static String nats_uri;    
//     static String influx_uri;
//     static String influx_bucket;
//     static String influx_bucket_id;
//     static String influx_org;
//     static String influx_org_id;
//     static String influx_token;
//     static String influx_username;
//     static String influx_pwd;
//     static int nats_max_reconnects;
//     static String nats_subscribe_str;

//     private static final Logger logger = LoggerFactory.getLogger(NatsInfluxPush.class);

//     /**
//      * Constructor to instantiate NatsInfluxPush object
//      */
//     public NatsInfluxPush() {
//         logger.info("Creating new NatsInfluxPush");
//     }

//     /**
//      * Load required configuration values from config.properties file    
//      */
//     static void getConfigValues() {
//         try {
//             String configFilePath = "src/main/resources/application.properties";
//             FileInputStream propsInput = new FileInputStream(configFilePath);
//             Properties prop = new Properties();
//             prop.load(propsInput);

//             nats_uri = prop.getProperty("NATS_URI");
//             nats_subscribe_str = prop.getProperty("NATS_SUBJECT_SUBSCRIBE");
//             nats_max_reconnects = Integer.parseInt(prop.getProperty("NATS_MAX_RECONNECTS"));
//             influx_uri = "http://" + prop.getProperty("INFLUX_URI") + ":" + prop.getProperty("INFLUX_PORT");
//             influx_username = prop.getProperty("INFLUX_USERNAME");
//             influx_pwd = prop.getProperty("INFLUX_PWD");
//             influx_bucket = prop.getProperty("INFLUX_BUCKET");
//             influx_bucket_id= prop.getProperty("INFLUX_BUCKET_ID");
//             influx_org = prop.getProperty("INFLUX_ORG");
//             influx_org_id = prop.getProperty("INFLUX_ORG_ID");
//             influx_token = prop.getProperty("INFLUX_TOKEN");

//         } catch (Exception e) {
//             logger.error(ExceptionUtils.getStackTrace(e));
//         }
//     }       

//     /**
//      * Override run method that instantiates the NatsConsumer and InfluxDataWriter.
//      * @param args 
//      */
//     @Override
//     public void run(String[] args) {
//         getConfigValues();

//         NatsConsumer natsObject = new NatsConsumer(nats_uri, nats_subscribe_str, nats_max_reconnects);
//         InfluxDataWriter influxDataWriter = new InfluxDataWriter(influx_uri, influx_username, influx_pwd, influx_bucket,
//         influx_bucket_id, influx_org, influx_org_id, influx_token);

//         //Wait until we successfully connect to the nats server and InfluxDb
//         while(!natsObject.getNatsConnected() & !influxDataWriter.getInfluxConnected()){
//             natsObject.nats_connect();
//             influxDataWriter.influx_connect();

//             //wait for 100 ms and try to connect again
//             try {
//                 Thread.sleep(100);
//             } 
//             catch (InterruptedException e) 
//             {
//                 Thread.currentThread().interrupt();
//                 logger.info("Couldn't connect to influx or nats, retrying..");
//             }
//         }
       
//         //subscribe to data and publish
//         natsObject.async_subscribe(influxDataWriter);
//         logger.info("Waiting for data from nats..");
//     }
// }
