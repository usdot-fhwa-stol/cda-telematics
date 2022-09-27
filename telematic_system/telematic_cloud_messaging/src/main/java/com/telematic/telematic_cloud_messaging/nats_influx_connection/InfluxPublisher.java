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

public class InfluxPublisher {
    private String influx_uri;
    private String influx_bucket;
    private String influx_org;
    private String influx_org_id;
    private String influx_token;
    private String influx_username;
    private String influx_pwd;

    boolean influx_connected;
    InfluxDBClient influxDBClient;
    InfluxDBClientOptions adminClientOptions;
    WriteApi writeApi;


    /**
     * Constructor to instantiate InfluxPublisher object
     */
    public InfluxPublisher() {
        System.out.println("Creating new InfluxPublisher");

        influx_connected = false;

        getConfigValues();
        System.out.println("Attempting to connect to InfluxDb at " + influx_uri);
        System.out.println("InfluxDb bucket name: " + influx_bucket);
        System.out.println("InfluxDb org name: " + influx_org);     
    }


    /**
     * @return influx_uri ip address of influx server
     */
    public String getinfluxURI() {
        return influx_uri;
    }

    /**
     * Load required configuration values from config.properties file    
     */
    private void getConfigValues() {
        try {
            String configFilePath = "src/main/java/com/telematic/telematic_cloud_messaging/nats_influx_connection/config.properties";

            FileInputStream propsInput = new FileInputStream(configFilePath);
            Properties prop = new Properties();
            prop.load(propsInput);

            influx_uri = "http://" + prop.getProperty("INFLUX_URI") + ":" + prop.getProperty("INFLUX_PORT");
            influx_username = prop.getProperty("INFLUX_USERNAME");
            influx_pwd = prop.getProperty("INFLUX_PWD");
            influx_bucket = prop.getProperty("INFLUX_BUCKET");
            influx_org = prop.getProperty("INFLUX_ORG");
            influx_org_id = prop.getProperty("INFLUX_ORG_ID");
            influx_token = prop.getProperty("INFLUX_TOKEN");

        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }       
    
    /**
     * The uri of the influx server to connect to
     */
    public void influx_connect() {  
        System.out.println("Attempting to create influxdb client");
  
        adminClientOptions = InfluxDBClientOptions.builder()
                .url(influx_uri)
                .org(influx_org)
                .authenticate(influx_username, influx_pwd.toCharArray())
                .bucket(influx_bucket)
                .build();

        try {
            // influxDBClient = InfluxDBClientFactory.create(adminClientOptions);
            
            influxDBClient = InfluxDBClientFactory.create(influx_uri, influx_token.toCharArray(), influx_org, influx_bucket);

            System.out.println("Successfully created influxdb client");
        }
        catch (Exception e) {
            e.printStackTrace();
        }

        writeApi = influxDBClient.getWriteApi();
    }       

    public void publish(String publishData, JSONFlattenerHelper flattener, JSON2KeyValuePairsConverter keyValueConverter) {

        String flattenedJson = flattener.flattenJsonStr(publishData);
        String keyValuePairs = keyValueConverter.convertJson2KeyValuePairs(flattenedJson);

        System.out.println("Writing record to influx: " + keyValuePairs);

        try {
            writeApi.writeRecord(WritePrecision.US, keyValuePairs);
        }
        catch (Exception e) {
            e.printStackTrace();
        }
    }
            
}
