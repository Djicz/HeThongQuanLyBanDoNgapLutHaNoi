package com.floodmap.hanoi.controller;

import com.floodmap.hanoi.model.FloodReport;
import com.floodmap.hanoi.model.FloodZone;
import com.floodmap.hanoi.repository.FloodReportRepository;
import com.floodmap.hanoi.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin/dashboard")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FloodReportRepository floodReportRepository;

    @Autowired
    private com.floodmap.hanoi.repository.SystemConfigRepository configRepository;

    @GetMapping("/stats")
    public ResponseEntity<?> getGeneralStats() {
        long totalUsers = userRepository.count();
        long totalReports = floodReportRepository.count();
        
        java.util.List<com.floodmap.hanoi.model.SystemConfig> configs = configRepository.findAll();
        long totalVisits = configs.isEmpty() ? 0 : configs.get(0).getTotalVisits();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("totalReports", totalReports);
        stats.put("totalVisits", totalVisits);
        
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/reports-by-district")
    public ResponseEntity<?> getReportsByDistrict() {
        List<FloodReport> reports = floodReportRepository.findAll();
        Map<String, Long> countByDistrict = reports.stream()
                .filter(r -> r.getDistrict() != null && !r.getDistrict().isEmpty())
                .collect(Collectors.groupingBy(FloodReport::getDistrict, Collectors.counting()));

        // Chuyển Map thành mảng object cho frontend vẽ biểu đồ
        List<Map<String, Object>> result = countByDistrict.entrySet().stream().map(entry -> {
            Map<String, Object> map = new HashMap<>();
            map.put("name", entry.getKey());
            map.put("value", entry.getValue());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }
}
