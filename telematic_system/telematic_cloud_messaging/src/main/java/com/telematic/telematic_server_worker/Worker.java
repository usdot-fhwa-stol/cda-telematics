package com.telematic.telematic_server_worker;


import java.util.*;
import io.nats.client.*;
import io.nats.client.ConnectionListener.Events;
import java.time.Duration;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.*;
import java.nio.charset.StandardCharsets;

import com.influxdb.client.InfluxDBClient;
import com.influxdb.client.InfluxDBClientFactory;
import com.influxdb.client.QueryApi;
import com.influxdb.client.WriteApi;
import com.influxdb.client.WriteApiBlocking;
import com.influxdb.client.domain.WritePrecision;
import com.influxdb.client.write.Point;
import com.influxdb.exceptions.InfluxException;
import com.telematic.telematic_cloud_messaging.message_converters.*;
import com.telematic.telematic_server_worker.*;


public class Worker {

    private static final Logger logger = LogManager.getLogger(Worker.class);

    // Configuration
    public Properties config;
    private String nats_uri;

    private influxdbOptions influxdb_options_;

    private static class influxdbOptions{
        
        private String influxdb_token;
        private String influxdb_uri;
        private String influxdb_bucket;
        private String influxdb_org;
        
        public influxdbOptions(String uri, String token, String org,String bucket){
            influxdb_uri = uri;
            influxdb_org = org;
            influxdb_token = token;
            influxdb_bucket = bucket;
        } 
    };


    public Worker() throws Worker_Exception{

        get_configuration_parameters();
        
    }

    private void get_configuration_parameters() throws Worker_Exception{
        
        // Load configuration parameter
        InputStream io = this.getClass()
                             .getClassLoader()
                             .getResourceAsStream("application.properties");
        this.config = new Properties();
        
        try{
            config.load(io);
            this.nats_uri = config.getProperty("nats_uri");
            this.influxdb_options_ = new influxdbOptions(config.getProperty("influxdb_uri"), config.getProperty("influxdb_token"), 
                                        config.getProperty("influxdb_org"), config.getProperty("influxdb_bucket"));


        }catch(Exception exe){
            logger.error("Could not load configuration");
            throw new Worker_Exception("Could not load configuration");
        }
        
    }

    // Method to create Nats connection options
    public static Options createOptions(String server) throws Exception{
        Options.Builder builder = new Options.Builder().
                        server(server).
                        connectionTimeout(Duration.ofSeconds(5)).
                        pingInterval(Duration.ofSeconds(2)).
                        reconnectWait(Duration.ofSeconds(1)).
                        maxReconnects(-1).
                        traceConnection();

        builder = builder.connectionListener((conn, type) -> logger.debug("Status change " + type));

        builder = builder.errorListener(new ErrorListener(){
            @Override
            public void slowConsumerDetected(Connection conn, Consumer consumer){
                logger.debug("NATS connection slow consumer detected");
            }

            @Override
            public void exceptionOccurred(Connection conn, Exception exp){
                logger.debug("NATS connection exception occurred");
                exp.printStackTrace();
            }

            @Override
            public void errorOccurred(Connection conn, String error){
                logger.debug("NATS connection error occurred" + error);
            }
        });

        return builder.build();
    }

    private void stream_data(String nats_msg){
        
        // Flatten json string
        JSONFlattenerHelper flatten_helper = new JSONFlattenerHelper();
        flatten_helper.flattenJsonStr(nats_msg);

        write2influxDB(nats_msg, influxdb_options_);
    }

    private static void write2influxDB(String line, influxdbOptions options) throws InfluxException{

        // Connect to influxdb
        InfluxDBClient influxDBClient = InfluxDBClientFactory.create(options.influxdb_uri, options.influxdb_token.toCharArray(), 
                                                        options.influxdb_org, options.influxdb_bucket);
        WriteApiBlocking writeApi = influxDBClient.getWriteApiBlocking();
        
        try{
            writeApi.writeRecord(WritePrecision.MS, line);
        }catch(InfluxException e){
            logger.error("Could not write to influxdb" + e);
            e.printStackTrace();
        }


    }



    public static void main(String args[])
    {
        

        // Initialize
        try
        {
            Worker worker = new Worker();

            // Connect Nats
            Options options = createOptions(worker.nats_uri);
            Connection nc = Nats.connect(options);
            
            Dispatcher register_sub_ = nc.createDispatcher(msg-> {
                worker.stream_data(new String(msg.getData(), StandardCharsets.UTF_8));
            });

        register_sub_.subscribe("*.data.>");
        }
        catch(Exception exe)
        {
            exe.printStackTrace();
        }
        
    }
};