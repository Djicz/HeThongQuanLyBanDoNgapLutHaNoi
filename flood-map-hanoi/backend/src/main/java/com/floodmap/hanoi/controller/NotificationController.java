package com.floodmap.hanoi.controller;

import com.floodmap.hanoi.model.SystemNotification;
import com.floodmap.hanoi.service.SystemNotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private SystemNotificationService notificationService;

    @GetMapping("/latest")
    public ResponseEntity<?> getLatestNotification() {
        SystemNotification latestActive = notificationService.getLatestActiveGeneralNotification();
        
        if (latestActive != null) {
            return ResponseEntity.ok(latestActive);
        }
        return ResponseEntity.noContent().build();
    }
}
