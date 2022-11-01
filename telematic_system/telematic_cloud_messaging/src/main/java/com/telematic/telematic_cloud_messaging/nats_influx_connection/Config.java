package com.telematic.telematic_cloud_messaging.nats_influx_connection;

/**
 * The Config object instantiates a configuration object which stores information to create a connection to the telematic nats server 
 * and influxdb bucket.
 */

public class Config {

    public enum BucketType{
        Platform,
        Streets,
        All
    }
    //URI where the NATS service is hosted
    String nats_uri;
    // URI where the influxdb bucket is hosted    
    String influx_uri;
    // Influxdb bucket type: Can be Platform, Streets or All
    BucketType influx_bucket_type;
    // Influxdb bucket name for CARMA Streets bucket
    String influx_bucket_streets;
    // Influxdb bucket id for CARMA Streets bucket
    String influx_bucket_id_streets;
    // Influxdb bucket name for CARMA Platform bucket
    String influx_bucket_platform;
    // Influxdb bucket id for CARMA Platform bucket
    String influx_bucket_id_platform;
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

    public Config(){}
};