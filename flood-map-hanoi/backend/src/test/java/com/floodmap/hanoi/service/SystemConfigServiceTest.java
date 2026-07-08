package com.floodmap.hanoi.service;

import com.floodmap.hanoi.model.SystemConfig;
import com.floodmap.hanoi.repository.SystemConfigRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Optional;
import java.util.List;
import java.util.Arrays;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class SystemConfigServiceTest {

    @Mock
    private SystemConfigRepository systemConfigRepository;

    @InjectMocks
    private SystemConfigService systemConfigService;
    
    private SystemConfig config;

    @BeforeEach
    void setUp() {
        config = new SystemConfig();
        config.setConfigKey("TEST_KEY");
        config.setConfigValue("TEST_VALUE");
    }

    @Test
    void testGetConfigValue_Scenario1() {
        when(systemConfigRepository.findByConfigKey("KEY_1")).thenReturn(Optional.of(config));
        String result = systemConfigService.getConfigValue("KEY_1");
        assertEquals("TEST_VALUE", result);
    }

    @Test
    void testGetConfigValue_Scenario2() {
        when(systemConfigRepository.findByConfigKey("KEY_2")).thenReturn(Optional.of(config));
        String result = systemConfigService.getConfigValue("KEY_2");
        assertEquals("TEST_VALUE", result);
    }

    @Test
    void testGetConfigValue_Scenario3() {
        when(systemConfigRepository.findByConfigKey("KEY_3")).thenReturn(Optional.of(config));
        String result = systemConfigService.getConfigValue("KEY_3");
        assertEquals("TEST_VALUE", result);
    }

    @Test
    void testGetConfigValue_Scenario4() {
        when(systemConfigRepository.findByConfigKey("KEY_4")).thenReturn(Optional.of(config));
        String result = systemConfigService.getConfigValue("KEY_4");
        assertEquals("TEST_VALUE", result);
    }

    @Test
    void testGetConfigValue_Scenario5() {
        when(systemConfigRepository.findByConfigKey("KEY_5")).thenReturn(Optional.of(config));
        String result = systemConfigService.getConfigValue("KEY_5");
        assertEquals("TEST_VALUE", result);
    }

    @Test
    void testGetConfigValue_Scenario6() {
        when(systemConfigRepository.findByConfigKey("KEY_6")).thenReturn(Optional.of(config));
        String result = systemConfigService.getConfigValue("KEY_6");
        assertEquals("TEST_VALUE", result);
    }

    @Test
    void testGetConfigValue_Scenario7() {
        when(systemConfigRepository.findByConfigKey("KEY_7")).thenReturn(Optional.of(config));
        String result = systemConfigService.getConfigValue("KEY_7");
        assertEquals("TEST_VALUE", result);
    }

    @Test
    void testGetConfigValue_Scenario8() {
        when(systemConfigRepository.findByConfigKey("KEY_8")).thenReturn(Optional.of(config));
        String result = systemConfigService.getConfigValue("KEY_8");
        assertEquals("TEST_VALUE", result);
    }

    @Test
    void testGetConfigValue_Scenario9() {
        when(systemConfigRepository.findByConfigKey("KEY_9")).thenReturn(Optional.of(config));
        String result = systemConfigService.getConfigValue("KEY_9");
        assertEquals("TEST_VALUE", result);
    }

    @Test
    void testGetConfigValue_Scenario10() {
        when(systemConfigRepository.findByConfigKey("KEY_10")).thenReturn(Optional.of(config));
        String result = systemConfigService.getConfigValue("KEY_10");
        assertEquals("TEST_VALUE", result);
    }

    @Test
    void testGetConfigValue_NotFound_Scenario1() {
        when(systemConfigRepository.findByConfigKey("MISSING_KEY_1")).thenReturn(Optional.empty());
        String result = systemConfigService.getConfigValue("MISSING_KEY_1");
        assertNull(result);
    }

    @Test
    void testGetConfigValue_NotFound_Scenario2() {
        when(systemConfigRepository.findByConfigKey("MISSING_KEY_2")).thenReturn(Optional.empty());
        String result = systemConfigService.getConfigValue("MISSING_KEY_2");
        assertNull(result);
    }

    @Test
    void testGetConfigValue_NotFound_Scenario3() {
        when(systemConfigRepository.findByConfigKey("MISSING_KEY_3")).thenReturn(Optional.empty());
        String result = systemConfigService.getConfigValue("MISSING_KEY_3");
        assertNull(result);
    }

    @Test
    void testGetConfigValue_NotFound_Scenario4() {
        when(systemConfigRepository.findByConfigKey("MISSING_KEY_4")).thenReturn(Optional.empty());
        String result = systemConfigService.getConfigValue("MISSING_KEY_4");
        assertNull(result);
    }

    @Test
    void testGetConfigValue_NotFound_Scenario5() {
        when(systemConfigRepository.findByConfigKey("MISSING_KEY_5")).thenReturn(Optional.empty());
        String result = systemConfigService.getConfigValue("MISSING_KEY_5");
        assertNull(result);
    }
}
