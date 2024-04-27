package com.telematic.telematic_cloud_messaging.models;

import java.sql.Timestamp;
import java.util.Set;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "events")
public class Events {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToMany(mappedBy = "events", fetch = FetchType.EAGER)
    Set<EventUnits> event_units;

    private String name;
    private String description;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "location_id", nullable = false)
    private Locations locations;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "testing_type_id", nullable = false)
    private TestingTypes testing_types;

    private String status;
    private Timestamp start_at;
    private Timestamp end_at;
    private Integer created_by;
    private Timestamp created_at;
    private Integer updated_by;
    private Timestamp updated_at;

    public Events() {
    }

    public Events(Integer id, Set<EventUnits> event_units, String name, String description, Locations locations,
            TestingTypes testing_types, String status, Timestamp start_at, Timestamp end_at, Integer created_by,
            Timestamp created_at, Integer updated_by, Timestamp updated_at) {
        this.id = id;
        this.event_units = event_units;
        this.name = name;
        this.description = description;
        this.locations = locations;
        this.testing_types = testing_types;
        this.status = status;
        this.start_at = start_at;
        this.end_at = end_at;
        this.created_by = created_by;
        this.created_at = created_at;
        this.updated_by = updated_by;
        this.updated_at = updated_at;
    }

    public Locations getLocations() {
        return this.locations;
    }

    public void setLocations(Locations locations) {
        this.locations = locations;
    }

    public TestingTypes getTesting_types() {
        return this.testing_types;
    }

    public void setTesting_types(TestingTypes testing_types) {
        this.testing_types = testing_types;
    }

    public Set<EventUnits> getEvent_units() {
        return this.event_units;
    }

    public void setEvent_units(Set<EventUnits> event_units) {
        this.event_units = event_units;
    }

    public Integer getId() {
        return this.id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return this.name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return this.description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return this.status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Timestamp getStart_at() {
        return this.start_at;
    }

    public void setStart_at(Timestamp start_at) {
        this.start_at = start_at;
    }

    public Timestamp getEnd_at() {
        return this.end_at;
    }

    public void setEnd_at(Timestamp end_at) {
        this.end_at = end_at;
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

    public Integer getUpdated_by() {
        return this.updated_by;
    }

    public void setUpdated_by(Integer updated_by) {
        this.updated_by = updated_by;
    }

    public Timestamp getUpdated_at() {
        return this.updated_at;
    }

    public void setUpdated_at(Timestamp updated_at) {
        this.updated_at = updated_at;
    }

    @Override
    public String toString() {
        return "{" +
                " id='" + getId() + "'" +
                ", event_units='" + getEvent_units() + "'" +
                ", name='" + getName() + "'" +
                ", description='" + getDescription() + "'" +
                ", locations='" + getLocations() + "'" +
                ", testing_types='" + getTesting_types() + "'" +
                ", status='" + getStatus() + "'" +
                ", start_at='" + getStart_at() + "'" +
                ", end_at='" + getEnd_at() + "'" +
                ", created_by='" + getCreated_by() + "'" +
                ", created_at='" + getCreated_at() + "'" +
                ", updated_by='" + getUpdated_by() + "'" +
                ", updated_at='" + getUpdated_at() + "'" +
                "}";
    }
}
