package com.floodmap.hanoi.controller;

import com.floodmap.hanoi.model.SystemConfig;
import com.floodmap.hanoi.model.IpVisitLog;
import com.floodmap.hanoi.repository.SystemConfigRepository;
import com.floodmap.hanoi.repository.IpVisitLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/public")
public class SystemController {

    @Autowired
    private SystemConfigRepository configRepository;
    
    @Autowired
    private IpVisitLogRepository ipVisitLogRepository;

    @PostMapping("/visit")
    public ResponseEntity<?> recordVisit(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        
        Optional<IpVisitLog> logOpt = ipVisitLogRepository.findById(ip);
        Date now = new Date();
        
        if (logOpt.isPresent()) {
            IpVisitLog log = logOpt.get();
            // Check if 3 hours have passed (3 * 60 * 60 * 1000 = 10800000 ms)
            if (now.getTime() - log.getLastVisit().getTime() < 10800000) {
                return ResponseEntity.ok().build(); // Too soon, ignore
            }
            log.setLastVisit(now);
            ipVisitLogRepository.save(log);
        } else {
            ipVisitLogRepository.save(new IpVisitLog(ip, now));
        }

        List<SystemConfig> configs = configRepository.findAll();
        SystemConfig config;
        if (configs.isEmpty()) {
            config = new SystemConfig();
            config.setAlertRadius(500.0);
            config.setReportExpired(24);
            config.setAutoDeletePercent(50);
            config.setTotalVisits(1);
        } else {
            config = configs.get(0);
            config.setTotalVisits(config.getTotalVisits() + 1);
        }
        configRepository.save(config);
        return ResponseEntity.ok().build();
    }
}
