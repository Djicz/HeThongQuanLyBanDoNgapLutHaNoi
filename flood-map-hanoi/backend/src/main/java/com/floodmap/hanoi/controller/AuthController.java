package com.floodmap.hanoi.controller;

import com.floodmap.hanoi.dto.JwtResponse;
import com.floodmap.hanoi.dto.LoginRequest;
import com.floodmap.hanoi.dto.MessageResponse;
import com.floodmap.hanoi.dto.SignupRequest;
import com.floodmap.hanoi.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        JwtResponse jwtResponse = authService.authenticateUser(loginRequest);
        return ResponseEntity.ok(jwtResponse);
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody SignupRequest signUpRequest) {
        String result = authService.registerUser(signUpRequest);
        if (result.startsWith("Error")) {
            return ResponseEntity.badRequest().body(new MessageResponse(result));
        }
        return ResponseEntity.ok(new MessageResponse(result));
    }
}
