package com.telematic.telematic_cloud_messaging.web_services;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.LinkedList;
import java.util.List;
import java.util.concurrent.CancellationException;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;

import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import io.nats.client.Connection;
import io.nats.client.Connection.Status;
import io.nats.client.ConnectionListener;
import io.nats.client.Dispatcher;
import io.nats.client.Message;
import io.nats.client.Nats;
import io.nats.client.Options;

/**
 * UnitsStatusService
 */
@RestController
public class UnitsStatusService implements ConnectionListener, CommandLineRunner {
    private static Logger logger = LoggerFactory.getLogger(UnitsStatusService.class);

    @Value("${nats_uri}")
    private String natServerURL;

    private Connection connection;
    private static final String registerUnit = "*.register_unit";
    private static final String checkUnitsStatus = "check_status";
    private static List<JSONObject> registeredUnitList = new LinkedList<JSONObject>();

    @GetMapping(value = "registeredUnits")
    public ResponseEntity<List<JSONObject>> requestRegisteredUnits()
            throws IOException, InterruptedException, ExecutionException {

        logger.debug("List Registered Units.");
        return new ResponseEntity<>(registeredUnitList, HttpStatus.ACCEPTED);
    }

    @Scheduled(fixedRate = 5000)
    public void checkUnitsStatus() throws IOException, InterruptedException {

        logger.debug("Checking units status at timestamp = : " + System.currentTimeMillis() / 1000);
        for (JSONObject registered_unit : registeredUnitList) {
            String unitId = (String) registered_unit.get("unit_id");
            String subject = unitId + "." + checkUnitsStatus;
            logger.debug("Checking unit status. subject: " + subject);
            try {
                Future<Message> future = getConnection().request(subject, unitId.getBytes(StandardCharsets.UTF_8));
                Message msg = future.get();
                String reply = new String(msg.getData(), StandardCharsets.UTF_8);
                logger.debug("Checking unit status.  Unit =" + unitId + " Reply: " + reply);
            } catch (CancellationException ex) {
                // No reply remove unit from registeredUnitList
                logger.error("Checking unit status. Unit = " + unitId + " failed. Remove from registered unit list.");
                registeredUnitList.remove(registered_unit);
            } catch (ExecutionException e) {
                logger.error(checkUnitsStatus, e);
                e.printStackTrace();
            }
        }
    }

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
        logger.debug("get Connection: " + connection.getConnectedUrl());
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

    @Override
    public void run(String... args) throws Exception {
        Dispatcher register_sub_d = getConnection().createDispatcher(msg -> {
        });

        logger.debug("register units subscribe to subject: " + registerUnit);
        register_sub_d.subscribe(registerUnit, (msg) -> {
            String msgData = new String(msg.getData(), StandardCharsets.UTF_8);
            logger.info("Received register unit: " + msgData);
            JSONParser parser = new JSONParser();
            try {
                JSONObject jsonObj = (JSONObject) parser.parse(msgData);
                for (JSONObject obj : registeredUnitList) {
                    if (obj.get("unit_id").toString().equals(jsonObj.get("unit_id").toString())) {
                        registeredUnitList.remove(obj);
                    }
                }
                registeredUnitList.add(jsonObj);

                getConnection().publish(msg.getReplyTo(), jsonObj.toJSONString().getBytes(StandardCharsets.UTF_8));
            } catch (ParseException | IOException e) {
                logger.error("Cannot parse registered units", e);
                e.printStackTrace();
            }
        });

    }
}