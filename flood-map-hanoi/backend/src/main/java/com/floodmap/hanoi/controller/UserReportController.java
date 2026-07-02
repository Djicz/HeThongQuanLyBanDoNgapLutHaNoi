package com.floodmap.hanoi.controller;

import com.floodmap.hanoi.dto.MessageResponse;
import com.floodmap.hanoi.model.FloodReport;
import com.floodmap.hanoi.repository.FloodReportRepository;
import com.floodmap.hanoi.repository.UserRepository;
import com.floodmap.hanoi.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/user/reports")
@CrossOrigin(origins = "*")
public class UserReportController {

    @Autowired
    private FloodReportRepository reportRepository;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            String email = ((UserDetails) principal).getUsername();
            return userRepository.findByEmail(email).orElse(null);
        }
        return null;
    }

    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getMyReports() {
        User user = getCurrentUser();
        if (user == null) return ResponseEntity.status(401).body(new MessageResponse("Unauthorized"));
        
        List<FloodReport> reports = reportRepository.findByUserId(user.getId());
        return ResponseEntity.ok(reports);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> deleteMyReport(@PathVariable String id) {
        User user = getCurrentUser();
        if (user == null) return ResponseEntity.status(401).body(new MessageResponse("Unauthorized"));
        
        Optional<FloodReport> reportOpt = reportRepository.findById(id);
        if (reportOpt.isPresent()) {
            FloodReport report = reportOpt.get();
            if (!report.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).body(new MessageResponse("Forbidden"));
            }
            if ("DELETED".equals(report.getStatus())) {
                return ResponseEntity.badRequest().body(new MessageResponse("Báo cáo đã bị xóa trước đó"));
            }
            User author = report.getUser();
            if (author != null) {
                int netPoints = report.getUpvotes() - report.getDownvotes();
                author.setReputationPoint(author.getReputationPoint() - netPoints);
                userRepository.save(author);
            }
            report.setStatus("DELETED");
            reportRepository.save(report);
            return ResponseEntity.ok(new MessageResponse("Đã xóa báo cáo"));
        }
        return ResponseEntity.badRequest().body(new MessageResponse("Không tìm thấy báo cáo"));
    }
}
