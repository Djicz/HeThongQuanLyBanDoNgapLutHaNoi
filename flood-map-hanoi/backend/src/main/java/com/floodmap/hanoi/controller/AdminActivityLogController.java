package com.floodmap.hanoi.controller;

import com.floodmap.hanoi.model.ActivityLog;
import com.floodmap.hanoi.service.ActivityLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin/logs")
@PreAuthorize("hasRole('ADMIN')")
public class AdminActivityLogController {

    @Autowired
    private ActivityLogService activityLogService;

    @GetMapping
    public ResponseEntity<List<ActivityLog>> getLogs() {
        return ResponseEntity.ok(activityLogService.getLogs());
    }
}
