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

    public Events getEventsByUnitAndTimestamp(String unitIdentifier, Timestamp unitReceivedAt) {
        List<Units> unitsList = unitsRepository.getUnitsByIdentifier(unitIdentifier);
        for (Units unit : unitsList) {
            Set<EventUnits> eventUnits = unit.getEvent_units();
            for (EventUnits eu : eventUnits) {
                if (eu.getStart_time().compareTo(unitReceivedAt) < 0
                        && eu.getEnd_time().compareTo(unitReceivedAt) > 0) {
                    return eu.getEvents();
                }
            }
        }
        return null;
    }
}
