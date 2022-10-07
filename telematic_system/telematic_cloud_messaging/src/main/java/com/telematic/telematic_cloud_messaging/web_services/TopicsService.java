package com.telematic.telematic_cloud_messaging.web_services;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;

import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import io.nats.client.Connection;
import io.nats.client.Connection.Status;
import io.nats.client.ConnectionListener;
import io.nats.client.Message;
import io.nats.client.Nats;
import io.nats.client.Options;

/**
 * TopicsService
 */
@RestController
public class TopicsService implements ConnectionListener {
    private static Logger logger = LoggerFactory.getLogger(TopicsService.class);

    @Value("${nats_uri}")
    private String natServerURL;

    private Connection connection;
    private static final String availableTopicSubject = "available_topics";
    private static final String publishDataToTopicSubject = "publish_topics";

    /***
     * @brief
     *        GET: /registeredUnits/unit_id
     *        Request for a list of available topics from a telematic unit
     * @return The list of available topics in JSON format
     */
    @GetMapping(value = "requestAvailableTopics/{unitId}")
    public ResponseEntity<String> requestAvailableTopics(@PathVariable("unitId") String unitId)
            throws IOException, InterruptedException, ExecutionException {

        String subject = unitId + "." + availableTopicSubject;
        logger.debug("Available topics request. subject: " + subject);
        Future<Message> future = getConnection().request(subject, unitId.getBytes(StandardCharsets.UTF_8));
        Message msg = future.get();
        String reply = new String(msg.getData(), StandardCharsets.UTF_8);
        logger.debug("Available topics request. Reply: " + reply);
        return new ResponseEntity<>(reply, HttpStatus.ACCEPTED);
    }

    /***
     * @brief
     *        POST: /requestSelectedTopics
     *        Request for data stream for a list of selected topics from a telematic
     *        unit
     * @return httpstatus to indicate request success or failure
     */
    @PostMapping(value = "requestSelectedTopics")
    public ResponseEntity<String> requestSelectedTopics(@RequestBody String body)
            throws IOException, InterruptedException, ExecutionException {

        logger.debug("Selected topics request. body: " + body);
        JSONParser parser = new JSONParser();
        try {
            JSONObject jsonObj = (JSONObject) parser.parse(body);
            String unitId = (String) jsonObj.get("unit_id");
            String subject = unitId + "." + publishDataToTopicSubject;
            logger.debug("Selected topics request. subject: " + subject);
            Future<Message> future = getConnection().request(subject, body.getBytes(StandardCharsets.UTF_8));
            Message msg = future.get();
            String reply = new String(msg.getData(), StandardCharsets.UTF_8);
            logger.debug("Selected topics request. Reply: " + reply);
            return new ResponseEntity<>(reply, HttpStatus.OK);
        } catch (ParseException e) {
            logger.error("Cannot parse requestSelectTopics body", e);
            e.printStackTrace();
        }

        return new ResponseEntity<>("", HttpStatus.EXPECTATION_FAILED);
    }

    /***
     * @brief Update the global NATS connection object if not exist or the service
     *        is disconnected from NATS.
     * @return The global NATS connection object
     */
    private Connection getConnection() throws IOException, InterruptedException {
        if (connection == null || (connection.getStatus() == Status.DISCONNECTED)) {
            Options.Builder connectionBuilder = new Options.Builder().connectionListener(this);
            logger.info("Connecting to NATS server = " + natServerURL);
            Options options = connectionBuilder.server(natServerURL).connectionTimeout(Duration.ofSeconds(5))
                    .pingInterval(Duration.ofSeconds(2))
                    .reconnectWait(Duration.ofSeconds(1))
                    .maxReconnects(-1)
                    .traceConnection()
                    .build();
            connection = Nats.connect(options);
        }
        logger.debug("get Connection: " + connection);
        return connection;
    }

    @Override
    public void connectionEvent(Connection connection, Events event) {
        logger.debug("Connection event: " + event);
        switch (event) {
            case CONNECTED:
                logger.info("CONNECTED!");
                break;
            case DISCONNECTED:
                try {
                    connection = null;
                    getConnection();
                } catch (Exception ex) {
                    logger.error(ex.getMessage(), ex);
                }
                break;
            case RECONNECTED:
                logger.info("RECONNECTED!");
                break;
            case RESUBSCRIBED:
                logger.info("RESUBSCRIBED!");
                break;
            default:
                break;
        }
    }
}