package com.telematic.telematic_cloud_messaging.nats_influx_connection;

import org.springframework.stereotype.Component;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;

import java.io.*;
import java.util.Properties;
import com.telematic.telematic_cloud_messaging.nats_influx_connection.InfluxDataWriter;
import com.telematic.telematic_cloud_messaging.nats_influx_connection.NatsConsumer;
import com.telematic.telematic_cloud_messaging.message_converters.JSONFlattenerHelper;
import com.telematic.telematic_cloud_messaging.message_converters.JSON2KeyValuePairsConverter;
import org.slf4j.LoggerFactory;
import org.slf4j.Logger;
import org.apache.commons.lang3.exception.ExceptionUtils;
import java.lang.Thread;

/**
 * The NatsInfluxPush object instantiates a NatsConsumer that creates a connection to the telematic nats server 
 * and subscribes to all available subjects. It also instantiates an InfluxDataWriter object that is used to publish the
 * received data to the Influx database.
 */
@Component
@Profile("!test") //Skip Unit test on the CommandLineRunner task
public class NatsInfluxPush implements CommandLineRunner {
    

    public static class Config{
        String nats_uri;    
        String influx_uri;
        String influx_bucket_type;
        String influx_bucket_streets;
        String influx_bucket_id_streets;
        String influx_bucket_platform;
        String influx_bucket_id_platform;
        String influx_org;
        String influx_org_id;
        String influx_token;
        String influx_username;
        String influx_pwd;
        int nats_max_reconnects;
        int influx_connect_timeout;
        int influx_write_timeout;

        public Config(){}
    }

    private static final Logger logger = LoggerFactory.getLogger(NatsInfluxPush.class);

    private static Config config_;

    /**
     * Constructor to instantiate NatsInfluxPush object
     */
    public NatsInfluxPush() {
        logger.info("Creating new NatsInfluxPush");
    }

    /**
     * Load required configuration values from config.properties file    
     */
    static Config getConfigValues() {
        
        Config config = new Config();

        try {
            String configFilePath = "src/main/resources/application.properties";
            FileInputStream propsInput = new FileInputStream(configFilePath);
            Properties prop = new Properties();
            prop.load(propsInput);
            
            config.nats_uri = prop.getProperty("NATS_URI");
            config.nats_max_reconnects = Integer.parseInt(prop.getProperty("NATS_MAX_RECONNECTS"));
            config.influx_uri = "http://" + prop.getProperty("INFLUX_URI") + ":" + prop.getProperty("INFLUX_PORT");
            config.influx_username = prop.getProperty("INFLUX_USERNAME");
            config.influx_pwd = prop.getProperty("INFLUX_PWD");
            config.influx_bucket_type = prop.getProperty("INFLUX_BUCKET_TYPE");
            config.influx_bucket_streets = prop.getProperty("INFLUX_BUCKET");
            config.influx_bucket_id_streets= prop.getProperty("INFLUX_BUCKET_ID");
            config.influx_bucket_platform = prop.getProperty("INFLUX_BUCKET_PLATFORM");
            config.influx_bucket_id_platform = prop.getProperty("INFLUX_BUCKET_ID_PLATFORM");
            config.influx_org = prop.getProperty("INFLUX_ORG");
            config.influx_org_id = prop.getProperty("INFLUX_ORG_ID");
            config.influx_token = prop.getProperty("INFLUX_TOKEN");
            config.influx_connect_timeout = Integer.parseInt(prop.getProperty("INFLUX_CONNECT_TIMEOUT"));
            config.influx_write_timeout = Integer.parseInt(prop.getProperty("INFLUX_WRITE_TIMEOUT"));
            

        } catch (Exception e) {
            logger.error(ExceptionUtils.getStackTrace(e));
        }
        return config;
    }
    
    public static void initialize_thread(String bucket_type, Config config) {
        
        // Create NATS and InfluxWriter
        logger.info("Created thread for " + bucket_type + "Data");
        
        
        String influx_bucket = "";
        String influx_bucket_id = "";
        String subscription_topic = "";

        if(bucket_type.equals("Platform")){
            influx_bucket = config.influx_bucket_platform;
            influx_bucket_id = config.influx_bucket_id_platform;
            subscription_topic = "*.platform.data.*";
        }
        else if(bucket_type.equals("Streets")){
            influx_bucket = config.influx_bucket_streets;
            influx_bucket_id = config.influx_bucket_id_streets;
            subscription_topic = "*.streets.data.*";
        }
        else{
            Thread.currentThread().interrupt();
            logger.error("Invalid data type for pushing Influx data");
        }

        NatsConsumer natsObject = new NatsConsumer(config.nats_uri, subscription_topic, config.nats_max_reconnects);

        InfluxDataWriter influxDataWriter = new InfluxDataWriter(config.influx_uri, config.influx_username, config.influx_pwd, influx_bucket,
        influx_bucket_id, config.influx_org, config.influx_org_id, config.influx_token, config.influx_connect_timeout, config.influx_write_timeout);

        //Wait until we successfully connect to the nats server and InfluxDb
        while(!natsObject.getNatsConnected() & !influxDataWriter.getInfluxConnected()){

            //wait for 100 ms and try to connect again
            try {
                natsObject.nats_connect();
                influxDataWriter.influx_connect();
                Thread.sleep(100);
            } 
            catch (InterruptedException e) 
            {
                Thread.currentThread().interrupt();
                logger.info("Couldn't connect to influx or nats, retrying..");
            }
        }
       
        //subscribe to data and publish
        natsObject.async_subscribe(influxDataWriter);
        logger.info("Waiting for data from nats..");
    }

    /**
     * Override run method that instantiates the NatsConsumer and InfluxDataWriter.
     * @param args 
     */
    @Override
    public void run(String[] args) {
        config_ = getConfigValues();

        // Create threads depending on push data type
        Thread worker = new Thread(){
            public void run(){
                if(config_.influx_bucket_type.equals("All")){
                    initialize_thread("Platform", config_);
                    initialize_thread("Streets", config_);
                }
                else{
                    initialize_thread(config_.influx_bucket_type, config_);
                }
            }
        };
        worker.start();
    }
}
