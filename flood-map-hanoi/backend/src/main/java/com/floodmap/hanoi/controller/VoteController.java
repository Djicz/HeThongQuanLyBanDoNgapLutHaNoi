package com.floodmap.hanoi.controller;

import com.floodmap.hanoi.dto.MessageResponse;
import com.floodmap.hanoi.model.FloodReport;
import com.floodmap.hanoi.model.ReportVote;
import com.floodmap.hanoi.model.SystemConfig;
import com.floodmap.hanoi.model.User;
import com.floodmap.hanoi.repository.FloodReportRepository;
import com.floodmap.hanoi.repository.ReportVoteRepository;
import com.floodmap.hanoi.repository.SystemConfigRepository;
import com.floodmap.hanoi.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/user/reports")
@CrossOrigin(origins = "*")
public class VoteController {

    @Autowired
    private FloodReportRepository reportRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReportVoteRepository reportVoteRepository;

    @Autowired
    private SystemConfigRepository configRepository;

    private User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            String email = ((UserDetails) principal).getUsername();
            return userRepository.findByEmail(email).orElse(null);
        }
        return null;
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371000; // Radius of the earth in m
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // distance in m
    }

    @PostMapping("/{id}/vote")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> voteReport(@PathVariable String id, @RequestParam boolean isUpvote) {
        User currentUser = getCurrentUser();
        if (currentUser == null) return ResponseEntity.status(401).body(new MessageResponse("Unauthorized"));

        Optional<FloodReport> reportOpt = reportRepository.findById(id);
        if (reportOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Không tìm thấy báo cáo"));
        }

        FloodReport primaryReport = reportOpt.get();

        List<SystemConfig> configs = configRepository.findAll();
        double radius = configs.isEmpty() ? 500.0 : configs.get(0).getAlertRadius();
        double distanceThreshold = radius * 0.476; // 70% overlap threshold

        if (primaryReport.getLocation() == null) {
             return ResponseEntity.badRequest().body(new MessageResponse("Báo cáo không có thông tin vị trí"));
        }

        double pLat = primaryReport.getLocation().getY();
        double pLng = primaryReport.getLocation().getX();

        List<FloodReport> allReports = reportRepository.findAll();
        
        boolean userHasVerifiedReportInZone = false;
        for (FloodReport r : allReports) {
            if ("VERIFIED".equals(r.getStatus()) && r.getLocation() != null && r.getUser() != null && r.getUser().getId().equals(currentUser.getId())) {
                double dist = calculateDistance(pLat, pLng, r.getLocation().getY(), r.getLocation().getX());
                if (dist <= distanceThreshold) {
                    userHasVerifiedReportInZone = true;
                    break;
                }
            }
        }

        if (userHasVerifiedReportInZone) {
            return ResponseEntity.badRequest().body(new MessageResponse("Bạn đã có báo cáo trong vùng ngập này, không thể tự vote."));
        }

        int affectedCount = 0;

        for (FloodReport r : allReports) {
            if (!"VERIFIED".equals(r.getStatus()) || r.getLocation() == null) continue;
            
            // Bỏ qua nếu tác giả tự vote
            if (r.getUser() != null && r.getUser().getId().equals(currentUser.getId())) continue;

            double dist = calculateDistance(pLat, pLng, r.getLocation().getY(), r.getLocation().getX());
            if (dist <= distanceThreshold) {
                processVoteForReport(r, currentUser, isUpvote);
                affectedCount++;
            }
        }

        // Fallback: nếu báo cáo chính chưa verify nhưng người dùng cố gắng vote (chỉ hiển thị trong một số trường hợp cụ thể)
        if (affectedCount == 0 && !"VERIFIED".equals(primaryReport.getStatus())) {
            if (primaryReport.getUser() != null && !primaryReport.getUser().getId().equals(currentUser.getId())) {
                processVoteForReport(primaryReport, currentUser, isUpvote);
                affectedCount++;
            }
        }

        if (affectedCount == 0) {
             return ResponseEntity.badRequest().body(new MessageResponse("Không tìm thấy báo cáo hợp lệ để vote, hoặc bạn đang vote cho báo cáo của chính mình."));
        }

        return ResponseEntity.ok(new MessageResponse("Đã ghi nhận đánh giá của bạn cho " + affectedCount + " báo cáo trong khu vực"));
    }

    private void processVoteForReport(FloodReport report, User currentUser, boolean isUpvote) {
        Optional<ReportVote> existingVoteOpt = reportVoteRepository.findByUserIdAndReportId(currentUser.getId(), report.getId());
        User author = report.getUser();

        if (existingVoteOpt.isPresent()) {
            ReportVote existingVote = existingVoteOpt.get();
            if (existingVote.isUpvote() == isUpvote) {
                return; // Nothing changed
            }

            // Vote type changed
            existingVote.setUpvote(isUpvote);
            reportVoteRepository.save(existingVote);

            if (isUpvote) {
                report.setUpvotes(report.getUpvotes() + 1);
                report.setDownvotes(Math.max(0, report.getDownvotes() - 1));
                if (author != null) author.setReputationPoint(author.getReputationPoint() + 2);
            } else {
                report.setDownvotes(report.getDownvotes() + 1);
                report.setUpvotes(Math.max(0, report.getUpvotes() - 1));
                if (author != null) author.setReputationPoint(author.getReputationPoint() - 2);
            }
        } else {
            // New vote
            ReportVote newVote = ReportVote.builder()
                    .user(currentUser)
                    .report(report)
                    .isUpvote(isUpvote)
                    .build();
            reportVoteRepository.save(newVote);

            if (isUpvote) {
                report.setUpvotes(report.getUpvotes() + 1);
                if (author != null) author.setReputationPoint(author.getReputationPoint() + 1);
            } else {
                report.setDownvotes(report.getDownvotes() + 1);
                if (author != null) author.setReputationPoint(author.getReputationPoint() - 1);
            }
        }

        reportRepository.save(report);
        if (author != null) {
            userRepository.save(author);
        }
    }
}
