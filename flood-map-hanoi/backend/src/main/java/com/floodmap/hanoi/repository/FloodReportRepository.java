package com.floodmap.hanoi.repository;

import com.floodmap.hanoi.model.FloodReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FloodReportRepository extends JpaRepository<FloodReport, String> {
    List<FloodReport> findByUserId(String userId);
}
