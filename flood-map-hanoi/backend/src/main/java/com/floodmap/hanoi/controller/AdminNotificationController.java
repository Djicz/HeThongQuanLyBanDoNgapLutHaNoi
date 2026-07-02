package com.floodmap.hanoi.controller;

import com.floodmap.hanoi.dto.MessageResponse;
import com.floodmap.hanoi.model.SystemNotification;
import com.floodmap.hanoi.repository.SystemNotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin/notifications")
@PreAuthorize("hasRole('ADMIN')")
public class AdminNotificationController {

    @Autowired
    private SystemNotificationRepository notificationRepository;

    @GetMapping
    public ResponseEntity<List<SystemNotification>> getNotifications() {
        return ResponseEntity.ok(notificationRepository.findAllByOrderByCreatedAtDesc());
    }

    @PostMapping
    public ResponseEntity<?> createNotification(@RequestBody SystemNotification notification) {
        notification.setStatus("ACTIVE");
        if (notification.getType() == null) {
            notification.setType("GENERAL");
        }
        SystemNotification saved = notificationRepository.save(notification);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateNotification(@PathVariable String id, @RequestBody SystemNotification notificationDetails) {
        Optional<SystemNotification> notifOpt = notificationRepository.findById(id);
        if (notifOpt.isPresent()) {
            SystemNotification notif = notifOpt.get();
            notif.setTitle(notificationDetails.getTitle());
            notif.setMessage(notificationDetails.getMessage());
            notif.setType(notificationDetails.getType());
            notif.setStatus(notificationDetails.getStatus());
            notificationRepository.save(notif);
            return ResponseEntity.ok(new MessageResponse("Cập nhật thông báo thành công"));
        }
        return ResponseEntity.badRequest().body(new MessageResponse("Không tìm thấy thông báo"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable String id) {
        if (notificationRepository.existsById(id)) {
            notificationRepository.deleteById(id);
            return ResponseEntity.ok(new MessageResponse("Xóa thông báo thành công"));
        }
        return ResponseEntity.badRequest().body(new MessageResponse("Không tìm thấy thông báo"));
    }
}
