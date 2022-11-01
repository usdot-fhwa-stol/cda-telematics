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

    String nats_uri;    
    String influx_uri;
    BucketType influx_bucket_type;
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
};