package com.telematic.telematic_cloud_messaging.nats_influx_connection;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

import org.apache.commons.lang3.exception.ExceptionUtils;
import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.influxdb.client.InfluxDBClient;
import com.influxdb.client.InfluxDBClientFactory;
import com.influxdb.client.InfluxDBClientOptions;
import com.influxdb.client.WriteApi;
import com.influxdb.client.domain.WritePrecision;
import com.telematic.telematic_cloud_messaging.message_converters.JSON2KeyValuePairsConverter;
import com.telematic.telematic_cloud_messaging.message_converters.JSONFlattenerHelper;

import okhttp3.OkHttpClient;

/**
 * The InfluxDataWriter object creates a client with the InfluxDb and publishes data that has been
 * received from the nats server. Required parameters for connection to InfluxDb are included in
 * the config.properties file.
 */
public class InfluxDataWriter {    
    private static final Logger logger = LoggerFactory.getLogger(InfluxDataWriter.class);

    Config influxConfig;
    String influxBucket;
    boolean influxConnected;
    InfluxDBClient influxDBClient;
    InfluxDBClientOptions adminClientOptions;
    WriteApi writeApi;

    /**
     * Constructor to instantiate InfluxDataWriter object
     */
    public InfluxDataWriter(Config config, Config.BucketType bucketType) {
        logger.debug("Creating new InfluxDataWriter");

        if(bucketType.equals(Config.BucketType.PLATFORM)){
            this.influxBucket = config.influxBucketPlatform;
        }
        else if(bucketType == Config.BucketType.STREETS){
            this.influxBucket = config.influxBucketStreets;
        }
        else if(bucketType == Config.BucketType.CLOUD){
            this.influxBucket = config.influxBucketCloud;
        }
        
        influxConfig = config;
        influxConnected = false;

        logger.info("Attempting to connect to InfluxDb at {}", influxConfig.influxUri);
        logger.info("InfluxDb bucket name: {}", influxBucket);
        logger.info("InfluxDb org name: {}", influxConfig.influxOrg);
    }
    
    public List<String> convertCloudDataToString(String incomingCloudData){

        // This method returns a list of TCM messages breaking the list into individual components
        List<String> outputTcmMsgs = new ArrayList<>();
        JSONObject publishDataJson = new JSONObject(incomingCloudData);
        JSONObject payloadJson = publishDataJson.getJSONObject("payload");

        if(payloadJson.has("TrafficControlMessageList")){

            // Get each val from this key and create a new message from it
            JSONObject tcmList = payloadJson.getJSONObject("TrafficControlMessageList");
            try{
                Object item = tcmList.get("TrafficControlMessage");
                
                if(item instanceof JSONArray){
                    JSONArray tcmArray = tcmList.getJSONArray("TrafficControlMessage");

                    for(int i = 0; i < tcmArray.length(); i++)
                    {
                        JSONObject obj = tcmArray.getJSONObject(i);
                        // Create copy of incoming Json
                        JSONObject publishDatacopy = new JSONObject(incomingCloudData);
                        // Replace payload with single TCM
                        publishDatacopy.remove("payload");
                        publishDatacopy.put("payload",obj);
                        outputTcmMsgs.add(publishDatacopy.toString());
                    }
                }
                else{
                    // If object is not a JSONArray it must be JSONObject
                    outputTcmMsgs.add(incomingCloudData); 
                }
            }
            catch (Exception e) {
                logger.error(ExceptionUtils.getStackTrace(e));
            }
        }
        else{
            outputTcmMsgs.add(incomingCloudData);
        }
        
        return outputTcmMsgs;
        
    }

    /**
     * @return nats_uri ip address of nats server
     */
    public boolean getInfluxConnected() {
        return influxConnected;
    }

    /**
     * Create an influxdb client using the configuration parameters in the config.properties and enable
     * asynchronous writing to the database.
     */
    public void influxConnect() {  
        logger.debug("Attempting to create influxdb client");

        try {
            OkHttpClient.Builder okHttpClientBuilder = new OkHttpClient().newBuilder()
                                                            .connectTimeout(influxConfig.influxConnectTimeout, TimeUnit.MILLISECONDS)            
                                                            .writeTimeout(influxConfig.influxWriteTimeout, TimeUnit.MILLISECONDS);
            InfluxDBClientOptions options = InfluxDBClientOptions
                                            .builder()
                                            .url(influxConfig.influxUri)
                                            .authenticateToken(influxConfig.influxToken.toCharArray())
                                            .org(influxConfig.influxOrg)
                                            .bucket(influxBucket)
                                            .okHttpClient(okHttpClientBuilder)
                                            .build();                                                                       
            influxDBClient = InfluxDBClientFactory.create(options);
            logger.info("Successfully created influxdb client");

            influxConnected = true;
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
            
            logger.info("Sending to influxdb: {}" , influxRecord);
            writeApi.writeRecord(WritePrecision.US, influxRecord);
            writeApi.flush();
        }
        catch (Exception e) {
            logger.error(ExceptionUtils.getStackTrace(e));
        }       
    }

    /**
     * @param publishData The data from carma-cloud unit to publish to influxdb
     */
    public void publishCloudData(String publishData) {
        try {
            List<String> cloudDataList = convertCloudDataToString(publishData);
            for(String cloudData : cloudDataList){
                publish(cloudData);
            }
            
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
        String keyValuePairs = keyValueConverter.convertJson2KeyValuePairs(flattenedPayloadJson, influxConfig.toStrFields, influxConfig.ignoreFields);

        String unitId = publishDataJson.getString("unit_id").replaceAll("\\s", "_");
        String unitType = publishDataJson.getString("unit_type").replaceAll("\\s", "_");
        String eventName = publishDataJson.getString("event_name").replaceAll("\\s", "_");
        String location = publishDataJson.getString("location").replaceAll("\\s", "_");
        String testingType = publishDataJson.getString("testing_type").replaceAll("\\s", "_");
        String topicName = publishDataJson.getString("topic_name").replaceAll("\\s", "_");
        String timestamp = Long.toString(publishDataJson.getLong("timestamp"));

        return eventName + "," + "unit_id=" + unitId + "," + "unit_type=" + unitType + "," + "location=" + location
        + "," + "testing_type=" + testingType + "," + "topic_name=" + topicName + " " + keyValuePairs + " " + timestamp;
    }
    
            
}
