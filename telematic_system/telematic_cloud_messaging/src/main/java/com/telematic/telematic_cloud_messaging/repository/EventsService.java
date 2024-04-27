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

    public void updateEventStatus(String eventStatus, Integer eventId) {
        Optional<Events> event = eventRepository.findById(eventId);
        if(!event.isEmpty())
        {
            event.get().setStatus(eventStatus);
            eventRepository.save(event.get());
        }
    }
    public void resetEventStatus(){
        eventRepository.resetEventStatus();
    }
}