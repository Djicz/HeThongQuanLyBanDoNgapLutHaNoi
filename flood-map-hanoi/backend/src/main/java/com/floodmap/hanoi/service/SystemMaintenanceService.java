package com.floodmap.hanoi.service;

import com.floodmap.hanoi.model.FloodReport;
import com.floodmap.hanoi.model.FloodZone;
import com.floodmap.hanoi.model.ReportVote;
import com.floodmap.hanoi.model.SystemConfig;
import com.floodmap.hanoi.model.ReportVote;
import com.floodmap.hanoi.repository.FloodReportRepository;
import com.floodmap.hanoi.repository.FloodZoneRepository;
import com.floodmap.hanoi.repository.SystemConfigRepository;
import com.floodmap.hanoi.repository.ReportVoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class SystemMaintenanceService {

    @Autowired
    private FloodReportRepository floodReportRepository;

    @Autowired
    private FloodZoneRepository floodZoneRepository;

    @Autowired
    private SystemConfigRepository configRepository;

    @Autowired
    private ReportVoteRepository voteRepository;

    // Runs every 1 hour
    @Scheduled(cron = "0 0 * * * *")
    public void runMaintenanceTasks() {
        performMaintenance();
    }

    public void performMaintenance() {
        List<SystemConfig> configs = configRepository.findAll();
        if (configs.isEmpty()) return;

        SystemConfig config = configs.get(0);
        int expireHours = config.getReportExpired();
        double deleteThreshold = config.getAutoDeletePercent();

        long now = System.currentTimeMillis();
        long expireMillis = expireHours * 3600000L;

        List<FloodReport> reports = floodReportRepository.findAll();

        for (FloodReport report : reports) {
            String status = report.getStatus();
            if ("EXPIRED".equals(status) || "DELETED".equals(status)) {
                continue;
            }

            boolean changed = false;

            // 1. Check expiration
            if (report.getCreatedAt() != null) {
                long age = now - report.getCreatedAt().getTime();
                if (age > expireMillis) {
                    report.setStatus("EXPIRED");
                    changed = true;
                }
            }

            // 2. Check auto delete (only if not already expired)
            if (!changed) {
                List<ReportVote> votes = voteRepository.findByReportId(report.getId());
                if (votes.size() >= 10) {
                    long downvotes = votes.stream().filter(v -> !v.isUpvote()).count();
                    double downvotePercent = (double) downvotes / votes.size() * 100;
                    if (downvotePercent > deleteThreshold) {
                        report.setStatus("DELETED");
                        changed = true;
                    }
                }
            }

            if (changed) {
                floodReportRepository.save(report);
                updateRelatedZones(report);
            }
        }

        // 3. Check FloodZone expiration directly
        List<FloodZone> allZones = floodZoneRepository.findAll();
        for (FloodZone zone : allZones) {
            if ("ACTIVE".equals(zone.getStatus())) {
                Date targetDate = zone.getUpdatedAt() != null ? zone.getUpdatedAt() : zone.getCreatedAt();
                if (targetDate != null) {
                    long age = now - targetDate.getTime();
                    if (age > expireMillis) {
                        zone.setStatus("RESOLVED");
                        floodZoneRepository.save(zone);
                    }
                }
            }
        }
    }

    private void updateRelatedZones(FloodReport report) {
        List<FloodZone> zones = floodZoneRepository.findAll();
        for (FloodZone zone : zones) {
            if ("ACTIVE".equals(zone.getStatus()) && zone.getCenterPoint() != null && report.getLocation() != null) {
                if (zone.getCenterPoint().getX() == report.getLocation().getX() &&
                    zone.getCenterPoint().getY() == report.getLocation().getY()) {
                    
                    zone.setStatus("RESOLVED");
                    floodZoneRepository.save(zone);
                }
            }
        }
    }
}
