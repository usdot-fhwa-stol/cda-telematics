package com.telematic.telematic_cloud_messaging.nats_influx_connection;

import org.springframework.stereotype.Component;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;

import java.io.*;
import java.util.Properties;
import com.telematic.telematic_cloud_messaging.nats_influx_connection.Config;
import com.telematic.telematic_cloud_messaging.nats_influx_connection.InfluxDataWriter;
import com.telematic.telematic_cloud_messaging.nats_influx_connection.NatsConsumer;
import com.telematic.telematic_cloud_messaging.nats_influx_connection.Config.BucketType;
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
            config.influx_bucket_streets = prop.getProperty("INFLUX_BUCKET_STREETS");
            config.streets_subscription_topic = prop.getProperty("STREETS_SUBSCRIPTION_TOPIC");
            config.influx_bucket_platform = prop.getProperty("INFLUX_BUCKET_PLATFORM");
            config.platform_subscription_topic = prop.getProperty("PLATFORM_SUBSCRIPTION_TOPIC");
            config.influx_bucket_cloud = prop.getProperty("INFLUX_BUCKET_CLOUD");
            config.cloud_subscription_topic = prop.getProperty("CLOUD_SUBSCRIPTION_TOPIC");
            config.influx_org = prop.getProperty("INFLUX_ORG");
            config.influx_org_id = prop.getProperty("INFLUX_ORG_ID");
            config.influx_token = prop.getProperty("INFLUX_TOKEN");
            config.influx_connect_timeout = Integer.parseInt(prop.getProperty("INFLUX_CONNECT_TIMEOUT"));
            config.influx_write_timeout = Integer.parseInt(prop.getProperty("INFLUX_WRITE_TIMEOUT"));

            try{
                config.influx_bucket_type = BucketType.valueOf(prop.getProperty("INFLUX_BUCKET_TYPE"));
            }catch(Exception e){
                logger.error("Invalid bucket type defined. Options are PLATFORM, STREETS, CLOUD and ALL");
            }
            

        } catch (Exception e) {
            logger.error(ExceptionUtils.getStackTrace(e));
        }
        return config;
    }
    
    public static void initialize_data_persistent_service(Config.BucketType bucket_type, Config config) {
        
        // Create NATS and InfluxWriter
        logger.info("Created thread for " + bucket_type + " Data");
        
        String influx_bucket = "";
        String subscription_topic = "";

        if(bucket_type.equals(Config.BucketType.PLATFORM)){
            influx_bucket = config.influx_bucket_platform;
            subscription_topic = config.platform_subscription_topic;
        }
        else if(bucket_type.equals(Config.BucketType.STREETS)){
            influx_bucket = config.influx_bucket_streets;
            subscription_topic = config.streets_subscription_topic;
        }
        else if(bucket_type.equals(Config.BucketType.CLOUD)){
            influx_bucket = config.influx_bucket_cloud;
            subscription_topic = config.cloud_subscription_topic;
        }
        else{
            Thread.currentThread().interrupt();
            logger.error("Invalid data type for pushing Influx data");
        }

        NatsConsumer natsObject = new NatsConsumer(config.nats_uri, subscription_topic, config.nats_max_reconnects);

        InfluxDataWriter influxDataWriter = new InfluxDataWriter(config_, bucket_type);

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
        
        logger.info(config_.ToString());
        
        if(config_.influx_bucket_type == Config.BucketType.ALL){
            // Create thread for platform
            Thread platform_thread  = new Thread() {
                public void run(){
                    initialize_data_persistent_service(Config.BucketType.PLATFORM, config_);
                }
            };

            // Create thread for streets
            Thread streets_thread = new Thread() {
                public void run() {
                    initialize_data_persistent_service(Config.BucketType.STREETS, config_);
                }
            };

            // Create thread for cloud
            Thread cloud_thread = new Thread() {
                public void run() {
                    logger.info("Creating thread for cloud");
                    initialize_data_persistent_service(Config.BucketType.CLOUD, config_);
                }
            };
            
            // Start threads
            platform_thread.start();
            streets_thread.start();
            cloud_thread.start();
        }
        else if(config_.influx_bucket_type.equals(Config.BucketType.PLATFORM) || config_.influx_bucket_type.equals(Config.BucketType.STREETS) || 
            config_.influx_bucket_type.equals(Config.BucketType.CLOUD))
        {
            // Create thread for specified type
            Thread worker_thread  = new Thread() {
                public void run(){
                    initialize_data_persistent_service(config_.influx_bucket_type, config_);
                }
            };
            worker_thread.start();
        }
        else{
            logger.error("Invalid bucket type requested. Options are PLATFORM, STREETS, CLOUD and ALL");
        }
        
    }
}
