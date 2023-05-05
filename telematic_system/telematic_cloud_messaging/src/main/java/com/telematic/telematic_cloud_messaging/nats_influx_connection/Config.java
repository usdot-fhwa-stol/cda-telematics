package com.telematic.telematic_cloud_messaging.nats_influx_connection;

import java.util.*;

/**
 * The Config object instantiates a configuration object which stores information to create a connection to the telematic nats server 
 * and influxdb bucket.
 */

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
    String nats_uri;
    // URI where the influxdb bucket is hosted    
    String influx_uri;
    // Influxdb bucket type: Can be Platform, Streets or All
    BucketType influx_bucket_type;
    // Influxdb bucket name for CARMA Streets bucket
    String influx_bucket_streets;
    // nats topic carma-streets data is published to. 
    String streets_subscription_topic;
    // Influxdb bucket name for CARMA Platform bucket
    String influx_bucket_platform;
    // nats topic carma-platform data is published to
    String platform_subscription_topic;
    // Influxdb bucket name for CARMA Cloud bucket
    String influx_bucket_cloud;
    // nats topic carma-cloud data is published to. 
    String cloud_subscription_topic;
    // Organization for the influxdb bucket
    String influx_org;
    // Organization id of the influxdb bucket
    String influx_org_id;
    // Token to access influxdb bucket
    String influx_token;
    // Username for influxdb bucket
    String influx_username;
    // Password for influxdb bucket
    String influx_pwd;
    // Maximum number of times the service tries to establish a NATS connection
    int nats_max_reconnects;
    // Time in milliseconds after which the request to connect to the influxdb bucket times out
    int influx_connect_timeout;
    // Time in milliseconds after which the request to write data to the influxdb bucket times out
    int influx_write_timeout;
    // Maximum number of topics to assign to dispatcher
    int topics_per_dispatcher;
    // List of vehicle unit ids
    String vehicle_unit_id_list;
    // List of streets unit ids
    String streets_unit_id_list;
    // List of cloud unit ids
    String cloud_unit_id_list;
    //List of values in the stream that should only be set to string data type
    List<String> to_str_values;
    
    public Config(){}

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
        "\ninflux_org_id: " + influx_org_id +
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
        "\nto_str_values:" + to_str_values.toString());

        return config_str;

    }
};