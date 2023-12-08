package com.telematic.telematic_cloud_messaging.message_converters;


import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import com.telematic.telematic_cloud_messaging.nats_influx_connection.NatsConsumer;

@ActiveProfiles("test")
@SpringBootTest
public class NatsConsumerTests {

    @Test
    public void natsConnectTest() {        
        try {
            String nats_uri = "127.0.0.1"; //edit to aws nats ipv4
            String nats_subscribe_str = "*.data.*";
            int nats_max_reconnects = 5;
            int topics_per_dispatcher = 3;
            String unit_id_list = "cloud_id, streets_id";
            NatsConsumer natsObject = new NatsConsumer(nats_uri, nats_subscribe_str, nats_max_reconnects,
            topics_per_dispatcher, unit_id_list, "streets");
            assertTrue(natsObject.getNatsConnected() == false);
            
            assertTrue(natsObject.getNatsURI().equals(nats_uri));
            
            natsObject.nats_connect();
            assertTrue(natsObject.getNatsConnected() == false);
        } catch (Exception e) {
            System.out.println("Couldnt connect to nats in test");
            e.printStackTrace();
        }
    }
    @Test
    public void availableTopicsJsonParseTest(){
        try 
        {
            String jsonNullStr = "{topics: null}";
            JSONObject jsonObj = new JSONObject(jsonNullStr);
            Object obj = jsonObj.get("topics");
            assertFalse(obj instanceof JSONArray);

            String jsonEmptyStr = "{topics: []}";
            jsonObj = new JSONObject(jsonEmptyStr);
            Object topicsObject = jsonObj.get("topics");
            assertTrue(topicsObject instanceof JSONArray);
            JSONArray topicList = (JSONArray)topicsObject;
            assertTrue(topicList.length()==0);

            String jsonTopicsStr = "{topics: [test: test]}";
            jsonObj = new JSONObject(jsonTopicsStr);
            topicsObject = jsonObj.get("topics");
            assertTrue(topicsObject instanceof JSONArray);
            topicList = (JSONArray)topicsObject;
            assertTrue(topicList.length()==1);
        } catch (JSONException e) 
        {
            e.printStackTrace();
        }

    }
}
