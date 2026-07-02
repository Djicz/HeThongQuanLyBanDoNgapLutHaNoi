package com.floodmap.hanoi.controller;

import com.floodmap.hanoi.dto.MessageResponse;
import com.floodmap.hanoi.model.SystemNotification;
import com.floodmap.hanoi.service.SystemNotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin/notifications")
@PreAuthorize("hasRole('ADMIN')")
public class AdminNotificationController {

    @Autowired
    private SystemNotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<SystemNotification>> getNotifications() {
        return ResponseEntity.ok(notificationService.getAllNotifications());
    }

    @PostMapping
    public ResponseEntity<?> createNotification(@RequestBody SystemNotification notification) {
        SystemNotification saved = notificationService.createNotification(notification);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateNotification(@PathVariable String id, @RequestBody SystemNotification notificationDetails) {
        if (notificationService.updateNotification(id, notificationDetails)) {
            return ResponseEntity.ok(new MessageResponse("Cập nhật thông báo thành công"));
        }
        return ResponseEntity.badRequest().body(new MessageResponse("Không tìm thấy thông báo"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable String id) {
        if (notificationService.deleteNotification(id)) {
            return ResponseEntity.ok(new MessageResponse("Xóa thông báo thành công"));
        }
        return ResponseEntity.badRequest().body(new MessageResponse("Không tìm thấy thông báo"));
    }
}
