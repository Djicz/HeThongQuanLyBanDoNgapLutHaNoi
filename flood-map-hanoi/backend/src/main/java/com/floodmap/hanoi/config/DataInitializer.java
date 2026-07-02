package com.floodmap.hanoi.config;

import com.floodmap.hanoi.model.Role;
import com.floodmap.hanoi.model.User;
import com.floodmap.hanoi.model.UserStatus;
import com.floodmap.hanoi.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        String adminEmail = "admin@floodmap.com";
        Optional<User> adminOptional = userRepository.findByEmail(adminEmail);

        if (adminOptional.isEmpty()) {
            User admin = User.builder()
                    .email(adminEmail)
                    .password(passwordEncoder.encode("admin123"))
                    .fullName("System Administrator")
                    .role(Role.ADMIN)
                    .status(UserStatus.ACTIVE)
                    .reputationPoint(9999)
                    .build();

            userRepository.save(admin);
            System.out.println("Admin account created: " + adminEmail + " / admin123");
        } else {
            System.out.println("Admin account already exists.");
        }
    }
}
