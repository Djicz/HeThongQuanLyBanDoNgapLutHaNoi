package com.floodmap.hanoi.controller;

import com.floodmap.hanoi.dto.FloodReportDTO;
import com.floodmap.hanoi.model.FloodReport;
import com.floodmap.hanoi.model.User;
import com.floodmap.hanoi.service.FloodReportService;
import com.floodmap.hanoi.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/flood-reports")
@CrossOrigin(origins = "*") // Cho phép frontend gọi API
public class FloodReportController {

    @Autowired
    private FloodReportService floodReportService;

    @Autowired
    private UserService userService;

    @GetMapping("/config")
    public ResponseEntity<?> getConfig() {
        double radius = floodReportService.getConfigAlertRadius();
        return ResponseEntity.ok(java.util.Map.of("alertRadius", radius));
    }

    @GetMapping
    public List<FloodReportDTO> getAllReports() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User currentUser = null;
        if (principal instanceof UserDetails) {
            String email = ((UserDetails) principal).getUsername();
            currentUser = userService.getUserByEmail(email).orElse(null);
        }
        final String currentUserId = (currentUser != null) ? currentUser.getId() : null;

        return floodReportService.getAllPublicReports(currentUserId);
    }

    @PostMapping(consumes = { "multipart/form-data" })
    @PreAuthorize("hasAnyRole('USER', 'MOD', 'ADMIN')")
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
            currentUser = userService.getUserByEmail(email).orElse(null);
        }

        if (currentUser == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        try {
            FloodReport savedReport = floodReportService.createReport(lat, lng, level, description, image, currentUser);
            return ResponseEntity.ok(savedReport);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi khi tải ảnh lên hoặc lưu báo cáo");
        }
    }
}
