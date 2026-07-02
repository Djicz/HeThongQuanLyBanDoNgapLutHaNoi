package com.floodmap.hanoi.service;

import com.floodmap.hanoi.model.Role;
import com.floodmap.hanoi.model.User;
import com.floodmap.hanoi.model.UserStatus;
import com.floodmap.hanoi.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(String id) {
        return userRepository.findById(id);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public String toggleLockUser(String id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getRole() == Role.ADMIN) {
                return "Cannot lock Admin account!";
            }
            if (user.getStatus() == UserStatus.ACTIVE) {
                user.setStatus(UserStatus.LOCKED);
            } else {
                user.setStatus(UserStatus.ACTIVE);
            }
            userRepository.save(user);
            return "User status updated to " + user.getStatus();
        }
        return "User not found!";
    }

    public String toggleUserRole(String id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getRole() == Role.ADMIN) {
                return "Cannot change role of Admin!";
            }
            if (user.getRole() == Role.USER) {
                user.setRole(Role.MOD);
            } else {
                user.setRole(Role.USER);
            }
            userRepository.save(user);
            return "User role updated to " + user.getRole();
        }
        return "User not found!";
    }

    public String resetPassword(String id, String newPassword) {
        if (newPassword == null || newPassword.length() < 6) {
            return "Password must be at least 6 characters!";
        }

        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            return "Password reset successfully";
        }
        return "User not found!";
    }
}
