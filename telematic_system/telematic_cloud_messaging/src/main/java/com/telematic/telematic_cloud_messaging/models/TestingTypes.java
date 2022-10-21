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
@Table(name = "testing_types")
public class TestingTypes {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToMany(mappedBy = "testing_types", fetch = FetchType.EAGER)
    private Set<Events> eventList;

    private String name;
    private Integer created_by;
    private Timestamp created_at;

    public TestingTypes() {
    }

    public TestingTypes(Integer id, Set<Events> eventList, String name, Integer created_by, Timestamp created_at) {
        this.id = id;
        this.eventList = eventList;
        this.name = name;
        this.created_by = created_by;
        this.created_at = created_at;
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
                ", name='" + getName() + "'" +
                ", created_by='" + getCreated_by() + "'" +
                ", created_at='" + getCreated_at() + "'" +
                "}";
    }

}
