package com.telematic.telematic_cloud_messaging.repository;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.telematic.telematic_cloud_messaging.models.Events;

/**
 * EventsService
 */
@Service
public class EventsService {

    @Autowired
    EventRepository eventRepository;

    public void updateEventStatus(String event_status, Integer event_id) {
        Optional<Events> event = eventRepository.findById(event_id);
        if(!event.isEmpty())
        {
            event.get().setStatus(event_status);
            eventRepository.save(event.get());
        }
    }
}