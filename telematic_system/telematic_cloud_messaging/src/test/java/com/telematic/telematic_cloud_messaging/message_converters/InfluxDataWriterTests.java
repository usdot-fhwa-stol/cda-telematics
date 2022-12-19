package com.telematic.telematic_cloud_messaging.message_converters;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.internal.runners.statements.ExpectException;

import static org.junit.Assert.assertTrue;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import com.telematic.telematic_cloud_messaging.message_converters.JSON2KeyValuePairsConverter;
import com.telematic.telematic_cloud_messaging.message_converters.JSONFlattenerHelper;
import com.telematic.telematic_cloud_messaging.nats_influx_connection.InfluxDataWriter;
import com.telematic.telematic_cloud_messaging.nats_influx_connection.Config;

import org.json.XML;
import org.json.JSONObject;
import java.util.List;


@ActiveProfiles("test")
@SpringBootTest
public class InfluxDataWriterTests {
    String influx_uri =  "http://52.71.82.177:8086";
    String influx_username = "admin";
    String influx_pwd = "adminpwd";
    String influx_bucket = "infrastructure-dev";
    String influx_org =  "my-org";
    String influx_org_id = "12bdc4164c2e8141";
    String influx_token = "iJwbytxMMQ1PpecjvVSRgbK1xUaDeZvU6DLHfXkoezqUfZfVYc8Q1nTIISceFmWvjcJA8NCPX_FMAm2Zw0Q5UA==";
    int connect_timeout = 10;
    int write_timeout = 10;
    
    JSONFlattenerHelper jsonFlattener = new JSONFlattenerHelper();
    JSON2KeyValuePairsConverter keyValueConverter = new JSON2KeyValuePairsConverter();
   
