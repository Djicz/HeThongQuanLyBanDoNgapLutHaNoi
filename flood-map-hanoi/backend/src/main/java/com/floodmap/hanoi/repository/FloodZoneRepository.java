package com.floodmap.hanoi.repository;

import com.floodmap.hanoi.model.FloodZone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FloodZoneRepository extends JpaRepository<FloodZone, String> {
    List<FloodZone> findByStatus(String status);
    List<FloodZone> findAllByOrderByFloodCountDesc();
}
