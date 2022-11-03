package com.telematic.telematic_cloud_messaging.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.telematic.telematic_cloud_messaging.models.Events;
@Repository
public interface EventRepository  extends JpaRepository<Events, Integer> {
}