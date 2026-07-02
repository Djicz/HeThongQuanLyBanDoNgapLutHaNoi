package com.floodmap.hanoi.controller;

import com.floodmap.hanoi.model.SystemNotification;
import com.floodmap.hanoi.repository.SystemNotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private SystemNotificationRepository notificationRepository;

    @GetMapping("/latest")
    public ResponseEntity<?> getLatestNotification() {
        List<SystemNotification> notifications = notificationRepository.findAllByOrderByCreatedAtDesc();
        SystemNotification latestActive = notifications.stream()
                .filter(n -> "ACTIVE".equals(n.getStatus()) && "GENERAL".equals(n.getType()))
                .findFirst()
                .orElse(null);
        
        if (latestActive != null) {
            return ResponseEntity.ok(latestActive);
        }
        return ResponseEntity.noContent().build();
    }
}
