package com.telematic.telematic_cloud_messaging.nats_influx_connection;

import org.springframework.stereotype.Component;
import java.io.*;
import java.util.Properties;
import java.util.Arrays;
import com.influxdb.client.*;
import com.influxdb.client.InfluxDBClientOptions;
import com.influxdb.client.domain.Authorization;
import com.influxdb.client.domain.WritePrecision;
import com.telematic.telematic_cloud_messaging.message_converters.JSONFlattenerHelper;
import com.telematic.telematic_cloud_messaging.message_converters.JSON2KeyValuePairsConverter;
import org.json.simple.parser.JSONParser;
import org.json.*;  

/**
 * The InfluxPublisher object creates a client with the InfluxDb and publishes data that has been
 * received from the nats server. Required parameters for connection to InfluxDb are included in
 * the config.properties file.
 */
public class InfluxPublisher {
    String influx_uri;
    String influx_bucket;
    String influx_org;
    String influx_org_id;
    String influx_token;
    String influx_username;
    String influx_pwd;

    boolean influx_connected;
    InfluxDBClient influxDBClient;
    InfluxDBClientOptions adminClientOptions;
    WriteApi writeApi;

    /**
     * Constructor to instantiate InfluxPublisher object
     */
    public InfluxPublisher(String influx_uri, String influx_username, String influx_pwd, String influx_bucket,
        String influx_org, String influx_org_id, String influx_token) {
        System.out.println("Creating new InfluxPublisher");

        this.influx_uri = influx_uri;
        this.influx_username = influx_username;
        this.influx_pwd = influx_pwd;
        this.influx_bucket = influx_bucket;
        this.influx_org = influx_org;
        this.influx_org_id = influx_org_id;
        this.influx_token = influx_token;

        influx_connected = false;

        System.out.println("Attempting to connect to InfluxDb at " + influx_uri);
        System.out.println("InfluxDb bucket name: " + influx_bucket);
        System.out.println("InfluxDb org name: " + influx_org);     
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
        System.out.println("Attempting to create influxdb client");

        try {            
            influxDBClient = InfluxDBClientFactory.create(influx_uri, influx_token.toCharArray(), influx_org, influx_bucket);
            System.out.println("Successfully created influxdb client");

            influx_connected = true;
        }
        catch (Exception e) {
            e.printStackTrace();
        }

        //Create a new asynchronous non-blocking Write client.
        writeApi = influxDBClient.makeWriteApi();
    }       

    /**
     * @param publishData The data to publish to influxdb
     * @param flattener JsonFlattenerHelper object used to flatten the publishData string
     * @param keyValueConverter JSON2KeyValuePairsConverter object used to properly form key value pairs before writing
     */
    public void publish(String publishData, JSONFlattenerHelper flattener, JSON2KeyValuePairsConverter keyValueConverter) {

        //receive from nats server in format below:
        //{'payload': {'metadata': {'timestamp': 1664295886951, 'intersection_type': 'Carma/stop_controlled_intersection'}, 'payload': []}, 
        //'unit_id': 'streets_id', 'unit_type': 'infrastructure', 'unit_name': 'West Intersection', 'event_name': 'UC3', 'location': 'TFHRC', 
        //'testing_type': 'Integration', 'msg_type': 'v2xhub_scheduling_plan_sub', 'topic_name': 'v2xhub_scheduling_plan_sub', 
        //'timestamp': 1664389254620257.0}
        try {
            String influxRecord = influxStringConverter(publishData, flattener, keyValueConverter);
            
            System.out.println("Sending to influxdb: " + influxRecord);
            writeApi.writeRecord(WritePrecision.US, influxRecord);
        }
        catch (Exception e) {
            e.printStackTrace();
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
    public String influxStringConverter(String publishData, JSONFlattenerHelper flattener, JSON2KeyValuePairsConverter keyValueConverter) {
        JSONObject publishDataJson = new JSONObject(publishData);
        JSONObject payloadJson = publishDataJson.getJSONObject("payload");
        
        String flattenedPayloadJson = flattener.flattenJsonStr(payloadJson.toString());
        String keyValuePairs = keyValueConverter.convertJson2KeyValuePairs(flattenedPayloadJson);

        String unit_id = publishDataJson.getString("unit_id");
        String unit_type = publishDataJson.getString("unit_type");
        String event_name = publishDataJson.getString("event_name");
        String location = publishDataJson.getString("location");
        String testing_type = publishDataJson.getString("testing_type");
        String topic_name = publishDataJson.getString("topic_name");
        String timestamp = Long.toString(publishDataJson.getLong("timestamp"));

        String record = event_name + "," + "unit_id=" + unit_id + "," + "unit_type=" + unit_type + "," + "location=" + location
        + "," + "testing_type=" + testing_type + "," + "topic_name=" + topic_name + " " + keyValuePairs + " " + timestamp;

        return record;
    }
    
            
}
