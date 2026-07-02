package com.floodmap.hanoi.service;

import com.floodmap.hanoi.model.ActivityLog;
import com.floodmap.hanoi.repository.ActivityLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ActivityLogService {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    public List<ActivityLog> getLogs() {
        return activityLogRepository.findAllByOrderByCreatedAtDesc();
    }
}
