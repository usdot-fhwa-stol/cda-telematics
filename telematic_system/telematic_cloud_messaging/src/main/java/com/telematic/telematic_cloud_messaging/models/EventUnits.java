package com.telematic.telematic_cloud_messaging.models;

import java.sql.Timestamp;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * EventUnits
 */
@Entity
@Table(name = "event_units")
public class EventUnits {

    @Id
    private Integer id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "unit_id")
    private Units units;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "event_id")
    private Events events;

    private Timestamp start_time;
    private Timestamp end_time;
    private Integer created_by;
    private Timestamp created_at;

    public Integer getId() {
        return this.id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Units getUnits() {
        return this.units;
    }

    public void setUnits(Units units) {
        this.units = units;
    }

    public Events getEvents() {
        return this.events;
    }

    public void setEvents(Events events) {
        this.events = events;
    }

    public Timestamp getStart_time() {
        return this.start_time;
    }

    public void setStart_time(Timestamp start_time) {
        this.start_time = start_time;
    }

    public Timestamp getEnd_time() {
        return this.end_time;
    }

    public void setEnd_time(Timestamp end_time) {
        this.end_time = end_time;
    }

    public Integer getCreated_by() {
        return this.created_by;
    }

    public void setCreated_by(Integer created_by) {
        this.created_by = created_by;
    }

    public Timestamp getCreated_at() {
        return this.created_at;
    }

    public void setCreated_at(Timestamp created_at) {
        this.created_at = created_at;
    }

    public EventUnits(Integer id, Integer unit_id, Integer event_id, Timestamp start_time, Timestamp end_time,
            Integer created_by, Timestamp created_at) {
        this.id = id;
        this.start_time = start_time;
        this.end_time = end_time;
        this.created_by = created_by;
        this.created_at = created_at;
    }

    public EventUnits() {
    }

    @Override
    public String toString() {
        return "{" +
                " id='" + getId() + "'" +
                ", start_time='" + getStart_time() + "'" +
                ", end_time='" + getEnd_time() + "'" +
                ", created_by='" + getCreated_by() + "'" +
                ", created_at='" + getCreated_at() + "'" +
                "}";
    }

}