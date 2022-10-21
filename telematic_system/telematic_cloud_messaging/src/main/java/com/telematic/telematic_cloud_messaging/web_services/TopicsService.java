package com.telematic.telematic_cloud_messaging.web_services;

import java.nio.charset.StandardCharsets;
import java.util.concurrent.CancellationException;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;

import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import io.nats.client.Connection;
import io.nats.client.Message;

/**
 * TopicsService
 */
@CrossOrigin(origins = "http://localhost:3005", maxAge = 3600)
@RestController
public class TopicsService {
    private static Logger logger = LoggerFactory.getLogger(TopicsService.class);

    // NATS connection
    @Autowired
    private NATSConnection natsConn;

    // NATS Topics
    private static final String availableTopicSubject = "available_topics";
    private static final String publishDataToTopicSubject = "publish_topics";

    /***
     * @brief
     *        GET: /registeredUnits/unit_id
     *        Request for a list of available topics from a telematic unit
     * @return The list of available topics in JSON format
     */
    @GetMapping(value = "requestAvailableTopics/{unitId}")
    public ResponseEntity<String> requestAvailableTopics(@PathVariable("unitId") String unitId) {
        String subject = unitId + "." + availableTopicSubject;
        logger.debug("Available topics request. subject: " + subject);
        String error_msg = "";
        Connection conn = natsConn.getConnection();
        if (conn != null) {
            try {
                Future<Message> future = conn.request(subject, unitId.getBytes(StandardCharsets.UTF_8));
                Message msg;
                msg = future.get();
                String reply = new String(msg.getData(), StandardCharsets.UTF_8);
                logger.debug("Available topics request. Reply: " + reply);
                return new ResponseEntity<>(reply, HttpStatus.OK);
            } catch (InterruptedException | ExecutionException e) {
                error_msg = "Response interrupted for subject: " + subject;
                logger.error(error_msg, e);
                return new ResponseEntity<>(error_msg, HttpStatus.INTERNAL_SERVER_ERROR);
            } catch (CancellationException e) {
                error_msg = "No response from subject: " + subject;
                logger.error(error_msg, e);
                return new ResponseEntity<>(error_msg, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        } else {
            error_msg = "NATS Connection failed";
            logger.error(error_msg);
            return new ResponseEntity<>(error_msg, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /***
     * @brief
     *        POST: /requestSelectedTopics
     *        Request for data stream for a list of selected topics from a telematic
     *        unit
     * @return httpstatus to indicate request success or failure
     */
    @PostMapping(value = "requestSelectedTopics")
    public ResponseEntity<String> requestSelectedTopics(@RequestBody String body) {
        logger.debug("Selected topics request. body: " + body);
        Connection conn = natsConn.getConnection();
        String error_msg = "";
        if (conn != null) {
            try {
                JSONParser parser = new JSONParser();
                JSONObject jsonObj = (JSONObject) parser.parse(body);
                String unitId = (String) jsonObj.get("unit_id");
                String subject = unitId + "." + publishDataToTopicSubject;
                logger.debug("Selected topics request. subject: " + subject);
                Future<Message> future = conn.request(subject,
                        body.getBytes(StandardCharsets.UTF_8));
                Message msg = future.get();
                String reply = new String(msg.getData(), StandardCharsets.UTF_8);
                logger.debug("Selected topics request. Reply: " + reply);
                return new ResponseEntity<>(reply, HttpStatus.OK);
            } catch (InterruptedException | ExecutionException e) {
                error_msg = "Response interrupted for subject: " + publishDataToTopicSubject;
                logger.error(error_msg, e);
                return new ResponseEntity<>(error_msg, HttpStatus.INTERNAL_SERVER_ERROR);
            } catch (CancellationException e) {
                error_msg = "No response from subject: " + publishDataToTopicSubject;
                logger.error(error_msg, e);
                return new ResponseEntity<>(error_msg, HttpStatus.INTERNAL_SERVER_ERROR);
            } catch (ParseException e) {
                error_msg = "Cannot parse requestSelectTopics body";
                logger.error(error_msg, e);
                return new ResponseEntity<>(error_msg, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        } else {
            error_msg = "NATS Connection failed";
            logger.error(error_msg);
            return new ResponseEntity<>(error_msg, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}