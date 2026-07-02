package com.floodmap.hanoi.controller;

import com.floodmap.hanoi.dto.MessageResponse;
import com.floodmap.hanoi.model.FloodReport;
import com.floodmap.hanoi.service.FloodReportService;
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
    private FloodReportService floodReportService;

    @GetMapping
    public ResponseEntity<List<FloodReport>> getAllReports() {
        return ResponseEntity.ok(floodReportService.getAllReports());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getReportById(@PathVariable String id) {
        Optional<FloodReport> report = floodReportService.getReportById(id);
        if (report.isPresent()) {
            return ResponseEntity.ok(report.get());
        }
        return ResponseEntity.badRequest().body(new MessageResponse("Không tìm thấy báo cáo"));
    }

    @PutMapping("/{id}/verify")
    public ResponseEntity<?> verifyReport(@PathVariable String id) {
        String result = floodReportService.verifyReport(id);
        if (result.startsWith("Đã duyệt")) {
            return ResponseEntity.ok(new MessageResponse(result));
        }
        return ResponseEntity.badRequest().body(new MessageResponse(result));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectReport(@PathVariable String id) {
        String result = floodReportService.rejectReport(id);
        if (result.startsWith("Đã từ chối")) {
            return ResponseEntity.ok(new MessageResponse(result));
        }
        return ResponseEntity.badRequest().body(new MessageResponse(result));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReport(@PathVariable String id) {
        String result = floodReportService.deleteReportByAdmin(id);
        if (result.startsWith("Đã đánh dấu xóa")) {
            return ResponseEntity.ok(new MessageResponse(result));
        }
        return ResponseEntity.badRequest().body(new MessageResponse(result));
    }
}
