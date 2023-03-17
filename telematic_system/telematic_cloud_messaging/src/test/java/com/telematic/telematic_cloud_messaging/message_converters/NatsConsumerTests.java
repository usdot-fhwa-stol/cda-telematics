package com.telematic.telematic_cloud_messaging.message_converters;

import static org.junit.Assert.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
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
            String nats_registered_units_uri = "http://ec2-44-206-13-7.compute-1.amazonaws.com:8080/registeredUnits";
            int topics_per_dispatcher = 3;
            NatsConsumer natsObject = new NatsConsumer(nats_uri, nats_subscribe_str, nats_max_reconnects, nats_registered_units_uri, topics_per_dispatcher);
            assertTrue(natsObject.getNatsConnected() == false);
            
            assertTrue(natsObject.getNatsURI().equals(nats_uri));
            
            natsObject.nats_connect();
            assertTrue(natsObject.getNatsConnected() == false);
        } catch (Exception e) {
            System.out.println("Couldnt connect to nats in test");
            e.printStackTrace();
        }
    }
}
