package com.floodmap.hanoi.controller;

import com.floodmap.hanoi.dto.MessageResponse;
import com.floodmap.hanoi.model.Role;
import com.floodmap.hanoi.model.User;
import com.floodmap.hanoi.model.UserStatus;
import com.floodmap.hanoi.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable String id) {
        Optional<User> user = userService.getUserById(id);
        if (user.isPresent()) {
            return ResponseEntity.ok(user.get());
        }
        return ResponseEntity.badRequest().body(new MessageResponse("User not found!"));
    }

    @PutMapping("/{id}/lock")
    public ResponseEntity<?> toggleLockUser(@PathVariable String id) {
        String result = userService.toggleLockUser(id);
        if (result.contains("updated to")) {
            return ResponseEntity.ok(new MessageResponse(result));
        }
        return ResponseEntity.badRequest().body(new MessageResponse(result));
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<?> toggleUserRole(@PathVariable String id) {
        String result = userService.toggleUserRole(id);
        if (result.contains("updated to")) {
            return ResponseEntity.ok(new MessageResponse(result));
        }
        return ResponseEntity.badRequest().body(new MessageResponse(result));
    }

    @PutMapping("/{id}/reset-password")
    public ResponseEntity<?> resetPassword(@PathVariable String id, @RequestBody java.util.Map<String, String> body) {
        String newPassword = body.get("newPassword");
        String result = userService.resetPassword(id, newPassword);
        if (result.equals("Password reset successfully")) {
            return ResponseEntity.ok(new MessageResponse(result));
        }
        return ResponseEntity.badRequest().body(new MessageResponse(result));
    }
}
