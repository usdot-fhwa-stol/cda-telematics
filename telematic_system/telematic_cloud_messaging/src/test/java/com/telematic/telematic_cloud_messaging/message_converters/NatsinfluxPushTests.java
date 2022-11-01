package com.telematic.telematic_cloud_messaging.message_converters;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.internal.runners.statements.ExpectException;

import static org.junit.Assert.assertTrue;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import com.telematic.telematic_cloud_messaging.nats_influx_connection.Config;
import com.telematic.telematic_cloud_messaging.nats_influx_connection.InfluxDataWriter;
import com.telematic.telematic_cloud_messaging.nats_influx_connection.NatsInfluxPush;

@ActiveProfiles("test")
@SpringBootTest
public class NatsinfluxPushTests {
    String nats_uri;    
    String influx_uri;
    String influx_bucket_type;
    String influx_bucket_streets;
    String influx_bucket_id_streets;
    String influx_bucket_platform;
    String influx_bucket_id_platform;
    String influx_org;
    String influx_org_id;
    String influx_token;
    String influx_username;
    String influx_pwd;
    int nats_max_reconnects;
    int influx_connect_timeout;
    int influx_write_timeout;

    

    @Test
    public void NatsInfluxPushTest(){
        NatsInfluxPush nats_influx_push = new NatsInfluxPush();
        Config configuration = new Config();
        

        String bucket_type = "Platform";
        try{
            NatsInfluxPush.initialize_thread(bucket_type, configuration);
        }catch(Exception e){
            e.printStackTrace();
        }
        
        bucket_type = "Streets";
        try{
            NatsInfluxPush.initialize_thread(bucket_type, configuration);
        }catch(Exception e){
            e.printStackTrace();
        }
        
        

    }
}