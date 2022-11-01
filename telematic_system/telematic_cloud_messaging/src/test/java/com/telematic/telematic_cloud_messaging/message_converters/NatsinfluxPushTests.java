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
    
    //Template unit test for NatsinfluxPush currently performing any checks
    @Test
    public void NatsInfluxPushTest(){
        NatsInfluxPush nats_influx_push = new NatsInfluxPush();
        Config configuration = new Config();
        

        Config.BucketType bucket_type = Config.BucketType.valueOf("Platform");
        try{
            NatsInfluxPush.initialize_data_persistent_service(bucket_type, configuration);
        }catch(Exception e){
            e.printStackTrace();
        }
        
        bucket_type = Config.BucketType.valueOf("Streets");
        try{
            NatsInfluxPush.initialize_data_persistent_service(bucket_type, configuration);
        }catch(Exception e){
            e.printStackTrace();
        }
        
        

    }
}