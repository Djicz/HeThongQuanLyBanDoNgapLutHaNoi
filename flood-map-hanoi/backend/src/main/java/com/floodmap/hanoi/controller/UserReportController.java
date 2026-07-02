package com.floodmap.hanoi.controller;

import com.floodmap.hanoi.dto.MessageResponse;
import com.floodmap.hanoi.model.FloodReport;
import com.floodmap.hanoi.model.User;
import com.floodmap.hanoi.service.FloodReportService;
import com.floodmap.hanoi.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/user/reports")
@CrossOrigin(origins = "*")
public class UserReportController {

    @Autowired
    private FloodReportService floodReportService;

    @Autowired
    private UserService userService;

    private User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            String email = ((UserDetails) principal).getUsername();
            return userService.getUserByEmail(email).orElse(null);
        }
        return null;
    }

    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getMyReports() {
        User user = getCurrentUser();
        if (user == null) return ResponseEntity.status(401).body(new MessageResponse("Unauthorized"));
        
        List<FloodReport> reports = floodReportService.getMyReports(user);
        return ResponseEntity.ok(reports);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> deleteMyReport(@PathVariable String id) {
        User user = getCurrentUser();
        if (user == null) return ResponseEntity.status(401).body(new MessageResponse("Unauthorized"));
        
        String result = floodReportService.deleteMyReport(id, user);
        if (result.equals("Forbidden")) return ResponseEntity.status(403).body(new MessageResponse("Forbidden"));
        if (result.equals("Đã xóa báo cáo")) return ResponseEntity.ok(new MessageResponse(result));
        return ResponseEntity.badRequest().body(new MessageResponse(result));
    }
}
