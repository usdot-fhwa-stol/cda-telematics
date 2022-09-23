package com.telematic.telematic_cloud_messaging.nats_influx_connection;

import org.springframework.stereotype.Component;
import io.nats.client.*;
import java.io.*;
import java.util.Properties;

@Component
public class NatsInfluxPush {
    String NATS_URI = "";
    boolean nats_connected = false;

    /**
     * Load required configuration values from config.properties file    
     */
    private void getConfigValues() {
        try {
            String configFilePath = "src/main/java/com/telematic/telematic_cloud_messaging/nats_influx_connection/config.properties";

            FileInputStream propsInput = new FileInputStream(configFilePath);
            Properties prop = new Properties();
            prop.load(propsInput);

            NATS_URI = prop.getProperty("NATS_URI");

        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
    
    /**
     * @param uri The uri of the nats server to connect to
     * @return The nats connection object
     */
    private Connection initConnection(String uri) {    
        Connection nc = null;
        String connection_string = "";
        try {
            Options options = new Options.Builder().server(NATS_URI).maxReconnects(5).build();
            nc = Nats.connect(options);
            connection_string = "Successfully connected to nats server";
            System.out.println(connection_string);

            nats_connected = true;
        }
        catch (Exception e) {
            connection_string = "Connection exception: " + e;
            System.out.println(connection_string);
        }
        return nc;
    }

    /**
     * Attempt to connect to the nats server
     */
    public void nats_connect() {
        getConfigValues();

        Connection natsConnection = initConnection(NATS_URI);
    }
}
