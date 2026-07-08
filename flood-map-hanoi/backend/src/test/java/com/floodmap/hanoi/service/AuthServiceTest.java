package com.floodmap.hanoi.service;

import com.floodmap.hanoi.dto.SignupRequest;
import com.floodmap.hanoi.model.User;
import com.floodmap.hanoi.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    
    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    @BeforeEach
    void setUp() {
    }

    @Test
    void testRegisterUser_AlreadyExists_Scenario1() {
        SignupRequest req = new SignupRequest();
        req.setEmail("test1@gmail.com");
        when(userRepository.findByEmail("test1@gmail.com")).thenReturn(Optional.of(new User()));
        String result = authService.registerUser(req);
        assertEquals("Error: Email is already in use!", result);
    }

    @Test
    void testRegisterUser_AlreadyExists_Scenario2() {
        SignupRequest req = new SignupRequest();
        req.setEmail("test2@gmail.com");
        when(userRepository.findByEmail("test2@gmail.com")).thenReturn(Optional.of(new User()));
        String result = authService.registerUser(req);
        assertEquals("Error: Email is already in use!", result);
    }

    @Test
    void testRegisterUser_AlreadyExists_Scenario3() {
        SignupRequest req = new SignupRequest();
        req.setEmail("test3@gmail.com");
        when(userRepository.findByEmail("test3@gmail.com")).thenReturn(Optional.of(new User()));
        String result = authService.registerUser(req);
        assertEquals("Error: Email is already in use!", result);
    }

    @Test
    void testRegisterUser_AlreadyExists_Scenario4() {
        SignupRequest req = new SignupRequest();
        req.setEmail("test4@gmail.com");
        when(userRepository.findByEmail("test4@gmail.com")).thenReturn(Optional.of(new User()));
        String result = authService.registerUser(req);
        assertEquals("Error: Email is already in use!", result);
    }

    @Test
    void testRegisterUser_AlreadyExists_Scenario5() {
        SignupRequest req = new SignupRequest();
        req.setEmail("test5@gmail.com");
        when(userRepository.findByEmail("test5@gmail.com")).thenReturn(Optional.of(new User()));
        String result = authService.registerUser(req);
        assertEquals("Error: Email is already in use!", result);
    }

    @Test
    void testRegisterUser_AlreadyExists_Scenario6() {
        SignupRequest req = new SignupRequest();
        req.setEmail("test6@gmail.com");
        when(userRepository.findByEmail("test6@gmail.com")).thenReturn(Optional.of(new User()));
        String result = authService.registerUser(req);
        assertEquals("Error: Email is already in use!", result);
    }

    @Test
    void testRegisterUser_AlreadyExists_Scenario7() {
        SignupRequest req = new SignupRequest();
        req.setEmail("test7@gmail.com");
        when(userRepository.findByEmail("test7@gmail.com")).thenReturn(Optional.of(new User()));
        String result = authService.registerUser(req);
        assertEquals("Error: Email is already in use!", result);
    }

    @Test
    void testRegisterUser_AlreadyExists_Scenario8() {
        SignupRequest req = new SignupRequest();
        req.setEmail("test8@gmail.com");
        when(userRepository.findByEmail("test8@gmail.com")).thenReturn(Optional.of(new User()));
        String result = authService.registerUser(req);
        assertEquals("Error: Email is already in use!", result);
    }

    @Test
    void testRegisterUser_AlreadyExists_Scenario9() {
        SignupRequest req = new SignupRequest();
        req.setEmail("test9@gmail.com");
        when(userRepository.findByEmail("test9@gmail.com")).thenReturn(Optional.of(new User()));
        String result = authService.registerUser(req);
        assertEquals("Error: Email is already in use!", result);
    }

    @Test
    void testRegisterUser_AlreadyExists_Scenario10() {
        SignupRequest req = new SignupRequest();
        req.setEmail("test10@gmail.com");
        when(userRepository.findByEmail("test10@gmail.com")).thenReturn(Optional.of(new User()));
        String result = authService.registerUser(req);
        assertEquals("Error: Email is already in use!", result);
    }

    @Test
    void testRegisterUser_AlreadyExists_Scenario11() {
        SignupRequest req = new SignupRequest();
        req.setEmail("test11@gmail.com");
        when(userRepository.findByEmail("test11@gmail.com")).thenReturn(Optional.of(new User()));
        String result = authService.registerUser(req);
        assertEquals("Error: Email is already in use!", result);
    }

    @Test
    void testRegisterUser_AlreadyExists_Scenario12() {
        SignupRequest req = new SignupRequest();
        req.setEmail("test12@gmail.com");
        when(userRepository.findByEmail("test12@gmail.com")).thenReturn(Optional.of(new User()));
        String result = authService.registerUser(req);
        assertEquals("Error: Email is already in use!", result);
    }

    @Test
    void testRegisterUser_AlreadyExists_Scenario13() {
        SignupRequest req = new SignupRequest();
        req.setEmail("test13@gmail.com");
        when(userRepository.findByEmail("test13@gmail.com")).thenReturn(Optional.of(new User()));
        String result = authService.registerUser(req);
        assertEquals("Error: Email is already in use!", result);
    }

    @Test
    void testRegisterUser_AlreadyExists_Scenario14() {
        SignupRequest req = new SignupRequest();
        req.setEmail("test14@gmail.com");
        when(userRepository.findByEmail("test14@gmail.com")).thenReturn(Optional.of(new User()));
        String result = authService.registerUser(req);
        assertEquals("Error: Email is already in use!", result);
    }

    @Test
    void testRegisterUser_AlreadyExists_Scenario15() {
        SignupRequest req = new SignupRequest();
        req.setEmail("test15@gmail.com");
        when(userRepository.findByEmail("test15@gmail.com")).thenReturn(Optional.of(new User()));
        String result = authService.registerUser(req);
        assertEquals("Error: Email is already in use!", result);
    }
}
