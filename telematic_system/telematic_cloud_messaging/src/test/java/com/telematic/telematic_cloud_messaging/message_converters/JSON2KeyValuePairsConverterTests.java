package com.telematic.telematic_cloud_messaging.message_converters;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
public class JSON2KeyValuePairsConverterTests {
    @Autowired
    JSON2KeyValuePairsConverter converter;
    
    @Test
    public void convertJson2KeyValuePairs() {
        String json_str = "{\"metadata.unit_name\":\"BlackPacifica\",\"metadata.event_name\":\"UC3\",\"metadata.location\":\"TFHRC\",\"metadata.unit_type\":\"Platform\",\"metadata.unit_id\":\"DOT-508\",\"metadata.testing_type\":\"Integration\",\"payload.core_data.sec_mark\":\"40328\",\"payload.core_data.heading\":\"6160\",\"payload.core_data.brakes.scs\":\"0\",\"payload.core_data.brakes.abs\":\"0\",\"payload.core_data.brakes.aux_brakes\":\"0\",\"payload.core_data.brakes.brake_boost\":\"0\",\"payload.core_data.brakes.traction\":\"0\",\"payload.core_data.accel_set.vert\":\"-127\",\"payload.core_data.accel_set.lat\":\"2\",\"payload.core_data.accel_set.long\":\"-79\",\"payload.core_data.accel_set.yaw\":\"12\",\"payload.core_data.accuracy.orientation\":\"65535\",\"payload.core_data.accuracy.semi_minor\":\"255\",\"payload.core_data.accuracy.semi_major\":\"255\",\"payload.core_data.long\":\"-77.1476267\",\"payload.core_data.speed\":\"282\",\"payload.core_data.transmission\":\"9.890579531202093e-05\",\"payload.core_data.size.length\":\"500\",\"payload.core_data.size.width\":\"200\",\"payload.core_data.elev\":\"384\",\"payload.core_data.angle\":\"127\",\"payload.core_data.id\":\"11111111\",\"payload.core_data.lat\":\"38.9549740\",\"payload.core_data.msg_count\":\"70\"}";
        String k_v_pairs = converter.convertJson2KeyValuePairs(json_str);
        String expected = "metadata.unit_id=\"DOT-508\",payload.core_data.accuracy.semi_major=255,payload.core_data.brakes.abs=0,payload.core_data.transmission=0.0,payload.core_data.brakes.brake_boost=0,payload.core_data.accel_set.long=-79,payload.core_data.accuracy.semi_minor=255,metadata.unit_type=\"Platform\",payload.core_data.brakes.scs=0,payload.core_data.brakes.traction=0,payload.core_data.lat=38.9549740,payload.core_data.heading=6160,payload.core_data.accel_set.yaw=12,payload.core_data.size.length=500,payload.core_data.size.width=200,metadata.testing_type=\"Integration\",payload.core_data.speed=282,payload.core_data.angle=127,metadata.event_name=\"UC3\",payload.core_data.long=-77.1476267,payload.core_data.brakes.aux_brakes=0,payload.core_data.msg_count=70,payload.core_data.accel_set.lat=2,metadata.location=\"TFHRC\",payload.core_data.sec_mark=40328,payload.core_data.id=11111111,metadata.unit_name=\"BlackPacifica\",payload.core_data.accel_set.vert=-127,payload.core_data.elev=384,payload.core_data.accuracy.orientation=65535";
        assertEquals(expected, k_v_pairs);
    }
}
