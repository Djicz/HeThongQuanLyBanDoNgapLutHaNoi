package com.floodmap.hanoi.service;

import com.floodmap.hanoi.model.User;
import com.floodmap.hanoi.model.UserStatus;
import com.floodmap.hanoi.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;
    
    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setReputationPoint(10);
    }

    @Test
    void testAddReputationPoint_Valid_User1() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        userService.addReputationPoint(1L, 5);
        assertEquals(15, user.getReputationPoint());
    }

    @Test
    void testAddReputationPoint_Valid_User2() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(user));
        userService.addReputationPoint(2L, 5);
        assertEquals(15, user.getReputationPoint());
    }

    @Test
    void testAddReputationPoint_Valid_User3() {
        when(userRepository.findById(3L)).thenReturn(Optional.of(user));
        userService.addReputationPoint(3L, 5);
        assertEquals(15, user.getReputationPoint());
    }

    @Test
    void testAddReputationPoint_Valid_User4() {
        when(userRepository.findById(4L)).thenReturn(Optional.of(user));
        userService.addReputationPoint(4L, 5);
        assertEquals(15, user.getReputationPoint());
    }

    @Test
    void testAddReputationPoint_Valid_User5() {
        when(userRepository.findById(5L)).thenReturn(Optional.of(user));
        userService.addReputationPoint(5L, 5);
        assertEquals(15, user.getReputationPoint());
    }

    @Test
    void testAddReputationPoint_Valid_User6() {
        when(userRepository.findById(6L)).thenReturn(Optional.of(user));
        userService.addReputationPoint(6L, 5);
        assertEquals(15, user.getReputationPoint());
    }

    @Test
    void testAddReputationPoint_Valid_User7() {
        when(userRepository.findById(7L)).thenReturn(Optional.of(user));
        userService.addReputationPoint(7L, 5);
        assertEquals(15, user.getReputationPoint());
    }

    @Test
    void testAddReputationPoint_Valid_User8() {
        when(userRepository.findById(8L)).thenReturn(Optional.of(user));
        userService.addReputationPoint(8L, 5);
        assertEquals(15, user.getReputationPoint());
    }

    @Test
    void testAddReputationPoint_Valid_User9() {
        when(userRepository.findById(9L)).thenReturn(Optional.of(user));
        userService.addReputationPoint(9L, 5);
        assertEquals(15, user.getReputationPoint());
    }

    @Test
    void testAddReputationPoint_Valid_User10() {
        when(userRepository.findById(10L)).thenReturn(Optional.of(user));
        userService.addReputationPoint(10L, 5);
        assertEquals(15, user.getReputationPoint());
    }

    @Test
    void testUpdateStatus_Valid_User1() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        userService.updateUserStatus(1L, UserStatus.LOCKED);
        assertEquals(UserStatus.LOCKED, user.getStatus());
    }

    @Test
    void testUpdateStatus_Valid_User2() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(user));
        userService.updateUserStatus(2L, UserStatus.LOCKED);
        assertEquals(UserStatus.LOCKED, user.getStatus());
    }

    @Test
    void testUpdateStatus_Valid_User3() {
        when(userRepository.findById(3L)).thenReturn(Optional.of(user));
        userService.updateUserStatus(3L, UserStatus.LOCKED);
        assertEquals(UserStatus.LOCKED, user.getStatus());
    }

    @Test
    void testUpdateStatus_Valid_User4() {
        when(userRepository.findById(4L)).thenReturn(Optional.of(user));
        userService.updateUserStatus(4L, UserStatus.LOCKED);
        assertEquals(UserStatus.LOCKED, user.getStatus());
    }

    @Test
    void testUpdateStatus_Valid_User5() {
        when(userRepository.findById(5L)).thenReturn(Optional.of(user));
        userService.updateUserStatus(5L, UserStatus.LOCKED);
        assertEquals(UserStatus.LOCKED, user.getStatus());
    }

    @Test
    void testUpdateStatus_Valid_User6() {
        when(userRepository.findById(6L)).thenReturn(Optional.of(user));
        userService.updateUserStatus(6L, UserStatus.LOCKED);
        assertEquals(UserStatus.LOCKED, user.getStatus());
    }

    @Test
    void testUpdateStatus_Valid_User7() {
        when(userRepository.findById(7L)).thenReturn(Optional.of(user));
        userService.updateUserStatus(7L, UserStatus.LOCKED);
        assertEquals(UserStatus.LOCKED, user.getStatus());
    }

    @Test
    void testUpdateStatus_Valid_User8() {
        when(userRepository.findById(8L)).thenReturn(Optional.of(user));
        userService.updateUserStatus(8L, UserStatus.LOCKED);
        assertEquals(UserStatus.LOCKED, user.getStatus());
    }

    @Test
    void testUpdateStatus_Valid_User9() {
        when(userRepository.findById(9L)).thenReturn(Optional.of(user));
        userService.updateUserStatus(9L, UserStatus.LOCKED);
        assertEquals(UserStatus.LOCKED, user.getStatus());
    }

    @Test
    void testUpdateStatus_Valid_User10() {
        when(userRepository.findById(10L)).thenReturn(Optional.of(user));
        userService.updateUserStatus(10L, UserStatus.LOCKED);
        assertEquals(UserStatus.LOCKED, user.getStatus());
    }
}
