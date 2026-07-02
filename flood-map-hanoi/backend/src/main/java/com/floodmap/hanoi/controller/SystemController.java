package com.floodmap.hanoi.controller;

import com.floodmap.hanoi.model.SystemConfig;
import com.floodmap.hanoi.model.IpVisitLog;
import com.floodmap.hanoi.service.SystemConfigService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/public")
public class SystemController {

    @Autowired
    private SystemConfigService systemConfigService;

    @PostMapping("/visit")
    public ResponseEntity<?> recordVisit(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        
        systemConfigService.recordVisit(ip);
        
        return ResponseEntity.ok().build();
    }
}
