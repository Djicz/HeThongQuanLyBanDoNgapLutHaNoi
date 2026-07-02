package com.floodmap.hanoi.controller;

import com.floodmap.hanoi.dto.MessageResponse;
import com.floodmap.hanoi.model.User;
import com.floodmap.hanoi.service.UserService;
import com.floodmap.hanoi.service.VoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user/reports")
@CrossOrigin(origins = "*")
public class VoteController {

    @Autowired
    private VoteService voteService;

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

    @PostMapping("/{id}/vote")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> voteReport(@PathVariable String id, @RequestParam boolean isUpvote) {
        User currentUser = getCurrentUser();
        if (currentUser == null) return ResponseEntity.status(401).body(new MessageResponse("Unauthorized"));

        String result = voteService.voteReport(id, isUpvote, currentUser);
        if (result.startsWith("Đã ghi nhận")) {
            return ResponseEntity.ok(new MessageResponse(result));
        }
        return ResponseEntity.badRequest().body(new MessageResponse(result));
    }
}
