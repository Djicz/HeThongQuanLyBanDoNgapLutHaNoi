package com.floodmap.hanoi.controller;

import com.floodmap.hanoi.dto.MessageResponse;
import com.floodmap.hanoi.model.FloodReport;
import com.floodmap.hanoi.model.FloodZone;
import com.floodmap.hanoi.model.SystemConfig;
import com.floodmap.hanoi.model.User;
import com.floodmap.hanoi.repository.FloodReportRepository;
import com.floodmap.hanoi.repository.FloodZoneRepository;
import com.floodmap.hanoi.repository.SystemConfigRepository;
import com.floodmap.hanoi.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/mod/reports")
@PreAuthorize("hasRole('MOD') or hasRole('ADMIN')")
public class ModReportController {

    @Autowired
    private FloodReportRepository reportRepository;

    @Autowired
    private FloodZoneRepository zoneRepository;

    @Autowired
    private SystemConfigRepository configRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<FloodReport>> getAllReports() {
        return ResponseEntity.ok(reportRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getReportById(@PathVariable String id) {
        Optional<FloodReport> report = reportRepository.findById(id);
        if (report.isPresent()) {
            return ResponseEntity.ok(report.get());
        }
        return ResponseEntity.badRequest().body(new MessageResponse("Không tìm thấy báo cáo"));
    }

    @PutMapping("/{id}/verify")
    public ResponseEntity<?> verifyReport(@PathVariable String id) {
        Optional<FloodReport> reportOpt = reportRepository.findById(id);
        if (reportOpt.isPresent()) {
            FloodReport report = reportOpt.get();
            if ("VERIFIED".equals(report.getStatus())) {
                return ResponseEntity.badRequest().body(new MessageResponse("Báo cáo đã được duyệt rồi"));
            }
            report.setStatus("VERIFIED");
            reportRepository.save(report);

            // Create FloodZone
            double radius = 500.0;
            List<SystemConfig> configs = configRepository.findAll();
            if (!configs.isEmpty()) {
                radius = configs.get(0).getAlertRadius();
            }

            FloodZone zone = FloodZone.builder()
                    .centerPoint(report.getLocation())
                    .radius(radius)
                    .level(report.getLevel())
                    .description(report.getDescription())
                    .status("ACTIVE")
                    .floodCount(1)
                    .build();
            zoneRepository.save(zone);

            return ResponseEntity.ok(new MessageResponse("Đã duyệt báo cáo và tạo vùng ngập"));
        }
        return ResponseEntity.badRequest().body(new MessageResponse("Không tìm thấy báo cáo"));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectReport(@PathVariable String id) {
        Optional<FloodReport> reportOpt = reportRepository.findById(id);
        if (reportOpt.isPresent()) {
            FloodReport report = reportOpt.get();
            report.setStatus("REJECTED");
            reportRepository.save(report);
            return ResponseEntity.ok(new MessageResponse("Đã từ chối báo cáo"));
        }
        return ResponseEntity.badRequest().body(new MessageResponse("Không tìm thấy báo cáo"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReport(@PathVariable String id) {
        Optional<FloodReport> reportOpt = reportRepository.findById(id);
        if (reportOpt.isPresent()) {
            FloodReport report = reportOpt.get();
            if (!"DELETED".equals(report.getStatus())) {
                User author = report.getUser();
                if (author != null) {
                    int netPoints = report.getUpvotes() - report.getDownvotes();
                    author.setReputationPoint(author.getReputationPoint() - netPoints);
                    userRepository.save(author);
                }
                report.setStatus("DELETED"); // Soft delete
                reportRepository.save(report);
            }
            return ResponseEntity.ok(new MessageResponse("Đã đánh dấu xóa (DELETED) báo cáo"));
        }
        return ResponseEntity.badRequest().body(new MessageResponse("Không tìm thấy báo cáo"));
    }
}
