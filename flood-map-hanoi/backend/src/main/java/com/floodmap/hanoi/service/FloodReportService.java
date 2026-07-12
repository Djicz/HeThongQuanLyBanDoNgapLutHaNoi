package com.floodmap.hanoi.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.floodmap.hanoi.dto.FloodHistoryDTO;
import com.floodmap.hanoi.dto.FloodReportDTO;
import com.floodmap.hanoi.model.FloodReport;
import com.floodmap.hanoi.model.FloodZone;
import com.floodmap.hanoi.model.Proof;
import com.floodmap.hanoi.model.SystemConfig;
import com.floodmap.hanoi.model.User;
import com.floodmap.hanoi.repository.FloodReportRepository;
import com.floodmap.hanoi.repository.FloodZoneRepository;
import com.floodmap.hanoi.repository.SystemConfigRepository;
import com.floodmap.hanoi.repository.UserRepository;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FloodReportService {

    @Autowired
    private FloodReportRepository floodReportRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SystemConfigRepository configRepository;

    @Autowired
    private FloodZoneRepository zoneRepository;

    @Autowired
    private ExternalApiService externalApiService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private final GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);

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

    // For AdminDashboardController
    public Map<String, Object> getGeneralStats() {
        long totalUsers = userRepository.count();
        long totalReports = floodReportRepository.count();
        
        List<SystemConfig> configs = configRepository.findAll();
        long totalVisits = configs.isEmpty() ? 0 : configs.get(0).getTotalVisits();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("totalReports", totalReports);
        stats.put("totalVisits", totalVisits);
        
        return stats;
    }

    public Map<String, Object> getDashboardChartsData() {
        List<FloodReport> reports = floodReportRepository.findAll();
        
        Map<String, Long> countByDistrict = reports.stream()
                .filter(r -> !"DELETED".equals(r.getStatus()))
                .filter(r -> r.getDistrict() != null && !r.getDistrict().isEmpty())
                .collect(Collectors.groupingBy(FloodReport::getDistrict, Collectors.counting()));

        List<Map<String, Object>> reportsByDistrictList = countByDistrict.entrySet().stream()
                .sorted((e1, e2) -> Long.compare(e2.getValue(), e1.getValue()))
                .limit(3)
                .map(entry -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("name", entry.getKey());
                    map.put("value", entry.getValue());
                    return map;
                })
                .collect(Collectors.toList());

        List<FloodZone> activeZones = zoneRepository.findAll();
        Map<String, Long> verifiedByDistrict = activeZones.stream()
                .filter(z -> "ACTIVE".equals(z.getStatus()))
                .filter(z -> z.getDistrict() != null && !z.getDistrict().isEmpty())
                .collect(Collectors.groupingBy(FloodZone::getDistrict, Collectors.counting()));

        List<Map.Entry<String, Long>> sortedVerified = verifiedByDistrict.entrySet().stream()
                .sorted((e1, e2) -> Long.compare(e2.getValue(), e1.getValue()))
                .collect(Collectors.toList());

        List<Map<String, Object>> floodRatioByAreaList = new ArrayList<>();
        long otherCount = 0;
        for (int i = 0; i < sortedVerified.size(); i++) {
            if (i < 4) {
                Map<String, Object> map = new HashMap<>();
                map.put("name", sortedVerified.get(i).getKey());
                map.put("value", sortedVerified.get(i).getValue());
                floodRatioByAreaList.add(map);
            } else {
                otherCount += sortedVerified.get(i).getValue();
            }
        }
        if (otherCount > 0) {
            Map<String, Object> otherMap = new HashMap<>();
            otherMap.put("name", "Khác");
            otherMap.put("value", otherCount);
            floodRatioByAreaList.add(otherMap);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("reportsByDistrict", reportsByDistrictList);
        result.put("floodRatioByArea", floodRatioByAreaList);
        
        return result;
    }

    // For FloodHistoryController
    public List<FloodHistoryDTO> getFloodHistory() {
        List<SystemConfig> configs = configRepository.findAll();
        double radius = configs.isEmpty() ? 500.0 : configs.get(0).getAlertRadius();
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

    // For FloodReportController
    public double getConfigAlertRadius() {
        List<SystemConfig> configs = configRepository.findAll();
        return configs.isEmpty() ? 500.0 : configs.get(0).getAlertRadius();
    }

    public List<FloodReportDTO> getAllPublicReports(String currentUserId) {
        List<SystemConfig> configs = configRepository.findAll();
        double radius = configs.isEmpty() ? 500.0 : configs.get(0).getAlertRadius();
        double distanceThreshold = radius * 0.476;

        List<FloodReport> allReports = floodReportRepository.findAll();

        List<FloodReport> verifiedReports = allReports.stream()
            .filter(r -> "VERIFIED".equals(r.getStatus()))
            .sorted(Comparator.comparing(FloodReport::getCreatedAt).reversed())
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
            if (report.getProofs() != null && !report.getProofs().isEmpty()) {
                dto.setProofImage(report.getProofs().get(0).getFileUrl());
            }
            return dto;
        }).toList();
    }

    public FloodReport createReport(double lat, double lng, String level, String description, MultipartFile image, User currentUser) throws Exception {
        FloodReport report = new FloodReport();
        report.setLevel(level);
        report.setDescription(description);
        report.setStatus("PENDING"); 
        report.setUser(currentUser);
        
        Point point = geometryFactory.createPoint(new Coordinate(lng, lat));
        report.setLocation(point);

        try {
            String geoJson = externalApiService.reverseGeocode(lat, lng);
            JsonNode root = objectMapper.readTree(geoJson);
            JsonNode addressNode = root.path("address");
            if (!addressNode.isMissingNode()) {
                String district = addressNode.path("city_district").asText(null);
                if (district == null) district = addressNode.path("county").asText(null);
                if (district == null) district = addressNode.path("suburb").asText(null);
                if (district == null) district = addressNode.path("state_district").asText(null);
                report.setDistrict(district != null ? district : "Không xác định");
            } else {
                report.setDistrict("Không xác định");
            }
        } catch (Exception e) {
            report.setDistrict("Không xác định");
        }

        if (image != null && !image.isEmpty()) {
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
        }

        return floodReportRepository.save(report);
    }

    // For ModReportController
    public List<FloodReport> getAllReports() {
        return floodReportRepository.findAll();
    }

    public Optional<FloodReport> getReportById(String id) {
        return floodReportRepository.findById(id);
    }

    public String verifyReport(String id) {
        Optional<FloodReport> reportOpt = floodReportRepository.findById(id);
        if (reportOpt.isPresent()) {
            FloodReport report = reportOpt.get();
            if ("VERIFIED".equals(report.getStatus())) {
                return "Báo cáo đã được duyệt rồi";
            }
            report.setStatus("VERIFIED");
            floodReportRepository.save(report);

            double radius = 500.0;
            List<SystemConfig> configs = configRepository.findAll();
            if (!configs.isEmpty()) {
                radius = configs.get(0).getAlertRadius();
            }

            FloodZone zone = FloodZone.builder()
                    .centerPoint(report.getLocation())
                    .district(report.getDistrict())
                    .radius(radius)
                    .level(report.getLevel())
                    .description(report.getDescription())
                    .status("ACTIVE")
                    .floodCount(1)
                    .build();
            zoneRepository.save(zone);

            return "Đã duyệt báo cáo và tạo vùng ngập";
        }
        return "Không tìm thấy báo cáo";
    }

    public String rejectReport(String id) {
        Optional<FloodReport> reportOpt = floodReportRepository.findById(id);
        if (reportOpt.isPresent()) {
            FloodReport report = reportOpt.get();
            report.setStatus("REJECTED");
            floodReportRepository.save(report);
            return "Đã từ chối báo cáo";
        }
        return "Không tìm thấy báo cáo";
    }

    public String deleteReportByAdmin(String id) {
        Optional<FloodReport> reportOpt = floodReportRepository.findById(id);
        if (reportOpt.isPresent()) {
            FloodReport report = reportOpt.get();
            if (!"DELETED".equals(report.getStatus())) {
                report.setStatus("DELETED"); // Soft delete
                floodReportRepository.save(report);
            }
            return "Đã đánh dấu xóa (DELETED) báo cáo";
        }
        return "Không tìm thấy báo cáo";
    }

    // For UserReportController
    public List<FloodReport> getMyReports(User user) {
        return floodReportRepository.findByUserId(user.getId());
    }

    public String deleteMyReport(String id, User user) {
        Optional<FloodReport> reportOpt = floodReportRepository.findById(id);
        if (reportOpt.isPresent()) {
            FloodReport report = reportOpt.get();
            if (!report.getUser().getId().equals(user.getId())) {
                return "Forbidden";
            }
            if ("DELETED".equals(report.getStatus())) {
                return "Báo cáo đã bị xóa trước đó";
            }
            report.setStatus("DELETED");
            floodReportRepository.save(report);
            return "Đã xóa báo cáo";
        }
        return "Không tìm thấy báo cáo";
    }

    @PostConstruct
    public void autoBackfillDistricts() {
        new Thread(this::backfillDistricts).start();
    }

    public void backfillDistricts() {
        List<FloodReport> reports = floodReportRepository.findAll();
        for (FloodReport report : reports) {
            if (report.getDistrict() == null || report.getDistrict().isEmpty() || report.getDistrict().equals("Không xác định")) {
                if (report.getLocation() != null) {
                    double lat = report.getLocation().getY();
                    double lng = report.getLocation().getX();
                    try {
                        String geoJson = externalApiService.reverseGeocode(lat, lng);
                        JsonNode root = objectMapper.readTree(geoJson);
                        JsonNode addressNode = root.path("address");
                        if (!addressNode.isMissingNode()) {
                            String district = addressNode.path("city_district").asText(null);
                            if (district == null) district = addressNode.path("county").asText(null);
                            if (district == null) district = addressNode.path("suburb").asText(null);
                            if (district == null) district = addressNode.path("state_district").asText(null);
                            report.setDistrict(district != null ? district : "Không xác định");
                            floodReportRepository.save(report);
                        }
                        Thread.sleep(1000); // Nominatim rate limit
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            }
        }

        List<FloodZone> zones = zoneRepository.findAll();
        for (FloodZone zone : zones) {
            if (zone.getDistrict() == null || zone.getDistrict().isEmpty() || zone.getDistrict().equals("Không xác định")) {
                if (zone.getCenterPoint() != null) {
                    double lat = zone.getCenterPoint().getY();
                    double lng = zone.getCenterPoint().getX();
                    try {
                        String geoJson = externalApiService.reverseGeocode(lat, lng);
                        JsonNode root = objectMapper.readTree(geoJson);
                        JsonNode addressNode = root.path("address");
                        if (!addressNode.isMissingNode()) {
                            String district = addressNode.path("city_district").asText(null);
                            if (district == null) district = addressNode.path("county").asText(null);
                            if (district == null) district = addressNode.path("suburb").asText(null);
                            if (district == null) district = addressNode.path("state_district").asText(null);
                            zone.setDistrict(district != null ? district : "Không xác định");
                            zoneRepository.save(zone);
                        }
                        Thread.sleep(1000);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            }
        }
    }
}
