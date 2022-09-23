package com.telematic.telematic_cloud_messaging.nats_influx_connection;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.Assert.assertTrue;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class NatsInfluxPushTests {
    @Autowired
    NatsInfluxPush helper;

    @Test
    public void flattenJson() {        
        try {
            helper.nats_connect();
            assertTrue(helper.nats_connected == true);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
