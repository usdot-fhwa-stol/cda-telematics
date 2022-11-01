package com.telematic.telematic_cloud_messaging.repository;

import java.sql.Timestamp;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.telematic.telematic_cloud_messaging.models.EventUnits;
import com.telematic.telematic_cloud_messaging.models.Events;
import com.telematic.telematic_cloud_messaging.models.Units;

@Service
public class UnitsService {

    @Autowired
    UnitsRepository unitsRepository;

    public Events getEventsByUnitAndTimestamp(String unit_identifier, Timestamp unit_received_at) {
        List<Units> units_list = unitsRepository.getUnitsByIdentifier(unit_identifier);
        for (Units unit : units_list) {
            Set<EventUnits> event_units = unit.getEvent_units();
            for (EventUnits eu : event_units) {
                if (eu.getStart_time().compareTo(unit_received_at) < 0
                        && eu.getEnd_time().compareTo(unit_received_at) > 0) {
                    return eu.getEvents();
                }
            }
        }
        return null;
    }
}
