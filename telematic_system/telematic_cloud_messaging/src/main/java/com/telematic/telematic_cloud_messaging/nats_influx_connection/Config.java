package com.telematic.telematic_cloud_messaging.nats_influx_connection;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * The Config object instantiates a configuration object which stores information to create a connection to the telematic nats server 
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
    @Value("${NATS_URI}")
    String nats_uri;

    // URI where the influxdb bucket is hosted  
    @Value("${INFLUX_URI}")  
    String influx_uri;
    
    //PORT to which influxDB is connected
    @Value("${INFLUX_PORT}")  
    String influx_port;
    
    // Influxdb bucket type: Can be Platform, Streets or All
    @Value("${INFLUX_BUCKET_TYPE}")  
    String influx_bucket_type_str;
    BucketType influx_bucket_type;
    
    // Influxdb bucket name for CARMA Streets bucket
    @Value("${INFLUX_BUCKET_STREETS}") 
    String influx_bucket_streets;
    
    // nats topic carma-streets data is published to. 
    @Value("${STREETS_SUBSCRIPTION_TOPIC}") 
    String streets_subscription_topic;
    
    // Influxdb bucket name for CARMA Platform bucket
    @Value("${INFLUX_BUCKET_STREETS}") 
    String influx_bucket_platform;
    
    // nats topic carma-platform data is published to
    @Value("${PLATFORM_SUBSCRIPTION_TOPIC}") 
    String platform_subscription_topic;
    
    // Influxdb bucket name for CARMA Cloud bucket
    @Value("${INFLUX_BUCKET_CLOUD}") 
    String influx_bucket_cloud;
    
    // nats topic carma-cloud data is published to. 
    @Value("${CLOUD_SUBSCRIPTION_TOPIC}") 
    String cloud_subscription_topic;
    
    // Organization for the influxdb bucket
    @Value("${INFLUX_ORG}") 
    String influx_org;
        
    // Token to access influxdb bucket
    @Value("${INFLUX_TOKEN}") 
    String influx_token;
    
    // Username for influxdb bucket
    @Value("${INFLUX_USERNAME}") 
    String influx_username;
    
    // Password for influxdb bucket
    @Value("${INFLUX_PWD}") 
    String influx_pwd;
    
    // Maximum number of times the service tries to establish a NATS connection
    @Value("${NATS_MAX_RECONNECTS}") 
    int nats_max_reconnects;
    
    // Time in milliseconds after which the request to connect to the influxdb bucket times out
    @Value("${INFLUX_CONNECT_TIMEOUT}")
    int influx_connect_timeout;
    
    // Time in milliseconds after which the request to write data to the influxdb bucket times out
    @Value("${INFLUX_WRITE_TIMEOUT}")
    int influx_write_timeout;
    
    // Maximum number of topics to assign to dispatcher
    @Value("${NUMBER_TOPICS_PER_DISPATCHER}") 
    int topics_per_dispatcher;
    
    // List of vehicle unit ids
    @Value("${VEHICLE_UNIT_ID_LIST}")
    String vehicle_unit_id_list;
    
    // List of streets unit ids
    @Value("${STREETS_UNIT_ID_LIST}")
    String streets_unit_id_list;
    
    // List of cloud unit ids
    @Value("${CLOUD_UNIT_ID_LIST}")
    String cloud_unit_id_list;

    //List of fields in the stream that should only be set to string data type
    @Value("#{'${TO_STR_FIELDS}'.split(',')}")
    List<String> to_str_fields;
    
    //List of fields in the stream that should be ignored
    @Value("#{'${IGNORE_FIELDS}'.split(',')}")
    List<String> ignore_fields;    

    // Converts config object parameters to a string
    public String ToString(){
        
        String config_str = new String("Configuration: " + 
        "\nnats_uri: " + nats_uri + 
        "\ninflux_uri: " + influx_uri + 
        "\ninflux_bucket_type: " + influx_bucket_type + 
        "\ninflux_bucket_streets: " + influx_bucket_streets + 
        "\nstreets_subscription_topic: " + streets_subscription_topic +
        "\ninflux_bucket_platform: " + influx_bucket_platform +
        "\nplatform_subscription_topic: " + platform_subscription_topic +
        "\ninflux_bucket_cloud: " + influx_bucket_cloud + 
        "\ncloud_subscription_topic: " + cloud_subscription_topic + 
        "\ninflux_org: " + influx_org +
        "\ninflux_token: " + influx_token +
        "\ninflux_username:" + influx_username +
        "\ninflux_pwd: " + influx_pwd +
        "\nnats_max_reconnects: " + nats_max_reconnects +
        "\ninflux_connect_timeout: " + influx_connect_timeout +
        "\ninflux_write_timeout: " + influx_write_timeout +
        "\nnats_topic_per_dispatcher: " + topics_per_dispatcher+
        "\nvehicle_unit_id_list: " + vehicle_unit_id_list +
        "\nstreets_unit_id_list: " + streets_unit_id_list +
        "\ncloud_unit_id_list: " + cloud_unit_id_list + 
        "\nto_str_fields:" + to_str_fields.toString() +
        "\nignore_fields:" + ignore_fields.toString());

        return config_str;

    }
};