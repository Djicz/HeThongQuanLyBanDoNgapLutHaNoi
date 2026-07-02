package com.floodmap.hanoi.controller;

import com.floodmap.hanoi.model.FloodReport;
import com.floodmap.hanoi.repository.FloodReportRepository;
import com.floodmap.hanoi.repository.SystemConfigRepository;
import com.floodmap.hanoi.model.SystemConfig;
import lombok.Data;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.ArrayList;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import com.floodmap.hanoi.repository.UserRepository;
import com.floodmap.hanoi.model.User;
import com.floodmap.hanoi.model.Proof;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/flood-reports")
@CrossOrigin(origins = "*") // Cho phép frontend gọi API
public class FloodReportController {

    @Autowired
    private FloodReportRepository floodReportRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SystemConfigRepository configRepository;

    private final GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);

    @GetMapping("/config")
    public ResponseEntity<?> getConfig() {
        List<SystemConfig> configs = configRepository.findAll();
        double radius = configs.isEmpty() ? 500.0 : configs.get(0).getAlertRadius();
        return ResponseEntity.ok(java.util.Map.of("alertRadius", radius));
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371000;
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    @GetMapping
    public List<FloodReportDTO> getAllReports() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User currentUser = null;
        if (principal instanceof UserDetails) {
            String email = ((UserDetails) principal).getUsername();
            currentUser = userRepository.findByEmail(email).orElse(null);
        }
        final String currentUserId = (currentUser != null) ? currentUser.getId() : null;

        List<SystemConfig> configs = configRepository.findAll();
        double radius = configs.isEmpty() ? 500.0 : configs.get(0).getAlertRadius();
        double distanceThreshold = radius * 0.476;

        List<FloodReport> allReports = floodReportRepository.findAll();

        List<FloodReport> verifiedReports = allReports.stream()
            .filter(r -> "VERIFIED".equals(r.getStatus()))
            .sorted(java.util.Comparator.comparing(FloodReport::getCreatedAt).reversed())
            .toList();

        List<FloodReport> groupedVerified = new ArrayList<>();
        for (FloodReport r : verifiedReports) {
            if (r.getLocation() == null) continue;
            boolean isCovered = false;
            for (FloodReport g : groupedVerified) {
                if (g.getLocation() == null) continue;
                double dist = calculateDistance(r.getLocation().getY(), r.getLocation().getX(), g.getLocation().getY(), g.getLocation().getX());
                if (dist <= distanceThreshold) {
                    isCovered = true;
                    break;
                }
            }
            if (!isCovered) {
                groupedVerified.add(r);
            }
        }

        List<FloodReport> userOtherReports = allReports.stream()
            .filter(r -> currentUserId != null && r.getUser() != null && r.getUser().getId().equals(currentUserId))
            .filter(r -> !"VERIFIED".equals(r.getStatus()) && !"DELETED".equals(r.getStatus()))
            .toList();

        List<FloodReport> finalReports = new ArrayList<>(groupedVerified);
        finalReports.addAll(userOtherReports);

        return finalReports.stream().map(report -> {
            FloodReportDTO dto = new FloodReportDTO();
            dto.setId(report.getId());
            dto.setLevel(report.getLevel());
            dto.setDescription(report.getDescription());
            dto.setStatus(report.getStatus());
            if (report.getUser() != null) {
                dto.setUserId(report.getUser().getId());
            }
            if (report.getLocation() != null) {
                dto.setLat(report.getLocation().getY());
                dto.setLng(report.getLocation().getX());
            }
            dto.setUpvotes(report.getUpvotes());
            dto.setDownvotes(report.getDownvotes());
            return dto;
        }).toList();
    }

    @PostMapping(consumes = { "multipart/form-data" })
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> createReport(
            @RequestParam("lat") double lat,
            @RequestParam("lng") double lng,
            @RequestParam("level") String level,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User currentUser = null;
        if (principal instanceof UserDetails) {
            String email = ((UserDetails) principal).getUsername();
            currentUser = userRepository.findByEmail(email).orElse(null);
        }

        if (currentUser == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        FloodReport report = new FloodReport();
        report.setLevel(level);
        report.setDescription(description);
        report.setStatus("PENDING"); // Chờ duyệt
        report.setUser(currentUser);
        
        Point point = geometryFactory.createPoint(new Coordinate(lng, lat));
        report.setLocation(point);

        if (image != null && !image.isEmpty()) {
            try {
                String uploadsDir = "uploads/";
                Path uploadPath = Paths.get(uploadsDir);
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }
                String filename = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
                Path filePath = uploadPath.resolve(filename);
                Files.copy(image.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                
                Proof proof = new Proof();
                proof.setFileUrl("/uploads/" + filename);
                proof.setType("IMAGE");
                proof.setFloodReport(report);
                
                List<Proof> proofs = new ArrayList<>();
                proofs.add(proof);
                report.setProofs(proofs);
            } catch (Exception e) {
                return ResponseEntity.status(500).body("Lỗi khi tải ảnh lên");
            }
        }

        FloodReport savedReport = floodReportRepository.save(report);
        return ResponseEntity.ok(savedReport);
    }
}

@Data
class FloodReportDTO {
    private String id;
    private double lat;
    private double lng;
    private String level;
    private String description;
    private String status;
    private String userId;
    private int upvotes;
    private int downvotes;
}
