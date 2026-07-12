package com.floodmap.hanoi.service;

import com.floodmap.hanoi.model.SystemConfig;
import com.floodmap.hanoi.model.IpVisitLog;
import com.floodmap.hanoi.repository.SystemConfigRepository;
import com.floodmap.hanoi.repository.IpVisitLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class SystemConfigService {

    @Autowired
    private SystemConfigRepository configRepository;

    @Autowired
    private IpVisitLogRepository ipVisitLogRepository;

    @Autowired
    private SystemMaintenanceService systemMaintenanceService;

    public SystemConfig getConfig() {
        List<SystemConfig> configs = configRepository.findAll();
        if (configs.isEmpty()) {
            return SystemConfig.builder()
                    .alertRadius(500.0) // 500m
                    .reportExpired(24) // 24 hours
                    .autoDeletePercent(70) // 70% downvote
                    .totalVisits(0)
                    .build();
        }
        return configs.get(0);
    }

    public SystemConfig updateConfig(SystemConfig newConfig) {
        List<SystemConfig> configs = configRepository.findAll();
        SystemConfig configToUpdate;
        
        if (configs.isEmpty()) {
            configToUpdate = newConfig;
        } else {
            configToUpdate = configs.get(0);
            configToUpdate.setAlertRadius(newConfig.getAlertRadius());
            configToUpdate.setReportExpired(newConfig.getReportExpired());
            configToUpdate.setAutoDeletePercent(newConfig.getAutoDeletePercent());
        }
        
        return configRepository.save(configToUpdate);
    }

    public boolean recordVisit(String ip) {
        Optional<IpVisitLog> logOpt = ipVisitLogRepository.findById(ip);
        Date now = new Date();
        
        if (logOpt.isPresent()) {
            IpVisitLog log = logOpt.get();
            // Check if 3 hours have passed (3 * 60 * 60 * 1000 = 10800000 ms)
            if (now.getTime() - log.getLastVisit().getTime() < 10800000) {
                return false; // Too soon, ignore
            }
            log.setLastVisit(now);
            ipVisitLogRepository.save(log);
        } else {
            ipVisitLogRepository.save(new IpVisitLog(ip, now));
        }

        SystemConfig config = getConfig();
        config.setTotalVisits(config.getTotalVisits() + 1);
        configRepository.save(config);
        
        // Trigger maintenance check asynchronously so it doesn't block the request
        java.util.concurrent.CompletableFuture.runAsync(() -> {
            systemMaintenanceService.performMaintenance();
        });
        
        return true;
    }
}
