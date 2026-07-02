package com.floodmap.hanoi.service;

import com.floodmap.hanoi.dto.JwtResponse;
import com.floodmap.hanoi.dto.LoginRequest;
import com.floodmap.hanoi.dto.SignupRequest;
import com.floodmap.hanoi.model.Role;
import com.floodmap.hanoi.model.User;
import com.floodmap.hanoi.model.UserStatus;
import com.floodmap.hanoi.repository.UserRepository;
import com.floodmap.hanoi.security.JwtUtils;
import com.floodmap.hanoi.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtils jwtUtils;

    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        User user = userRepository.findById(userDetails.getId()).orElse(null);
        String role = user != null ? user.getRole().name() : "";
        String fullName = user != null ? user.getFullName() : "";
        int reputationPoint = user != null ? user.getReputationPoint() : 0;

        return new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getEmail(),
                role,
                fullName,
                userDetails.isAccountNonLocked() ? "ACTIVE" : "LOCKED",
                reputationPoint);
    }

    public String registerUser(SignupRequest signUpRequest) {
        if (userRepository.findByEmail(signUpRequest.getEmail()).isPresent()) {
            return "Error: Email is already in use!";
        }

        User user = User.builder()
                .email(signUpRequest.getEmail())
                .password(encoder.encode(signUpRequest.getPassword()))
                .fullName(signUpRequest.getFullName())
                .role(Role.USER) // Default role
                .status(UserStatus.ACTIVE)
                .reputationPoint(0)
                .build();

        userRepository.save(user);
        return "User registered successfully!";
    }
}
