package com.floodmap.hanoi.controller;

import com.floodmap.hanoi.dto.MessageResponse;
import com.floodmap.hanoi.model.SystemConfig;
import com.floodmap.hanoi.service.SystemConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin/config")
@PreAuthorize("hasRole('ADMIN')")
public class AdminConfigController {

    @Autowired
    private SystemConfigService configService;

    @GetMapping
    public ResponseEntity<?> getConfig() {
        return ResponseEntity.ok(configService.getConfig());
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

        configService.updateConfig(newConfig);
        return ResponseEntity.ok(new MessageResponse("Cập nhật cấu hình thành công"));
    }
}
