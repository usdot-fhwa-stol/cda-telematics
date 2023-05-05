package com.telematic.telematic_cloud_messaging.repository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.telematic.telematic_cloud_messaging.models.Events;
@Repository
public interface EventRepository  extends JpaRepository<Events, Integer> {
    @Transactional
    @Modifying
    @Query("UPDATE Events e SET e.status = ''")
    void resetEventStatus();
}