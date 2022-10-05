// package com.telematic.telematic_cloud_messaging.message_converters;

// import static org.junit.jupiter.api.Assertions.assertEquals;

// import org.json.simple.JSONObject;
// import org.json.simple.parser.JSONParser;
// import org.json.simple.parser.ParseException;
// import org.junit.jupiter.api.Test;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.boot.test.context.SpringBootTest;

// @SpringBootTest
// public class JSONFlattenerHelperTests {
//     @Autowired
//     JSONFlattenerHelper helper;

//     @Test
//     public void flattenJson() {
//         String json_metadata_str = "{\"unit_name\":\"BlackPacifica\",\"event_name\":\"UC3\",\"location\":\"TFHRC\",\"unit_type\":\"Platform\",\"unit_id\":\"DOT-508\",\"testing_type\":\"Integration\"}";
//         String BSM_json_payload_str = "{\"core_data\":{\"accel_set\":{\"lat\":\"2\",\"long\":\"-79\",\"vert\":\"-127\",\"yaw\":\"12\"},\"accuracy\":{\"orientation\":\"65535\",\"semi_major\":\"255\",\"semi_minor\":\"255\"},\"angle\":\"127\",\"brakes\":{\"abs\":\"0\",\"aux_brakes\":\"0\",\"brake_boost\":\"0\",\"scs\":\"0\",\"traction\":\"0\"},\"elev\":\"384\",\"heading\":\"6160\",\"id\":\"11111111\",\"lat\":\"38.9549740\",\"long\":\"-77.1476267\",\"msg_count\":\"70\",\"sec_mark\":\"40328\",\"size\":{\"length\":\"500\",\"width\":\"200\"},\"speed\":\"282\",\"transmission\":\"0\"}}";
//         String json_str = "{ \"metadata\":" + json_metadata_str + ",\"payload\":" + BSM_json_payload_str + "}";
//         String flattened_json_str = helper.flattenJsonStr(json_str);
//         JSONParser parser = new JSONParser();
//         try {
//             JSONObject flattened_json = (JSONObject) parser.parse(flattened_json_str);
//             assertEquals("BlackPacifica", flattened_json.get("metadata.unit_name"));
//             assertEquals("384", flattened_json.get("payload.core_data.elev"));
//             assertEquals("282", flattened_json.get("payload.core_data.speed"));
//             assertEquals("38.9549740", flattened_json.get("payload.core_data.lat"));
//             assertEquals("-77.1476267", flattened_json.get("payload.core_data.long"));
//             assertEquals("Integration", flattened_json.get("metadata.testing_type"));
//         } catch (ParseException e) {
//             e.printStackTrace();
//         }
//     }
// }
