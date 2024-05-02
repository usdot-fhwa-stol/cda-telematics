package com.telematic.telematic_cloud_messaging.models;

import java.sql.Timestamp;
import java.util.Set;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "units")
public class Units {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToMany(fetch = FetchType.EAGER, mappedBy = "units")
    Set<EventUnits> event_units;

    private String unit_name;
    private String unit_identifier;
    private String unit_type;
    private Integer created_by;
    private Timestamp created_at;

    public Units() {
    }

    public Units(Integer id, String unit_name, String unit_identifier, String unit_type, Timestamp start_at,
            Timestamp end_at, Integer created_by, Timestamp created_at) {
        this.id = id;
        this.unit_name = unit_name;
        this.unit_identifier = unit_identifier;
        this.unit_type = unit_type;
        this.created_by = created_by;
        this.created_at = created_at;
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

    public String getUnit_name() {
        return this.unit_name;
    }

    public void setUnit_name(String unit_name) {
        this.unit_name = unit_name;
    }

    public String getUnit_identifier() {
        return this.unit_identifier;
    }

    public void setUnit_identifier(String unit_identifier) {
        this.unit_identifier = unit_identifier;
    }

    public String getUnit_type() {
        return this.unit_type;
    }

    public void setUnit_type(String unit_type) {
        this.unit_type = unit_type;
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

    @Override
    public String toString() {
        return "{" +
                " id='" + getId() + "'" +
                ", unit_name='" + getUnit_name() + "'" +
                ", unit_identifier='" + getUnit_identifier() + "'" +
                ", unit_type='" + getUnit_type() + "'" +
                ", created_by='" + getCreated_by() + "'" +
                ", created_at='" + getCreated_at() + "'" +
                "}";
    }

}
