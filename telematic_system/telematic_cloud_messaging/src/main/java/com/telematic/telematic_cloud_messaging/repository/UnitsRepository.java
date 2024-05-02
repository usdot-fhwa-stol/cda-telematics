package com.telematic.telematic_cloud_messaging.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.telematic.telematic_cloud_messaging.models.Units;

@Repository
public interface UnitsRepository extends JpaRepository<Units, Integer> {
    @Query(value = "SELECT u FROM Units u where u.unit_identifier=:unit_identifier")
    List<Units> getUnitsByIdentifier(@Param("unit_identifier") String unitIdentifier);
}
