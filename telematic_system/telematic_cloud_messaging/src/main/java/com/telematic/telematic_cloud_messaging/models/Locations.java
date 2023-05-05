package com.telematic.telematic_cloud_messaging.models;


import java.sql.Timestamp;
import java.util.Set;

import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.Table;

@Entity
@Table(name = "locations")
public class Locations {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @OneToMany(mappedBy = "locations", fetch = FetchType.EAGER)
    private Set<Events> eventList;

    private String facility_name;
    private String city;
    private String state_code;
    private String zip_code;
    private Integer created_by;
    private Timestamp created_at;
    
    public Locations() {
    }

    public Locations(Integer id, Set<Events> eventList, String facility_name, String city, String state_code, String zip_code, Integer created_by, Timestamp created_at) {
        this.id = id;
        this.eventList = eventList;
        this.facility_name = facility_name;
        this.city = city;
        this.state_code = state_code;
        this.zip_code = zip_code;
        this.created_by = created_by;
        this.created_at = created_at;
    }

    public Integer getId() {
        return this.id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getFacility_name() {
        return this.facility_name;
    }

    public void setFacility_name(String facility_name) {
        this.facility_name = facility_name;
    }

    public String getCity() {
        return this.city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState_code() {
        return this.state_code;
    }

    public void setState_code(String state_code) {
        this.state_code = state_code;
    }

    public String getZip_code() {
        return this.zip_code;
    }

    public void setZip_code(String zip_code) {
        this.zip_code = zip_code;
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


    public Set<Events> getEventList() {
        return this.eventList;
    }

    public void setEventList(Set<Events> eventList) {
        this.eventList = eventList;
    }
  

    @Override
    public String toString() {
        return "{" +
            " id='" + getId() + "'" +
            ", eventList='" + getEventList() + "'" +
            ", facility_name='" + getFacility_name() + "'" +
            ", city='" + getCity() + "'" +
            ", state_code='" + getState_code() + "'" +
            ", zip_code='" + getZip_code() + "'" +
            ", created_by='" + getCreated_by() + "'" +
            ", created_at='" + getCreated_at() + "'" +
            "}";
    }
    
}
