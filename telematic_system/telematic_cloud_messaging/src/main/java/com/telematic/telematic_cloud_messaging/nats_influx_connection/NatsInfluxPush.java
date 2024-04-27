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
    private Config config;

    /**
     * Constructor to instantiate NatsInfluxPush object
     */
    public NatsInfluxPush() {
        logger.info("Creating new NatsInfluxPush");
    }
    
    public void initDataPersistentService(Config.BucketType bucketType) {       

        // Create NATS and InfluxWriter
        logger.info("Created thread for {} Data", bucketType);
        
        String unitType = "";
        String subscriptionTopic = "";
        String unitIdList = "";

        if(bucketType.equals(Config.BucketType.PLATFORM)){
            subscriptionTopic = config.platformSubscriptionTopic;
            unitType = "Platform";
            unitIdList = config.vehicleUnitIdList;
        }
        else if(bucketType.equals(Config.BucketType.STREETS)){
            subscriptionTopic = config.streetsSubscriptionTopic;
            unitType = "Streets";
            unitIdList = config.streetsUnitIdList;
        }
        else if(bucketType.equals(Config.BucketType.CLOUD)){
            subscriptionTopic = config.cloudSubscriptionTopic;
            unitType = "Cloud";
            unitIdList = config.cloudUnitIdList;
        }
        else{
            Thread.currentThread().interrupt();
            logger.error("Invalid data type for pushing Influx data");
        }

        NatsConsumer natsObject = new NatsConsumer(config.natsUri, subscriptionTopic, config.natsMaxReconnects, 
        config.topicsPerDispatcher, unitIdList, unitType);

        InfluxDataWriter influxDataWriter = new InfluxDataWriter(config, bucketType);

        //Wait until we successfully connect to the nats server and InfluxDb
        while(!natsObject.getNatsConnected() && !influxDataWriter.getInfluxConnected()){

            //wait for 100 ms and try to connect again
            try {
                natsObject.natsConnect();
                influxDataWriter.influxConnect();
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
        Thread updateTopicThread = new Thread() {
            @Override
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
        updateTopicThread.start();
        logger.info("Update topic thread started");
    }

    /**
     * Override run method that instantiates the NatsConsumer and InfluxDataWriter.
     */
    @Override
    public void run(String... args) {
        config.influxUri = "http://" + config.influxUri + ":" + config.influxPort;
        config.influxBucketType = Config.BucketType.valueOf(config.influxBucketTypeStr);
        logger.info("{}", config);
        if(config.influxBucketType == Config.BucketType.ALL){
            // Create thread for platform
            Thread platformThread = new Thread() {
                @Override
                public void run(){
                    initDataPersistentService(Config.BucketType.PLATFORM);
                }
            };

            // Create thread for streets
            Thread streetsThread = new Thread() {
                @Override
                public void run() {
                    initDataPersistentService(Config.BucketType.STREETS);
                }
            };

            // Create thread for cloud
            Thread cloudThread = new Thread() {
                @Override
                public void run() {
                    initDataPersistentService(Config.BucketType.CLOUD);
                }
            };
            
            // Start threads
            platformThread.start();
            streetsThread.start();
            cloudThread.start();
        }
        else if(config.influxBucketType.equals(Config.BucketType.PLATFORM) || config.influxBucketType.equals(Config.BucketType.STREETS) || 
            config.influxBucketType.equals(Config.BucketType.CLOUD))
        {
            // Create thread for specified type
            Thread workerThread = new Thread() {
                @Override
                public void run(){
                    initDataPersistentService(config.influxBucketType);
                }
            };
            workerThread.start();
        }
        else{
            logger.error("Invalid bucket type requested. Options are PLATFORM, STREETS, CLOUD and ALL");
        }
        
    }
}
