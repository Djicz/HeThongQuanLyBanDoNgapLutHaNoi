package com.floodmap.hanoi.controller;

import com.floodmap.hanoi.dto.MessageResponse;
import com.floodmap.hanoi.model.Role;
import com.floodmap.hanoi.model.User;
import com.floodmap.hanoi.model.UserStatus;
import com.floodmap.hanoi.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable String id) {
        Optional<User> user = userRepository.findById(id);
        if (user.isPresent()) {
            return ResponseEntity.ok(user.get());
        }
        return ResponseEntity.badRequest().body(new MessageResponse("User not found!"));
    }

    @PutMapping("/{id}/lock")
    public ResponseEntity<?> toggleLockUser(@PathVariable String id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getRole() == Role.ADMIN) {
                return ResponseEntity.badRequest().body(new MessageResponse("Cannot lock Admin account!"));
            }
            if (user.getStatus() == UserStatus.ACTIVE) {
                user.setStatus(UserStatus.LOCKED);
            } else {
                user.setStatus(UserStatus.ACTIVE);
            }
            userRepository.save(user);
            return ResponseEntity.ok(new MessageResponse("User status updated to " + user.getStatus()));
        }
        return ResponseEntity.badRequest().body(new MessageResponse("User not found!"));
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<?> toggleUserRole(@PathVariable String id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getRole() == Role.ADMIN) {
                return ResponseEntity.badRequest().body(new MessageResponse("Cannot change role of Admin!"));
            }
            if (user.getRole() == Role.USER) {
                user.setRole(Role.MOD);
            } else {
                user.setRole(Role.USER);
            }
            userRepository.save(user);
            return ResponseEntity.ok(new MessageResponse("User role updated to " + user.getRole()));
        }
        return ResponseEntity.badRequest().body(new MessageResponse("User not found!"));
    }

    @PutMapping("/{id}/reset-password")
    public ResponseEntity<?> resetPassword(@PathVariable String id, @RequestBody java.util.Map<String, String> body) {
        String newPassword = body.get("newPassword");
        if (newPassword == null || newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(new MessageResponse("Password must be at least 6 characters!"));
        }

        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            return ResponseEntity.ok(new MessageResponse("Password reset successfully"));
        }
        return ResponseEntity.badRequest().body(new MessageResponse("User not found!"));
    }
}
