package com.telematic.telematic_cloud_messaging.nats_influx_connection;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * The NatsInfluxPush object instantiates a NatsConsumer that creates a connection to the telematic nats server 
 * and subscribes to all available subjects. It also instantiates an InfluxDataWriter object that is used to publish the
 * received data to the Influx database.
 */
@Component
@Profile("!test") //Skip Unit test on the CommandLineRunner task
public class NatsInfluxPush implements CommandLineRunner {
    

    private static final Logger logger = LoggerFactory.getLogger(NatsInfluxPush.class);

    @Autowired
    private Config config_;

    /**
     * Constructor to instantiate NatsInfluxPush object
     */
    public NatsInfluxPush() {
        logger.info("Creating new NatsInfluxPush");
    }
    
    public void initialize_data_persistent_service(Config.BucketType bucket_type, Config config) {       

        // Create NATS and InfluxWriter
        logger.info("Created thread for " + bucket_type + " Data");
        
        String unit_type = "";
        String subscription_topic = "";
        String unit_id_list = "";

        if(bucket_type.equals(Config.BucketType.PLATFORM)){
            subscription_topic = config.platform_subscription_topic;
            unit_type = "Platform";
            unit_id_list = config.vehicle_unit_id_list;
        }
        else if(bucket_type.equals(Config.BucketType.STREETS)){
            subscription_topic = config.streets_subscription_topic;
            unit_type = "Streets";
            unit_id_list = config.streets_unit_id_list;
        }
        else if(bucket_type.equals(Config.BucketType.CLOUD)){
            subscription_topic = config.cloud_subscription_topic;
            unit_type = "Cloud";
            unit_id_list = config.cloud_unit_id_list;
        }
        else{
            Thread.currentThread().interrupt();
            logger.error("Invalid data type for pushing Influx data");
        }

        NatsConsumer natsObject = new NatsConsumer(config.nats_uri, subscription_topic, config.nats_max_reconnects, 
        config.topics_per_dispatcher, unit_id_list, unit_type);

        InfluxDataWriter influxDataWriter = new InfluxDataWriter(config, bucket_type);

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
        logger.info("Waiting for data from nats..");

        //Initialize thread that will check for new topics and create dispatchers every 30 seconds
        Thread update_topic_thread = new Thread() {
            public void run() {
                while(true) {
                    natsObject.unitStatusCheck(influxDataWriter);
                    try {
                        Thread.sleep(30000);
                    }
                    catch (InterruptedException e)
                    {
                        Thread.currentThread().interrupt();
                        logger.info("Update topic thread sleeping..");
                    }
                }
            }
        };
        update_topic_thread.start();
        logger.info("Update topic thread started");
    }

    /**
     * Override run method that instantiates the NatsConsumer and InfluxDataWriter.
     * @param args 
     */
    @Override
    public void run(String[] args) {
        config_.influx_uri = "http://" + config_.influx_uri + ":" + config_.influx_port;
        config_.influx_bucket_type = Config.BucketType.valueOf(config_.influx_bucket_type_str);
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
