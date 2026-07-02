package com.floodmap.hanoi.repository;

import com.floodmap.hanoi.model.SystemNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SystemNotificationRepository extends JpaRepository<SystemNotification, String> {
    List<SystemNotification> findAllByOrderByCreatedAtDesc();
}
