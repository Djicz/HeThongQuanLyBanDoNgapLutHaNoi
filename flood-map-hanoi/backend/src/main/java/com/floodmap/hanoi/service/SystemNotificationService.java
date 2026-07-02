package com.floodmap.hanoi.service;

import com.floodmap.hanoi.model.SystemNotification;
import com.floodmap.hanoi.repository.SystemNotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SystemNotificationService {

    @Autowired
    private SystemNotificationRepository notificationRepository;

    public List<SystemNotification> getAllNotifications() {
        return notificationRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<SystemNotification> getActiveNotifications() {
        return notificationRepository.findByStatusOrderByCreatedAtDesc("ACTIVE");
    }

    public SystemNotification getLatestActiveGeneralNotification() {
        List<SystemNotification> notifications = notificationRepository.findAllByOrderByCreatedAtDesc();
        return notifications.stream()
                .filter(n -> "ACTIVE".equals(n.getStatus()) && "GENERAL".equals(n.getType()))
                .findFirst()
                .orElse(null);
    }

    public SystemNotification createNotification(SystemNotification notification) {
        notification.setStatus("ACTIVE");
        if (notification.getType() == null) {
            notification.setType("GENERAL");
        }
        return notificationRepository.save(notification);
    }

    public boolean updateNotification(String id, SystemNotification notificationDetails) {
        Optional<SystemNotification> notifOpt = notificationRepository.findById(id);
        if (notifOpt.isPresent()) {
            SystemNotification notif = notifOpt.get();
            notif.setTitle(notificationDetails.getTitle());
            notif.setMessage(notificationDetails.getMessage());
            notif.setType(notificationDetails.getType());
            notif.setStatus(notificationDetails.getStatus());
            notificationRepository.save(notif);
            return true;
        }
        return false;
    }

    public boolean deleteNotification(String id) {
        if (notificationRepository.existsById(id)) {
            notificationRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
