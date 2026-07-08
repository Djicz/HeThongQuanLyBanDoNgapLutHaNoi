package com.floodmap.hanoi.controller;

import com.floodmap.hanoi.service.FloodReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin/dashboard")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    @Autowired
    private FloodReportService floodReportService;

    @GetMapping("/stats")
    public ResponseEntity<?> getGeneralStats() {
        return ResponseEntity.ok(floodReportService.getGeneralStats());
    }

    @GetMapping("/reports-by-district")
    public ResponseEntity<?> getReportsByDistrict() {
        return ResponseEntity.ok(floodReportService.getDashboardChartsData());
    }

    @PostMapping("/backfill-districts")
    public ResponseEntity<?> backfillDistricts() {
        new Thread(() -> floodReportService.backfillDistricts()).start();
        return ResponseEntity.ok(java.util.Map.of("message", "Đang cập nhật lại quận/huyện cho các báo cáo cũ. Vui lòng đợi vài phút."));
    }
}
