package com.floodmap.hanoi.service;

import com.floodmap.hanoi.model.Role;
import com.floodmap.hanoi.model.User;
import com.floodmap.hanoi.model.UserStatus;
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
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;
    
    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId("user-id-test");
        user.setRole(Role.USER);
        user.setStatus(UserStatus.ACTIVE);
    }

    @Test
    void testToggleLockUser_Valid_User1() {
        when(userRepository.findById("1")).thenReturn(Optional.of(user));
        String res = userService.toggleLockUser("1");
        assertEquals("User status updated to LOCKED", res);
        user.setStatus(UserStatus.ACTIVE); // reset
    }

    @Test
    void testToggleLockUser_Valid_User2() {
        when(userRepository.findById("2")).thenReturn(Optional.of(user));
        String res = userService.toggleLockUser("2");
        assertEquals("User status updated to LOCKED", res);
        user.setStatus(UserStatus.ACTIVE); // reset
    }

    @Test
    void testToggleLockUser_Valid_User3() {
        when(userRepository.findById("3")).thenReturn(Optional.of(user));
        String res = userService.toggleLockUser("3");
        assertEquals("User status updated to LOCKED", res);
        user.setStatus(UserStatus.ACTIVE); // reset
    }

    @Test
    void testToggleLockUser_Valid_User4() {
        when(userRepository.findById("4")).thenReturn(Optional.of(user));
        String res = userService.toggleLockUser("4");
        assertEquals("User status updated to LOCKED", res);
        user.setStatus(UserStatus.ACTIVE); // reset
    }

    @Test
    void testToggleLockUser_Valid_User5() {
        when(userRepository.findById("5")).thenReturn(Optional.of(user));
        String res = userService.toggleLockUser("5");
        assertEquals("User status updated to LOCKED", res);
        user.setStatus(UserStatus.ACTIVE); // reset
    }

    @Test
    void testToggleLockUser_Valid_User6() {
        when(userRepository.findById("6")).thenReturn(Optional.of(user));
        String res = userService.toggleLockUser("6");
        assertEquals("User status updated to LOCKED", res);
        user.setStatus(UserStatus.ACTIVE); // reset
    }

    @Test
    void testToggleLockUser_Valid_User7() {
        when(userRepository.findById("7")).thenReturn(Optional.of(user));
        String res = userService.toggleLockUser("7");
        assertEquals("User status updated to LOCKED", res);
        user.setStatus(UserStatus.ACTIVE); // reset
    }

    @Test
    void testToggleLockUser_Valid_User8() {
        when(userRepository.findById("8")).thenReturn(Optional.of(user));
        String res = userService.toggleLockUser("8");
        assertEquals("User status updated to LOCKED", res);
        user.setStatus(UserStatus.ACTIVE); // reset
    }

    @Test
    void testToggleLockUser_Valid_User9() {
        when(userRepository.findById("9")).thenReturn(Optional.of(user));
        String res = userService.toggleLockUser("9");
        assertEquals("User status updated to LOCKED", res);
        user.setStatus(UserStatus.ACTIVE); // reset
    }

    @Test
    void testToggleLockUser_Valid_User10() {
        when(userRepository.findById("10")).thenReturn(Optional.of(user));
        String res = userService.toggleLockUser("10");
        assertEquals("User status updated to LOCKED", res);
        user.setStatus(UserStatus.ACTIVE); // reset
    }

    @Test
    void testToggleUserRole_Valid_User1() {
        when(userRepository.findById("1")).thenReturn(Optional.of(user));
        String res = userService.toggleUserRole("1");
        assertEquals("User role updated to MOD", res);
        user.setRole(Role.USER); // reset
    }

    @Test
    void testToggleUserRole_Valid_User2() {
        when(userRepository.findById("2")).thenReturn(Optional.of(user));
        String res = userService.toggleUserRole("2");
        assertEquals("User role updated to MOD", res);
        user.setRole(Role.USER); // reset
    }

    @Test
    void testToggleUserRole_Valid_User3() {
        when(userRepository.findById("3")).thenReturn(Optional.of(user));
        String res = userService.toggleUserRole("3");
        assertEquals("User role updated to MOD", res);
        user.setRole(Role.USER); // reset
    }

    @Test
    void testToggleUserRole_Valid_User4() {
        when(userRepository.findById("4")).thenReturn(Optional.of(user));
        String res = userService.toggleUserRole("4");
        assertEquals("User role updated to MOD", res);
        user.setRole(Role.USER); // reset
    }

    @Test
    void testToggleUserRole_Valid_User5() {
        when(userRepository.findById("5")).thenReturn(Optional.of(user));
        String res = userService.toggleUserRole("5");
        assertEquals("User role updated to MOD", res);
        user.setRole(Role.USER); // reset
    }

    @Test
    void testToggleUserRole_Valid_User6() {
        when(userRepository.findById("6")).thenReturn(Optional.of(user));
        String res = userService.toggleUserRole("6");
        assertEquals("User role updated to MOD", res);
        user.setRole(Role.USER); // reset
    }

    @Test
    void testToggleUserRole_Valid_User7() {
        when(userRepository.findById("7")).thenReturn(Optional.of(user));
        String res = userService.toggleUserRole("7");
        assertEquals("User role updated to MOD", res);
        user.setRole(Role.USER); // reset
    }

    @Test
    void testToggleUserRole_Valid_User8() {
        when(userRepository.findById("8")).thenReturn(Optional.of(user));
        String res = userService.toggleUserRole("8");
        assertEquals("User role updated to MOD", res);
        user.setRole(Role.USER); // reset
    }

    @Test
    void testToggleUserRole_Valid_User9() {
        when(userRepository.findById("9")).thenReturn(Optional.of(user));
        String res = userService.toggleUserRole("9");
        assertEquals("User role updated to MOD", res);
        user.setRole(Role.USER); // reset
    }

    @Test
    void testToggleUserRole_Valid_User10() {
        when(userRepository.findById("10")).thenReturn(Optional.of(user));
        String res = userService.toggleUserRole("10");
        assertEquals("User role updated to MOD", res);
        user.setRole(Role.USER); // reset
    }
}
