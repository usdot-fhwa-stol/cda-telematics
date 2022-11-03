package com.telematic.telematic_cloud_messaging.nats_influx_connection;

import java.io.*;
import java.util.Properties;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.Arrays;
import com.influxdb.client.*;
import com.influxdb.client.InfluxDBClientOptions;
import com.influxdb.client.domain.Authorization;
import com.influxdb.client.domain.WritePrecision;
import com.telematic.telematic_cloud_messaging.message_converters.JSONFlattenerHelper;

import okhttp3.OkHttpClient;

import com.telematic.telematic_cloud_messaging.message_converters.JSON2KeyValuePairsConverter;
import org.json.simple.parser.JSONParser;
import org.json.*;  
import org.slf4j.LoggerFactory;
import org.slf4j.Logger;
import org.apache.commons.lang3.exception.ExceptionUtils;

/**
 * The InfluxDataWriter object creates a client with the InfluxDb and publishes data that has been
 * received from the nats server. Required parameters for connection to InfluxDb are included in
 * the config.properties file.
 */
public class InfluxDataWriter {
    
    Config config_;
    String influx_bucket;
    String influx_bucket_id;

    boolean influx_connected;
    InfluxDBClient influxDBClient;
    InfluxDBClientOptions adminClientOptions;
    WriteApi writeApi;

    private static final Logger logger = LoggerFactory.getLogger(InfluxDataWriter.class);

    /**
     * Constructor to instantiate InfluxDataWriter object
     */
    public InfluxDataWriter(Config config, Config.BucketType bucket_type) {
        logger.debug("Creating new InfluxDataWriter");

        if(bucket_type.equals(Config.BucketType.PLATFORM)){
            this.influx_bucket = config.influx_bucket_platform;
            this.influx_bucket_id = config.influx_bucket_id_platform;
        }
        else if(bucket_type == Config.BucketType.STREETS){
            this.influx_bucket = config.influx_bucket_streets;
            this.influx_bucket_id = config.influx_bucket_id_streets;
        }
        
        config_ = config;

        influx_connected = false;

        logger.info("Attempting to connect to InfluxDb at " + config_.influx_uri);
        logger.info("InfluxDb bucket name: " + influx_bucket);
        logger.info("InfluxDb org name: " + config_.influx_org);
    }   

    /**
     * @return nats_uri ip address of nats server
     */
    public boolean getInfluxConnected() {
        return influx_connected;
    }

    /**
     * Create an influxdb client using the configuration parameters in the config.properties and enable
     * asynchronous writing to the database.
     */
    public void influx_connect() {  
        logger.debug("Attempting to create influxdb client");

        try {
            OkHttpClient.Builder okHttpClientBuilder = new OkHttpClient().newBuilder()
                                                            .connectTimeout(config_.influx_connect_timeout, TimeUnit.MILLISECONDS)            
                                                            .writeTimeout(config_.influx_write_timeout, TimeUnit.MILLISECONDS);
            InfluxDBClientOptions options = InfluxDBClientOptions
                                            .builder()
                                            .url(config_.influx_uri)
                                            .authenticateToken(config_.influx_token.toCharArray())
                                            .org(config_.influx_org)
                                            .bucket(influx_bucket)
                                            .okHttpClient(okHttpClientBuilder)
                                            .build();                                                                       
            influxDBClient = InfluxDBClientFactory.create(options);
            logger.info("Successfully created influxdb client");

            influx_connected = true;
        }
        catch (Exception e) {
            logger.error(ExceptionUtils.getStackTrace(e));
        }

        //Create a new asynchronous non-blocking Write client.
        writeApi = influxDBClient.makeWriteApi();
    }       

    /**
     * @param publishData The data to publish to influxdb
     * @param flattener JsonFlattenerHelper object used to flatten the publishData string
     * @param keyValueConverter JSON2KeyValuePairsConverter object used to properly form key value pairs before writing
     */
    public void publish(String publishData) {
        try {
            String influxRecord = influxStringConverter(publishData);
            
            logger.info("Sending to influxdb: " + influxRecord);
            writeApi.writeRecord(WritePrecision.US, influxRecord);
            writeApi.flush();
        }
        catch (Exception e) {
            logger.error(ExceptionUtils.getStackTrace(e));
        }       
    }

    /**
     * Helper method used to format kafka data into appropriate string for writing to influxdb
     *
     * @param publishData The data to publish to influxdb
     * @param flattener JsonFlattenerHelper object used to flatten the publishData string
     * @param keyValueConverter JSON2KeyValuePairsConverter object used to properly form key value pairs before writing
     * @return record The formatted string for influxdb
     */
    public String influxStringConverter(String publishData) {
        JSONFlattenerHelper jsonFlattener = new JSONFlattenerHelper();
        JSON2KeyValuePairsConverter keyValueConverter = new JSON2KeyValuePairsConverter();

        JSONObject publishDataJson = new JSONObject(publishData);
        JSONObject payloadJson = publishDataJson.getJSONObject("payload");
        
        String flattenedPayloadJson = jsonFlattener.flattenJsonStr(payloadJson.toString());
        String keyValuePairs = keyValueConverter.convertJson2KeyValuePairs(flattenedPayloadJson);

        String unit_id = publishDataJson.getString("unit_id").replaceAll("\\s", "_");
        String unit_type = publishDataJson.getString("unit_type").replaceAll("\\s", "_");
        String event_name = publishDataJson.getString("event_name").replaceAll("\\s", "_");
        String location = publishDataJson.getString("location").replaceAll("\\s", "_");
        String testing_type = publishDataJson.getString("testing_type").replaceAll("\\s", "_");
        String topic_name = publishDataJson.getString("topic_name").replaceAll("\\s", "_");
        String timestamp = Long.toString(publishDataJson.getLong("timestamp")).replaceAll("\\s", "_");

        String record = event_name + "," + "unit_id=" + unit_id + "," + "unit_type=" + unit_type + "," + "location=" + location
        + "," + "testing_type=" + testing_type + "," + "topic_name=" + topic_name + " " + keyValuePairs + " " + timestamp;

        return record;
    }
    
            
}