    @Test
    public void influxConnectTest() {        
        try {
            Config config = new Config();
            Config.BucketType bucket_type = Config.BucketType.PLATFORM;
              
            InfluxDataWriter influxDataWriter = new InfluxDataWriter(config, bucket_type);
                  
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
            Config config = new Config();
            Config.BucketType bucket_type = Config.BucketType.STREETS;
            InfluxDataWriter influxDataWriter = new InfluxDataWriter(config, bucket_type);

            String kafka_str = "{\"payload\":{\"metadata\":{\"timestamp\":\"1664295886951\",\"intersection_type\":\"Carma/stop_controlled_intersection\"}, \"payload\":\"\"}, \"unit_id\":\"streets_id\",\"unit_type\":\"infrastructure\",\"unit_name\":\"West Intersection\",\"event_name\":\"UC3\",\"location\":\"TFHRC\", \"testing_type\":\"Integration\",\"msg_type\":\"v2xhub_scheduling_plan_sub\",\"topic_name\":\"v2xhub_scheduling_plan_sub\",\"timestamp\":\"1664389254620257.0\"}";
            String converted_str = influxDataWriter.influxStringConverter(kafka_str);
            String correct_str = "UC3,unit_id=streets_id,unit_type=infrastructure,location=TFHRC,testing_type=Integration,topic_name=v2xhub_scheduling_plan_sub payload=\"NA\",metadata.intersection_type=\"Carma/stop_controlled_intersection\",metadata.timestamp=1664295886951 1664389254620257";

            assertEquals(converted_str, correct_str);

            System.out.println("Received this string: " + converted_str);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Test
    public void influxCloudTest() {
        try {
            
            Config config = new Config();
            Config.BucketType bucket_type = Config.BucketType.CLOUD;
            InfluxDataWriter influxDataWriter = new InfluxDataWriter(config, bucket_type);

            // Convert sample payload xml to json 
            String input_json_string = "<TrafficControlMessageList><TrafficControlMessage><tcmV01><reqid>0102030405060708</reqid><reqseq>0</reqseq><msgtot>6</msgtot><msgnum>1</msgnum><id>001698403caedb603139c0f158992a7d</id><updated>0</updated><package><label>platform test</label><tcids><Id128b>001698403caedb603139c0f158992a7d</Id128b></tcids></package><params><vclasses><micromobile/><motorcycle/><passenger-car/><light-truck-van/><bus/><two-axle-six-tire-single-unit-truck/><three-axle-single-unit-truck/><four-or-more-axle-single-unit-truck/><four-or-fewer-axle-single-trailer-truck/><five-axle-single-trailer-truck/><six-or-more-axle-single-trailer-truck/><five-or-fewer-axle-multi-trailer-truck/><six-axle-multi-trailer-truck/><seven-or-more-axle-multi-trailer-truck/></vclasses><schedule><start>27813460</start><end>153722867280912</end><dow>1111111</dow></schedule><regulatory><true/></regulatory><detail><closed><notopen/></closed></detail></params><geometry><proj>epsg:3785</proj><datum>WGS84</datum><reftime>27813460</reftime><reflon>-771498705</reflon><reflat>389551653</reflat><refelv>0</refelv><refwidth>382</refwidth><heading>3312</heading><nodes><PathNode><x>1</x><y>0</y><width>0</width></PathNode><PathNode><x>-1260</x><y>802</y><width>3</width></PathNode><PathNode><x>-1176</x><y>923</y><width>2</width></PathNode><PathNode><x>-248</x><y>226</y><width>-2</width></PathNode></nodes></geometry></tcmV01></TrafficControlMessage><TrafficControlMessage><tcmV01><reqid>0102030405060708</reqid><reqseq>0</reqseq><msgtot>6</msgtot><msgnum>2</msgnum><id>0052b25d169a4a00c71c038fa70abbd7</id><updated>0</updated><package><label>workzone</label><tcids><Id128b>0052b25d169a4a00c71c038fa70abbd7</Id128b></tcids></package><params><vclasses><micromobile/><motorcycle/><passenger-car/><light-truck-van/><bus/><two-axle-six-tire-single-unit-truck/><three-axle-single-unit-truck/><four-or-more-axle-single-unit-truck/><four-or-fewer-axle-single-trailer-truck/><five-axle-single-trailer-truck/><six-or-more-axle-single-trailer-truck/><five-or-fewer-axle-multi-trailer-truck/><six-axle-multi-trailer-truck/><seven-or-more-axle-multi-trailer-truck/></vclasses><schedule><start>27830621</start><end>153722867280912</end><dow>1111111</dow></schedule><regulatory><true/></regulatory><detail><maxspeed>45</maxspeed></detail></params><geometry><proj>epsg:3785</proj><datum>WGS84</datum><reftime>27830621</reftime><reflon>-771509819</reflon><reflat>389557957</reflat><refelv>0</refelv><refwidth>413</refwidth><heading>3312</heading><nodes><PathNode><x>1</x><y>0</y><width>0</width></PathNode><PathNode><x>322</x><y>18</y><width>-16</width></PathNode></nodes></geometry></tcmV01></TrafficControlMessage><TrafficControlMessage><tcmV01><reqid>0102030405060708</reqid><reqseq>0</reqseq><msgtot>6</msgtot><msgnum>3</msgnum><id>00242a9dc147efc795dbb8a5dda83e33</id><updated>0</updated><package><label>workzone</label><tcids><Id128b>00242a9dc147efc795dbb8a5dda83e33</Id128b></tcids></package><params><vclasses><micromobile/><motorcycle/><passenger-car/><light-truck-van/><bus/><two-axle-six-tire-single-unit-truck/><three-axle-single-unit-truck/><four-or-more-axle-single-unit-truck/><four-or-fewer-axle-single-trailer-truck/><five-axle-single-trailer-truck/><six-or-more-axle-single-trailer-truck/><five-or-fewer-axle-multi-trailer-truck/><six-axle-multi-trailer-truck/><seven-or-more-axle-multi-trailer-truck/></vclasses><schedule><start>27830622</start><end>153722867280912</end><dow>1111111</dow></schedule><regulatory><true/></regulatory><detail><maxspeed>45</maxspeed></detail></params><geometry><proj>epsg:3785</proj><datum>WGS84</datum><reftime>27830622</reftime><reflon>-771509776</reflon><reflat>389557959</reflat><refelv>0</refelv><refwidth>411</refwidth><heading>3312</heading><nodes><PathNode><x>1</x><y>0</y><width>-1</width></PathNode><PathNode><x>1488</x><y>-38</y><width>-31</width></PathNode><PathNode><x>1426</x><y>-421</y><width>16</width></PathNode><PathNode><x>1281</x><y>-765</y><width>18</width></PathNode><PathNode><x>1104</x><y>-1003</y><width>-37</width></PathNode><PathNode><x>749</x><y>-1153</y><width>-3</width></PathNode></nodes></geometry></tcmV01></TrafficControlMessage><TrafficControlMessage><tcmV01><reqid>0102030405060708</reqid><reqseq>0</reqseq><msgtot>6</msgtot><msgnum>4</msgnum><id>0033d7ce1c56cbe32b0f94d1d4d0d23e</id><updated>0</updated><package><label>workzone</label><tcids><Id128b>0033d7ce1c56cbe32b0f94d1d4d0d23e</Id128b></tcids></package><params><vclasses><motorcycle/><passenger-car/><light-truck-van/><bus/><two-axle-six-tire-single-unit-truck/><three-axle-single-unit-truck/><four-or-more-axle-single-unit-truck/><four-or-fewer-axle-single-trailer-truck/><five-axle-single-trailer-truck/><six-or-more-axle-single-trailer-truck/><five-or-fewer-axle-multi-trailer-truck/><six-axle-multi-trailer-truck/><seven-or-more-axle-multi-trailer-truck/></vclasses><schedule><start>27830632</start><end>153722867280912</end><dow>1111111</dow></schedule><regulatory><true/></regulatory><detail><maxspeed>45</maxspeed></detail></params><geometry><proj>epsg:3785</proj><datum>WGS84</datum><reftime>27830632</reftime><reflon>-771503828</reflon><reflat>389554968</reflat><refelv>0</refelv><refwidth>371</refwidth><heading>3312</heading><nodes><PathNode><x>1</x><y>0</y><width>0</width></PathNode><PathNode><x>917</x><y>-1182</y><width>2</width></PathNode><PathNode><x>1027</x><y>-1090</y><width>2</width></PathNode><PathNode><x>1074</x><y>-1040</y><width>3</width></PathNode><PathNode><x>1167</x><y>-930</y><width>2</width></PathNode><PathNode><x>1264</x><y>-800</y><width>2</width></PathNode><PathNode><x>1334</x><y>-673</y><width>3</width></PathNode><PathNode><x>1384</x><y>-571</y><width>4</width></PathNode><PathNode><x>1322</x><y>-524</y><width>1</width></PathNode></nodes></geometry></tcmV01></TrafficControlMessage><TrafficControlMessage><tcmV01><reqid>0102030405060708</reqid><reqseq>0</reqseq><msgtot>6</msgtot><msgnum>5</msgnum><id>00b270eac7e965b98fbdc283006e41dd</id><updated>0</updated><package><label>workzone</label><tcids><Id128b>00b270eac7e965b98fbdc283006e41dd</Id128b></tcids></package><params><vclasses><micromobile/><motorcycle/><passenger-car/><light-truck-van/><bus/><two-axle-six-tire-single-unit-truck/><three-axle-single-unit-truck/><four-or-more-axle-single-unit-truck/><four-or-fewer-axle-single-trailer-truck/><five-axle-single-trailer-truck/><six-or-more-axle-single-trailer-truck/><five-or-fewer-axle-multi-trailer-truck/><six-axle-multi-trailer-truck/><seven-or-more-axle-multi-trailer-truck/></vclasses><schedule><start>27818963</start><end>153722867280912</end><dow>1111111</dow></schedule><regulatory><true/></regulatory><detail><maxspeed>90</maxspeed></detail></params><geometry><proj>epsg:3785</proj><datum>WGS84</datum><reftime>27818963</reftime><reflon>-771490953</reflon><reflat>389549263</reflat><refelv>0</refelv><refwidth>396</refwidth><heading>3312</heading><nodes><PathNode><x>1</x><y>0</y><width>0</width></PathNode><PathNode><x>1476</x><y>-248</y><width>15</width></PathNode><PathNode><x>1484</x><y>-190</y><width>22</width></PathNode><PathNode><x>1489</x><y>-132</y><width>18</width></PathNode><PathNode><x>1493</x><y>-67</y><width>5</width></PathNode><PathNode><x>1494</x><y>-20</y><width>-8</width></PathNode><PathNode><x>1492</x><y>83</y><width>-12</width></PathNode><PathNode><x>1490</x><y>148</y><width>-6</width></PathNode><PathNode><x>1484</x><y>206</y><width>-2</width></PathNode><PathNode><x>1475</x><y>248</y><width>-9</width></PathNode><PathNode><x>1040</x><y>207</y><width>-3</width></PathNode></nodes></geometry></tcmV01></TrafficControlMessage><TrafficControlMessage><tcmV01><reqid>0102030405060708</reqid><reqseq>0</reqseq><msgtot>6</msgtot><msgnum>6</msgnum><id>007dfe6e1f6d35f8f72d6ff4832d043a</id><updated>0</updated><package><label>workzone</label><tcids><Id128b>007dfe6e1f6d35f8f72d6ff4832d043a</Id128b></tcids></package><params><vclasses><micromobile/><motorcycle/><passenger-car/><light-truck-van/><bus/><two-axle-six-tire-single-unit-truck/><three-axle-single-unit-truck/><four-or-more-axle-single-unit-truck/><four-or-fewer-axle-single-trailer-truck/><five-axle-single-trailer-truck/><six-or-more-axle-single-trailer-truck/><five-or-fewer-axle-multi-trailer-truck/><six-axle-multi-trailer-truck/><seven-or-more-axle-multi-trailer-truck/></vclasses><schedule><start>27817693</start><end>153722867280912</end><dow>1111111</dow></schedule><regulatory><true/></regulatory><detail><maxspeed>9</maxspeed></detail></params><geometry><proj>epsg:3785</proj><datum>WGS84</datum><reftime>27817693</reftime><reflon>-771484526</reflon><reflat>389548802</reflat><refelv>0</refelv><refwidth>450</refwidth><heading>3312</heading><nodes><PathNode><x>1</x><y>0</y><width>0</width></PathNode><PathNode><x>1494</x><y>60</y><width>-10</width></PathNode><PathNode><x>1490</x><y>134</y><width>-6</width></PathNode><PathNode><x>1484</x><y>208</y><width>-6</width></PathNode><PathNode><x>1478</x><y>236</y><width>-5</width></PathNode><PathNode><x>1469</x><y>287</y><width>-9</width></PathNode><PathNode><x>1468</x><y>298</y><width>-4</width></PathNode><PathNode><x>939</x><y>191</y><width>-2</width></PathNode></nodes></geometry></tcmV01></TrafficControlMessage></TrafficControlMessageList>";
            JSONObject payload_val = XML.toJSONObject(input_json_string);

            JSONObject str_map = new JSONObject();
            str_map.put("payload", payload_val);
            str_map.put("unit_id", "123");
            str_map.put("unit_type", "cloud");
            str_map.put("unit_name","cloud");
            str_map.put("msg_type","new_carma_cloud_message_type");
            str_map.put("event_name","event");
            str_map.put("testing_type","unit_test");
            str_map.put("location","unit_test");
            str_map.put("topic_name","topic");
            str_map.put("timestamp","1984");
            str_map.put("log_timestamp","1984");

            List<String> split_tcm_list = influxDataWriter.splitCloudTCMList(str_map.toString());
            assertEquals(6, split_tcm_list.size());

            String input_json_string_2 = "<TrafficControlMessageList><TrafficControlMessage><tcmV01><reqid>0102030405060708</reqid><reqseq>0</reqseq><msgtot>6</msgtot><msgnum>1</msgnum><id>001698403caedb603139c0f158992a7d</id><updated>0</updated><package><label>platform test</label><tcids><Id128b>001698403caedb603139c0f158992a7d</Id128b></tcids></package><params><vclasses><micromobile/><motorcycle/><passenger-car/><light-truck-van/><bus/><two-axle-six-tire-single-unit-truck/><three-axle-single-unit-truck/><four-or-more-axle-single-unit-truck/><four-or-fewer-axle-single-trailer-truck/><five-axle-single-trailer-truck/><six-or-more-axle-single-trailer-truck/><five-or-fewer-axle-multi-trailer-truck/><six-axle-multi-trailer-truck/><seven-or-more-axle-multi-trailer-truck/></vclasses><schedule><start>27813460</start><end>153722867280912</end><dow>1111111</dow></schedule><regulatory><true/></regulatory><detail><closed><notopen/></closed></detail></params><geometry><proj>epsg:3785</proj><datum>WGS84</datum><reftime>27813460</reftime><reflon>-771498705</reflon><reflat>389551653</reflat><refelv>0</refelv><refwidth>382</refwidth><heading>3312</heading><nodes><PathNode><x>1</x><y>0</y><width>0</width></PathNode><PathNode><x>-1260</x><y>802</y><width>3</width></PathNode><PathNode><x>-1176</x><y>923</y><width>2</width></PathNode><PathNode><x>-248</x><y>226</y><width>-2</width></PathNode></nodes></geometry></tcmV01></TrafficControlMessage></TrafficControlMessageList>";
            JSONObject payload_val_2 = XML.toJSONObject(input_json_string_2);

            str_map.remove("payload");
            str_map.put("payload", payload_val_2);
            List<String> split_tcm_list_2 = influxDataWriter.splitCloudTCMList(str_map.toString());
            assertEquals(1, split_tcm_list_2.size());
    



        }catch (Exception e) {
            e.printStackTrace();
        }
    }
}
