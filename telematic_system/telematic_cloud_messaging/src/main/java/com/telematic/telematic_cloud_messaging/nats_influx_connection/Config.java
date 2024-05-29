package com.telematic.telematic_cloud_messaging.nats_influx_connection;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * The Config object instantiates a configuration object which stores information to create a connection to the telematic NATS server 
 * and influxdb bucket.
 */
@Component
public class Config {

    public enum BucketType{
        PLATFORM("Platform"),
        STREETS("Streets"),
        CLOUD("Cloud"),
        ALL("All");

        private String type;

        BucketType (String type){
            this.type = type;
        }
    }
    //URI where the NATS service is hosted
    @Value("${M_NATS_URI}")
    String natsUri;

    // URI where the influxdb bucket is hosted  
    @Value("${M_INFLUX_URI}")  
    String influxUri;
    
    //PORT to which influxDB is connected
    @Value("${M_INFLUX_PORT}")  
    String influxPort;
    
    // Influxdb bucket type: Can be Platform, Streets or All
    @Value("${M_INFLUX_BUCKET_TYPE}")  
    String influxBucketTypeStr;
    BucketType influxBucketType;
    
    // Influxdb bucket name for CARMA Streets bucket
    @Value("${M_INFLUX_BUCKET_STREETS}") 
    String influxBucketStreets;
    
    // NATS topic carma-streets data is published to. 
    @Value("${M_STREETS_SUBSCRIPTION_TOPIC}") 
    String streetsSubscriptionTopic;
    
    // Influxdb bucket name for CARMA Platform bucket
    @Value("${M_INFLUX_BUCKET_PLATFORM}") 
    String influxBucketPlatform;
    
    // NATS topic carma-platform data is published to
    @Value("${M_PLATFORM_SUBSCRIPTION_TOPIC}") 
    String platformSubscriptionTopic;
    
    // Influxdb bucket name for CARMA Cloud bucket
    @Value("${M_INFLUX_BUCKET_CLOUD}") 
    String influxBucketCloud;
    
    // NATS topic carma-cloud data is published to. 
    @Value("${M_CLOUD_SUBSCRIPTION_TOPIC}") 
    String cloudSubscriptionTopic;
    
    // Organization for the influxdb bucket
    @Value("${M_INFLUX_ORG}") 
    String influxOrg;
        
    // Token to access influxdb bucket
    @Value("${M_INFLUX_TOKEN}") 
    String influxToken;
    
    // Username for influxdb bucket
    @Value("${M_INFLUX_USERNAME}") 
    String influxUsername;
    
    // Password for influxdb bucket
    @Value("${M_INFLUX_PWD}") 
    String influxPwd;
    
    // Maximum number of times the service tries to establish a NATS connection
    @Value("${M_NATS_MAX_RECONNECTS}") 
    int natsMaxReconnects;
    
    // Time in milliseconds after which the request to connect to the influxdb bucket times out
    @Value("${M_INFLUX_CONNECT_TIMEOUT}")
    int influxConnectTimeout;
    
    // Time in milliseconds after which the request to write data to the influxdb bucket times out
    @Value("${M_INFLUX_WRITE_TIMEOUT}")
    int influxWriteTimeout;
    
    // Maximum number of topics to assign to dispatcher
    @Value("${M_NUMBER_TOPICS_PER_DISPATCHER}") 
    int topicsPerDispatcher;
    
    // List of vehicle unit ids
    @Value("${M_VEHICLE_UNIT_ID_LIST}")
    String vehicleUnitIdList;
    
    // List of streets unit ids
    @Value("${M_STREETS_UNIT_ID_LIST}")
    String streetsUnitIdList;
    
    // List of cloud unit ids
    @Value("${M_CLOUD_UNIT_ID_LIST}")
    String cloudUnitIdList;

    //List of fields in the stream that should only be set to string data type
    @Value("${M_TO_STR_FIELDS}")
    List<String> toStrFields;
    
    //List of fields in the stream that should be ignored
    @Value("${M_IGNORE_FIELDS}")
    List<String> ignoreFields;    

    // Converts config object parameters to a string
    public String toString(){        
        return "Configuration: " + 
        "\nNATS uri: " + natsUri + 
        "\ninflux uri: " + influxUri + 
        "\ninflux bucket type: " + influxBucketType + 
        "\ninflux bucket streets: " + influxBucketStreets + 
        "\nstreets subscription topic: " + streetsSubscriptionTopic +
        "\ninflux bucket platform: " + influxBucketPlatform +
        "\nplatform subscription topic: " + platformSubscriptionTopic +
        "\ninflux bucket cloud: " + influxBucketCloud + 
        "\ncloud subscription topic: " + cloudSubscriptionTopic + 
        "\ninflux org: " + influxOrg +
        "\ninflux token: " + influxToken +
        "\ninflux username:" + influxUsername +
        "\ninflux pwd: " + influxPwd +
        "\nNATS max reconnects: " + natsMaxReconnects +
        "\ninflux connect timeout: " + influxConnectTimeout +
        "\ninflux write timeout: " + influxWriteTimeout +
        "\nNATS topic per dispatcher: " + topicsPerDispatcher+
        "\nvehicle unit id list: " + vehicleUnitIdList +
        "\nstreets unit id list: " + streetsUnitIdList +
        "\ncloud unit id list: " + cloudUnitIdList + 
        "\nto str fields:" + toStrFields.toString() +
        "\nignore fields:" + ignoreFields.toString();
    }
};