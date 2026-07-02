package com.floodmap.hanoi.controller;

import com.floodmap.hanoi.model.FloodReport;
import com.floodmap.hanoi.model.SystemConfig;
import com.floodmap.hanoi.repository.FloodReportRepository;
import com.floodmap.hanoi.repository.SystemConfigRepository;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/history")
@CrossOrigin(origins = "*")
public class FloodHistoryController {

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

    @GetMapping
    public List<FloodHistoryDTO> getFloodHistory() {
        List<SystemConfig> configs = configRepository.findAll();
        double radius = configs.isEmpty() ? 500.0 : configs.get(0).getAlertRadius();
        // 70% overlap threshold for identical circles is ~0.476 * R
        double distanceThreshold = radius * 0.476;

        List<FloodReport> reports = floodReportRepository.findAll().stream()
                .filter(r -> !"DELETED".equals(r.getStatus()) && !"PENDING".equals(r.getStatus()))
                .sorted(Comparator.comparing(FloodReport::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())))
                .collect(Collectors.toList());

        List<FloodHistoryDTO> historyGroups = new ArrayList<>();

        for (FloodReport report : reports) {
            if (report.getLocation() == null) continue;
            
            double lat = report.getLocation().getY();
            double lng = report.getLocation().getX();

            boolean foundGroup = false;
            for (FloodHistoryDTO group : historyGroups) {
                double dist = calculateDistance(lat, lng, group.getLat(), group.getLng());
                if (dist <= distanceThreshold) {
                    group.setFloodCount(group.getFloodCount() + 1);
                    if (report.getCreatedAt() != null && (group.getLastUpdate() == null || report.getCreatedAt().after(group.getLastUpdate()))) {
                        group.setLastUpdate(report.getCreatedAt());
                    }
                    foundGroup = true;
                    break;
                }
            }

            if (!foundGroup) {
                FloodHistoryDTO dto = new FloodHistoryDTO();
                dto.setId(report.getId());
                dto.setDescription(report.getDescription());
                dto.setLevel(report.getLevel());
                dto.setFloodCount(1);
                dto.setStatus(report.getStatus());
                dto.setLastUpdate(report.getCreatedAt());
                dto.setLat(lat);
                dto.setLng(lng);
                historyGroups.add(dto);
            }
        }

        historyGroups.sort((g1, g2) -> Integer.compare(g2.getFloodCount(), g1.getFloodCount()));
        return historyGroups;
    }
}

@Data
class FloodHistoryDTO {
    private String id;
    private String description;
    private String level;
    private int floodCount;
    private String status;
    private Date lastUpdate;
    private Double lat;
    private Double lng;
}
