package com.floodmap.hanoi.controller;

import com.floodmap.hanoi.dto.MessageResponse;
import com.floodmap.hanoi.model.SystemConfig;
import com.floodmap.hanoi.repository.SystemConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin/config")
@PreAuthorize("hasRole('ADMIN')")
public class AdminConfigController {

    @Autowired
    private SystemConfigRepository configRepository;

    @GetMapping
    public ResponseEntity<?> getConfig() {
        List<SystemConfig> configs = configRepository.findAll();
        if (configs.isEmpty()) {
            // Return default if not exists
            SystemConfig defaultConfig = SystemConfig.builder()
                    .alertRadius(500.0) // 500m
                    .reportExpired(24) // 24 hours
                    .autoDeletePercent(70) // 70% downvote
                    .build();
            return ResponseEntity.ok(defaultConfig);
        }
        return ResponseEntity.ok(configs.get(0));
    }

    @PutMapping
    public ResponseEntity<?> updateConfig(@RequestBody SystemConfig newConfig) {
        if (newConfig.getAutoDeletePercent() < 0 || newConfig.getAutoDeletePercent() > 100) {
            return ResponseEntity.badRequest().body(new MessageResponse("Tỷ lệ xóa tự động phải từ 0 đến 100%"));
        }
        if (newConfig.getAlertRadius() < 0) {
            return ResponseEntity.badRequest().body(new MessageResponse("Bán kính cảnh báo không được âm"));
        }
        if (newConfig.getReportExpired() < 0) {
            return ResponseEntity.badRequest().body(new MessageResponse("Thời gian hết hạn không được âm"));
        }

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
        
        configRepository.save(configToUpdate);
        return ResponseEntity.ok(new MessageResponse("Cập nhật cấu hình thành công"));
    }
}
