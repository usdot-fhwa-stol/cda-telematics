package com.telematic.api;

import java.util.*;
import io.nats.client.*;
import io.nats.client.ConnectionListener.Events;
import java.time.Duration;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import java.util.*;
import java.util.concurrent.*;
import java.lang.*;
import java.io.*;
import java.net.*; //URI queries
import java.nio.charset.StandardCharsets;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

import java.util.Timer.*;

import com.telematic.api.*;
import com.telematic.telematic_cloud_messaging.message_converters.*;

// @Service
public class API {

    private static final Logger logger = LogManager.getLogger(API.class);

    // Configuration
    public Properties config;
    private String uri;
    private String event_name;
    private String location;
    private String testing_type;

    public API() throws API_Exception{

        // Get configuration parameters
        this.get_configuration_parameters();

        // Initialize non static members
        registered_units_ = new Vector();

    }

    private void get_configuration_parameters() throws API_Exception{
        
        // Load configuration parameter
        InputStream io = this.getClass()
                             .getClassLoader()
                             .getResourceAsStream("application.properties");
        this.config = new Properties();
        
        try{
            config.load(io);
            this.uri = config.getProperty("URI");
            this.event_name = config.getProperty("Event_Name");
            this.location = config.getProperty("Location");
            this.testing_type = config.getProperty("Testing_Type");

        }catch(Exception exe){
            logger.error("Could not load configuration");
            throw new API_Exception("Could not load configuration");
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


    private class Topics{
        String name;
        String type;
    };

    private static class Node{
        public String unit_id;
        public String unit_type;
        public float timestamp;
        Vector<Topics> topics;
    };

    public Vector<Node> registered_units_;


    /**
    * returns the url parameters in a map
    * @param query
    * @return map
    */
    public static Map<String, String> splitQuery(String query) throws UnsupportedEncodingException {
        Map<String, String> query_pairs = new LinkedHashMap<String, String>();
        
        String[] pairs = query.split("&");
        int i = 0;
        for (String pair : pairs) {
            if(i == 0){
                int first_idx = pair.indexOf("?");
                int idx = pair.indexOf("=");
                query_pairs.put(URLDecoder.decode(pair.substring(first_idx + 1, idx), "UTF-8"), URLDecoder.decode(pair.substring(idx + 1), "UTF-8"));
            }
            else{
                int idx = pair.indexOf("=");
                query_pairs.put(URLDecoder.decode(pair.substring(0, idx), "UTF-8"), URLDecoder.decode(pair.substring(idx + 1), "UTF-8"));
            }
            ++i;
        }
        return query_pairs;
    }


    private static class baseRoot implements HttpHandler {

        @Override
        public void handle(HttpExchange httpExchange) throws IOException {
            String response = "NATS base";
            httpExchange.sendResponseHeaders(200, response.length());
            OutputStream os = httpExchange.getResponseBody();
            os.write(response.getBytes());
            os.close();
        }
    }

    private static class getRegisteredUnits implements HttpHandler {
        // Returns registered units
        private static Vector<Node> registered_units_ ; 

        public getRegisteredUnits(Vector<Node> registered_units){
            registered_units_ = new Vector();
            if(!registered_units.isEmpty()){
                registered_units_ = new Vector<>(registered_units);
            }
            // Create registered_node

        }
        /**
        * Http request handle that reads from the list of registered units and returns it as a string
        * in the response
        */
        @Override
        public void handle(HttpExchange httpExchange) throws IOException{
            
            // write the registered units
            ObjectMapper mapper = new ObjectMapper();
            String response = "";
            for(int i  = 0; i < registered_units_.size(); ++i){
                response += mapper.writeValueAsString(registered_units_.get(i));
                response +=";";
            }
            
            httpExchange.sendResponseHeaders(200, response.length());
            OutputStream os = httpExchange.getResponseBody();
            os.write(response.getBytes());
            os.close();

        }
    }

    private static class requestAvailableTopics implements HttpHandler {
        // Forwards https request to telematic module as nats request
        // Sends the recieved nats response as http response
        private static Vector<Node> registered_units_ ; 
        // Handle for making nats request
        private static Connection nc_;

        public requestAvailableTopics(Vector<Node> registered_units, Connection nc){
            registered_units_ = new Vector();
            if(!registered_units.isEmpty()){
                registered_units_ = new Vector<>(registered_units);
            }
            nc_ = nc;

        }

        @Override
        public void handle(HttpExchange httpExchange) throws IOException{
            
            Map<String, String> request_param_values = splitQuery(httpExchange.getRequestURI().toString());

            // Get Unit Id
            if(!request_param_values.containsKey("unit_id")){
                logger.error("Url Param 'key' is missing. Please define unit_id");
                throw new IOException("Url Param 'key' is missing.");
            }
            String requested_unit = request_param_values.get("unit_id");

            // Search registered units to check if given unit is running
            boolean found_unit = false;
            for(Node node : registered_units_ ){
                if(node.unit_id.equals(requested_unit)){
                    found_unit = true;
                    break;
                }
            }
            if(!found_unit){
                logger.error("Specified unit: " + requested_unit + ", is not currently registered. Cannot request available topics");
                throw new IOException("Specified unit :" + requested_unit + ", is not currently registered. Cannot request available topics");
            }

            // If unit is registered send a NATS request
            String request_message = new String();
            Future<Message> incoming = nc_.request(requested_unit + ".available_topics", request_message.getBytes(StandardCharsets.UTF_8));
            // Wait 2 seconds for a response
            try{
                Message msg = incoming.get(2, TimeUnit.SECONDS);
                String response = new String(msg.getData(), StandardCharsets.UTF_8);

                // Send response as data to http
                httpExchange.sendResponseHeaders(200, response.length());
                OutputStream os = httpExchange.getResponseBody();
                os.write(response.getBytes());
                os.close();
            }
            catch(InterruptedException exe){
                logger.error("Interrupted Process. Error in getting available topics " + exe);
                throw new IOException("Error in getting available topics " + exe);
            }
            catch(ExecutionException exe){
                logger.error("Error in getting available topics " + exe);
                throw new IOException("Error in getting available topics " + exe);
            }
            catch(TimeoutException exe){
                logger.error("Timeout Error in getting available topics " + exe);
                throw new IOException("Error in getting available topics " + exe);
            }

        }

    }

    private static Node register_unit(String nats_msg){
        Node unit_to_register = new Node();
        logger.debug("Incoming message: " + nats_msg);
        // Convert json string to key-value pair
        JSONParser parser = new JSONParser();
        try{
            JSONObject json = (JSONObject) parser.parse(nats_msg);
            logger.debug("Parsed message");
            for (Object key : json.keySet()) {
                Object value = json.get(key.toString());
                
                logger.debug("Got Key:"+ key.toString());
                logger.debug("Val: "+  value.toString());

                if (value == null) {
                    continue;
                }
                if(key.toString().equals("unit_id")){
                    unit_to_register.unit_id = value.toString();
                }
                else if(key.toString().equals("unit_type")){
                    unit_to_register.unit_type = value.toString();
                    break;
                }
                else if(key.toString().equals("timestamp")){
                    unit_to_register.timestamp = Float.parseFloat(value.toString());
                }
                else{
                    continue;
                    // logger.debug("Ignoring key: " + key.toString());
                }
            }
        }catch (ParseException e) {
            logger.warn("Couldn't parse: " + e);
            e.printStackTrace();
        }
        
        logger.debug("Completed json parsing");
        return unit_to_register;

    }

    private static class publishSelectedTopics implements HttpHandler{

        // Handle for making nats request
        private static Connection nc_;

        public publishSelectedTopics(Connection nc){
            nc_ = nc;
        }

        @Override
        public void handle(HttpExchange httpExchange) throws IOException{
            // Stream Post Request as string
            InputStreamReader inputStreamReader = new InputStreamReader(httpExchange.getRequestBody(), "utf-8");
            BufferedReader br = new BufferedReader(inputStreamReader);

            int b;
            StringBuilder json_strbuilder = new StringBuilder(512);
            while((b = br.read()) != -1) {
                json_strbuilder.append((char) b);
            }

            br.close();
            inputStreamReader.close();

            // Convert string to json object
            JSONParser parser = new JSONParser();
            try {
                JSONObject json = (JSONObject) parser.parse(json_strbuilder.toString());
                
                String unit_id_val = new String();
                if (json.containsKey("unit_id"))
                {
                    unit_id_val = json.get("unit_id").toString();
                }
                else{
                    throw new IOException("Required parameter UnitId not specified");
                }

                // Send NATs request
                String request_message = new String(json_strbuilder.toString());
                Future<Message> incoming = nc_.request(unit_id_val + ".available_topics", request_message.getBytes(StandardCharsets.UTF_8));
                // Wait 5 seconds for a response
                try{
                    Message msg = incoming.get(5, TimeUnit.SECONDS);
                    String response = new String(msg.getData(), StandardCharsets.UTF_8);

                    logger.debug("Response: " + response);
                }
                catch(ExecutionException exe){
                logger.error("Error in getting available topics " + exe);
                throw new IOException("Error in getting available topics " + exe);
                }
                catch(TimeoutException exe){
                    logger.error("Timeout Error in getting available topics " + exe);
                    throw new IOException("Error in getting available topics " + exe);
                }
                catch(InterruptedException exe){
                    logger.error("Interrupted Process. Error making NATS request to publish topics " + exe);
                    throw new IOException("Error making NATS request to publish topics  " + exe);
                }
                
            }
            catch(ParseException e){
                e.printStackTrace();
            }

        }
    }

    private static class checkStatus extends TimerTask{
        
        private Vector<Node> registered_units_;
        private static Connection nc_;
        checkStatus(Vector<Node> registered_units, Connection nc){
            registered_units_ = new Vector();
            if(!registered_units.isEmpty()){
                registered_units_ = new Vector<>(registered_units);
            }
            nc_ = nc;
        }

        @Override
        public void run(){
            String request_message = new String();
            
            Vector<Node> currently_registered_nodes = new Vector();

            for(Node unit : registered_units_){
                String requested_unit = new String(unit.unit_id);

                Future<Message> incoming = nc_.request(requested_unit + ".check_status", request_message.getBytes(StandardCharsets.UTF_8));
                // Wait 2 seconds for a response
                try{
                    Message msg = incoming.get(1, TimeUnit.SECONDS);
                    String response = new String(msg.getData(), StandardCharsets.UTF_8);
                    currently_registered_nodes.add(unit);
                }
                catch(InterruptedException exe){
                    logger.error("Interrupted Process. Error in checking status for unit id: " + requested_unit + "."  + exe);
                }
                catch(ExecutionException exe){
                    logger.error("Error in checking status for unit id: " + requested_unit + "."  + exe);
                }
                catch(TimeoutException exe){
                    logger.error("Timeout Error in checking status for unit id: " + requested_unit + "."  + exe);
                }
            }

            registered_units_ = currently_registered_nodes;
        }
    }

    public static void main(String args[])
    {

        // Define nats connection
        API api_server;
        HttpServer http;
        Connection nc;

        // Initialize
        try{
            api_server = new API();
            Options options = createOptions(api_server.uri);
            nc = Nats.connect(options);
            // nats register unit 
            // Dispatcher processes on separate thread
            Dispatcher register_sub_ = nc.createDispatcher(msg-> {
                    // api_server.registered_units_.add(register_unit(new String(msg.getData(), StandardCharsets.UTF_8)));


                    logger.debug("Registered unit" + api_server.registered_units_.lastElement().unit_id);

                    String json_str = "Timestamp:" + new String(api_server.registered_units_.lastElement().toString());
                    // Add Event Name, Location, Testing Type
                    nc.publish("register_node", "replyto", "hello world".getBytes(StandardCharsets.UTF_8));
                    // try{
                    //     JSONParser parser = new JSONParser();
                    //     // JSONObject response = (JSONObject) parser.parse(json_str);
                    //     // response.put("event_name","UC3");
                    //     // response.put("location","TFHRC");
                    //     // response.put("testing_type","Integration");
                    //     nc.publish("register_node", "replyto", "hello world".getBytes(StandardCharsets.UTF_8));
                    // }
                    // catch(ParseException e){
                    //     logger.error("Could not send register unit response" + e);
                    //     e.printStackTrace();
                    // }
                    
                });
            register_sub_.subscribe("register_node");
            //////////////////////////////////////////////// http server
            http = HttpServer.create(new InetSocketAddress(8080), 0);
            http.createContext("/", new baseRoot());
            http.createContext("/getRegisteredUnits", new getRegisteredUnits(api_server.registered_units_));
            http.createContext("/requestAvailableTopics", new requestAvailableTopics(api_server.registered_units_, nc));
            http.createContext("/requestAvailableTopics", new publishSelectedTopics(nc));
            http.start();

            // Create status check timer task to update registered units
            // TimerTask check_status_task = new checkStatus(api_server.registered_units_, nc);
            // Timer timer = new Timer();
            // // Schedule task to repeat every 5s
            // timer.schedule(check_status_task,0, 5000);
            // api_server.registered_units_ = check_status_task.registered_units_;
        }
        catch(Exception exe)
        {
            exe.printStackTrace();
        }

        
        
    }
};