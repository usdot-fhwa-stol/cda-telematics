package com.telematic.telematic_cloud_messaging.nats_influx_connection;

import static org.junit.Assert.assertTrue;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class NatsConsumerTests {

    @Test
    public void natsConnectTest() {        
        try {
            String nats_uri = "44.206.13.7"; //edit to aws nats ipv4
            String nats_subscribe_str = "*.data.*";
            int nats_max_reconnects = 5;

            NatsConsumer natsObject = new NatsConsumer(nats_uri, nats_subscribe_str, nats_max_reconnects);
            assertTrue(natsObject.getNatsConnected() == false);

            natsObject.nats_connect();
            assertTrue(natsObject.getNatsConnected() == true);
        } catch (Exception e) {
            System.out.println("Couldnt connect to nats in test");
            e.printStackTrace();
        }
    }
}
