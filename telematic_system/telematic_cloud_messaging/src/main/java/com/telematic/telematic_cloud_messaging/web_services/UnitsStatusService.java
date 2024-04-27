package com.telematic.telematic_cloud_messaging.web_services;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CancellationException;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;

import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.telematic.telematic_cloud_messaging.models.Events;
import com.telematic.telematic_cloud_messaging.repository.EventsService;
import com.telematic.telematic_cloud_messaging.repository.UnitsService;

import io.nats.client.Connection;
import io.nats.client.Dispatcher;
import io.nats.client.Message;

/**
 * UnitsStatusService
 */
@RestController
@Profile("!test") // Skip Unit test on the CommandLineRunner task
public class UnitsStatusService implements CommandLineRunner {
    private static Logger logger = LoggerFactory.getLogger(UnitsStatusService.class);

    // NATS connection
    @Autowired
    private NATSConnection natsConn;

    // NATS Topics
    private static final String registerUnit = "*.register_unit";
    private static final String checkUnitsStatus = "check_status";

    // constants
    private static final String EVENT_STATUS_LIVE = "live";

    @Autowired
    UnitsService unitsService;

    @Autowired
    EventsService eventsService;

    // Global list to keep track of latest registered units
    private static List<JSONObject> registeredUnitList = new LinkedList<>();
    // Global list to keep track of the map of event and registered units
    private static HashMap<Integer, ArrayList<String>> registeredUnitsEventMap = new HashMap<>();

    /***
     * @brief
     *        GET: /registeredUnits
     *        Request for a list of latest registered units
     * @return The list of registered units in JSON format
     */
    @GetMapping(value = "registeredUnits")
    public ResponseEntity<List<JSONObject>> requestRegisteredUnits() {
        logger.debug("List Registered Units.");
        return new ResponseEntity<>(registeredUnitList, HttpStatus.OK);
    }

    /***
     * @brief Scheduled task runnign on app startup. The task is running at a fixed
     *        interval (fixedRate: The time unit is milliseconds) to send status
     *        checking for
     *        the list a units from registeredUnitList. If failed the status check,
     *        it will remove the registered units from the list.
     */
    @Scheduled(fixedRate = 5000)
    public void checkUnitsStatus() throws InterruptedException {
        Connection conn = natsConn.getConnection();
        if (conn != null) {
            logger.debug(
                    "Checking units status at timestamp (Unit of second) = : {}",  System.currentTimeMillis() / 1000);
            for (JSONObject registered_unit : registeredUnitList) {
                String unitId = (String) registered_unit.get("unit_id");
                Integer eventId = (Integer) registered_unit.get("event_id");
                String subject = unitId + "." + checkUnitsStatus;
                logger.debug("Checking unit status. subject: {}" , subject);
                try {
                    Future<Message> future = conn.request(subject,
                            unitId.getBytes(StandardCharsets.UTF_8));
                    Message msg = future.get();
                    String reply = new String(msg.getData(), StandardCharsets.UTF_8);
                    logger.debug("Checking unit status.  Unit = {} Reply: {}",unitId, reply);

                    // If registered unit is running and registered unit id not in the event map,
                    // add registered unit to the event map
                    if (!registeredUnitsEventMap.containsKey(eventId)) {
                        ArrayList<String> unitIdArr = new ArrayList<>();
                        unitIdArr.add(unitId);
                        registeredUnitsEventMap.put(eventId, unitIdArr);
                    } else if (registeredUnitsEventMap.containsKey(eventId)
                            && !registeredUnitsEventMap.get(eventId).contains(unitId)) {
                        registeredUnitsEventMap.get(eventId).add(unitId);
                    }
                } catch (CancellationException ex) {
                    // No reply remove unit from registeredUnitList
                    logger.error(
                            "Checking unit status. Unit = {} failed. Remove from registered unit list.",unitId);
                    // if the registered unit is not running (Not reply), remove registered unit for
                    // this map
                    if (registeredUnitsEventMap.containsKey(eventId)
                            && registeredUnitsEventMap.get(eventId).contains(unitId)) {
                        registeredUnitsEventMap.get(eventId).remove(unitId);
                    }
                    registeredUnitList.remove(registered_unit);
                } catch (ExecutionException e) {
                    logger.error(checkUnitsStatus, e);
                }
            }
            // Checking the map of registered units and their associated events. If the
            // number of registered units for their events are 0, remove the event live
            // status
            for (Map.Entry<Integer, ArrayList<String>> mapEntry : registeredUnitsEventMap.entrySet()) {
                if (!mapEntry.getValue().isEmpty()) {
                    eventsService.updateEventStatus(EVENT_STATUS_LIVE, mapEntry.getKey());
                } else {
                    eventsService.updateEventStatus("", mapEntry.getKey());
                }
            }
        }
    }

    /***
     * @brief A background process running on startup to subcribe to NATS topic
     *        *.register_unit.
     *        If any telematic unit send request to register_unit, it will update
     *        the global registeredUnitList, and return a positive reply.
     */
    @SuppressWarnings("unchecked")
    @Override
    public void run(String... args) throws Exception {
         //on startup: reset all event status in case some live event status is not cleared
         try {
            eventsService.resetEventStatus();
            logger.info("Events status is reset!");
        } catch (Exception e) {
            logger.error("Cannot reset events status! ERROR: {}" , e.getMessage());
        } 
        Connection conn = natsConn.getConnection();
        if (conn != null) {
            logger.debug("register units subscribe to subject: " + registerUnit);

            Dispatcher registerSubDispatcher = conn.createDispatcher(msg -> {
            });

            registerSubDispatcher.subscribe(registerUnit, (msg) -> {
                String msgData = new String(msg.getData(), StandardCharsets.UTF_8);
                logger.info("Received register unit: {}",  msgData);
                JSONParser parser = new JSONParser();
                try {
                    JSONObject jsonObj = (JSONObject) parser.parse(msgData);
                    Timestamp curTimestamp = Timestamp.from(Instant.now());

                    // Get Event information from DB and return to the telematic units.
                    Events event = unitsService.getEventsByUnitAndTimestamp(jsonObj.get("unit_id").toString(),
                            curTimestamp);
                    if (event != null) {
                        jsonObj.put("event_name", event.getName());
                        jsonObj.put("event_id", event.getId());
                        jsonObj.put("location", event.getLocations().getFacility_name());
                        jsonObj.put("testing_type", event.getTesting_types().getName());

                        // Update event status to live event
                        eventsService.updateEventStatus(EVENT_STATUS_LIVE, event.getId());

                        // Update registerUnitList to keep track of latest registered units.
                        for (JSONObject obj : registeredUnitList) {
                            if (obj.get("unit_id").toString().equals(jsonObj.get("unit_id").toString())) {
                                registeredUnitList.remove(obj);
                            }
                        }
                        registeredUnitList.add(jsonObj);
                    } else {
                        logger.error("Cannot find the unit = {}"
                                + " assigned to any events at {}", jsonObj.get("unit_id").toString(),curTimestamp.toString());
                    }

                    // Send a reply to the telematic units
                    conn.publish(msg.getReplyTo(),
                            jsonObj.toJSONString().getBytes(StandardCharsets.UTF_8));
                } catch (ParseException e) {
                    logger.error("Cannot parse registered units", e);
                    e.printStackTrace();
                }
            });
        }
    }
}