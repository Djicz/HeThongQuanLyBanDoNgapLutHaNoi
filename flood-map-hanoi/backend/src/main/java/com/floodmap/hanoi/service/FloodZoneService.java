package com.floodmap.hanoi.service;

import com.floodmap.hanoi.model.FloodReport;
import com.floodmap.hanoi.model.FloodZone;
import com.floodmap.hanoi.model.SystemConfig;
import com.floodmap.hanoi.repository.FloodReportRepository;
import com.floodmap.hanoi.repository.SystemConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FloodZoneService {

    @Autowired
    private FloodReportRepository floodReportRepository;

    @Autowired
    private SystemConfigRepository configRepository;

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371000; // Radius of the earth in m
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // distance in m
    }

    public List<FloodZone> getAllZones() {
        List<SystemConfig> configs = configRepository.findAll();
        double radius = configs.isEmpty() ? 500.0 : configs.get(0).getAlertRadius();
        double distanceThreshold = radius * 0.476;

        List<FloodReport> reports = floodReportRepository.findAll().stream()
                .filter(r -> "VERIFIED".equals(r.getStatus()) || "RESOLVED".equals(r.getStatus()))
                .sorted(Comparator.comparing(FloodReport::getCreatedAt, Comparator.nullsFirst(Comparator.naturalOrder())))
                .collect(Collectors.toList());

        List<FloodZone> dynamicZones = new ArrayList<>();

        for (FloodReport report : reports) {
            if (report.getLocation() == null) continue;

            double lat = report.getLocation().getY();
            double lng = report.getLocation().getX();

            boolean foundGroup = false;
            for (FloodZone group : dynamicZones) {
                double dist = calculateDistance(lat, lng, group.getCenterPoint().getY(), group.getCenterPoint().getX());
                if (dist <= distanceThreshold) {
                    group.setLevel(report.getLevel());
                    group.setDescription(report.getDescription());
                    group.setStatus(report.getStatus().equals("RESOLVED") ? "RESOLVED" : "ACTIVE");
                    group.setUpdatedAt(report.getCreatedAt());
                    group.setId(report.getId());
                    foundGroup = true;
                    break;
                }
            }

            if (!foundGroup) {
                FloodZone zone = new FloodZone();
                zone.setId(report.getId());
                zone.setCenterPoint(report.getLocation());
                zone.setRadius(radius);
                zone.setLevel(report.getLevel());
                zone.setDescription(report.getDescription());
                zone.setStatus(report.getStatus().equals("RESOLVED") ? "RESOLVED" : "ACTIVE");
                zone.setCreatedAt(report.getCreatedAt());
                zone.setUpdatedAt(report.getCreatedAt());
                dynamicZones.add(zone);
            }
        }

        return dynamicZones;
    }

    public boolean updateZone(String id, FloodZone zoneDetails) {
        Optional<FloodReport> reportOpt = floodReportRepository.findById(id);
        if (reportOpt.isPresent()) {
            FloodReport report = reportOpt.get();
            report.setLevel(zoneDetails.getLevel());
            report.setDescription(zoneDetails.getDescription());
            if ("RESOLVED".equals(zoneDetails.getStatus())) {
                report.setStatus("RESOLVED");
            } else if ("ACTIVE".equals(zoneDetails.getStatus())) {
                report.setStatus("VERIFIED");
            }
            floodReportRepository.save(report);
            return true;
        }
        return false;
    }

    public boolean deleteZone(String id) {
        Optional<FloodReport> reportOpt = floodReportRepository.findById(id);
        if (reportOpt.isPresent()) {
            FloodReport report = reportOpt.get();
            report.setStatus("DELETED");
            floodReportRepository.save(report);
            return true;
        }
        return false;
    }
}
