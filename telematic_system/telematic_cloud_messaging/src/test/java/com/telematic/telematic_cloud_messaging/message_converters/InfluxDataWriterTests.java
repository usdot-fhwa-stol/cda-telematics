package com.telematic.telematic_cloud_messaging.nats_influx_connection;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.Assert.assertTrue;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import com.telematic.telematic_cloud_messaging.message_converters.JSONFlattenerHelper;
import com.telematic.telematic_cloud_messaging.message_converters.JSON2KeyValuePairsConverter;

@SpringBootTest
public class InfluxDataWriterTests {
    String influx_uri =  "http://52.71.82.177:8086";
    String influx_username = "admin";
    String influx_pwd = "adminpwd";
    String influx_bucket = "infrastructure-dev";
    String influx_bucket_id = "30c930a3f306cfd6";
    String influx_org =  "my-org";
    String influx_org_id = "12bdc4164c2e8141";
    String influx_token = "iJwbytxMMQ1PpecjvVSRgbK1xUaDeZvU6DLHfXkoezqUfZfVYc8Q1nTIISceFmWvjcJA8NCPX_FMAm2Zw0Q5UA==";
    
    JSONFlattenerHelper jsonFlattener = new JSONFlattenerHelper();
    JSON2KeyValuePairsConverter keyValueConverter = new JSON2KeyValuePairsConverter();
   
    @Test
    public void influxConnectTest() {        
        try {   
            InfluxDataWriter influxDataWriter = new InfluxDataWriter(influx_uri, influx_username, influx_pwd, influx_bucket, influx_bucket_id,
            influx_org, influx_org_id, influx_token);
                  
            assertTrue(influxDataWriter.getInfluxConnected() == false);

            influxDataWriter.influx_connect();
            assertTrue(influxDataWriter.getInfluxConnected() == true);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Test
    public void influxRecordTest() {        
        try {           
            InfluxDataWriter influxDataWriter = new InfluxDataWriter(influx_uri, influx_username, influx_pwd, influx_bucket, influx_bucket_id,
            influx_org, influx_org_id, influx_token);

            String kafka_str = "{\"payload\":{\"metadata\":{\"timestamp\":\"1664295886951\",\"intersection_type\":\"Carma/stop_controlled_intersection\"}, \"payload\":\"\"}, \"unit_id\":\"streets_id\",\"unit_type\":\"infrastructure\",\"unit_name\":\"West Intersection\",\"event_name\":\"UC3\",\"location\":\"TFHRC\", \"testing_type\":\"Integration\",\"msg_type\":\"v2xhub_scheduling_plan_sub\",\"topic_name\":\"v2xhub_scheduling_plan_sub\",\"timestamp\":\"1664389254620257.0\"}";
            String converted_str = influxDataWriter.influxStringConverter(kafka_str);
            String correct_str = "UC3,unit_id=streets_id,unit_type=infrastructure,location=TFHRC,testing_type=Integration,topic_name=v2xhub_scheduling_plan_sub payload=,metadata.intersection_type=\"Carma/stop_controlled_intersection\",metadata.timestamp=1664295886951 1664389254620257";

            assertEquals(converted_str, correct_str);

            System.out.println("Received this string: " + converted_str);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}