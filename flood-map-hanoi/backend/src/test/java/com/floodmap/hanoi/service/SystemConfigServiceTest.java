package com.floodmap.hanoi.service;

import com.floodmap.hanoi.model.SystemConfig;
import com.floodmap.hanoi.repository.SystemConfigRepository;
import com.floodmap.hanoi.repository.IpVisitLogRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Optional;
import java.util.List;
import java.util.Collections;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class SystemConfigServiceTest {

    @Mock
    private SystemConfigRepository configRepository;
    
    @Mock
    private IpVisitLogRepository ipVisitLogRepository;

    @InjectMocks
    private SystemConfigService systemConfigService;
    
    private SystemConfig config;

    @BeforeEach
    void setUp() {
        config = new SystemConfig();
        config.setAlertRadius(500.0);
        config.setReportExpired(24);
        config.setAutoDeletePercent(70);
        config.setTotalVisits(0);
    }

    @Test
    void testGetConfig_Scenario1() {
        when(configRepository.findAll()).thenReturn(Collections.singletonList(config));
        SystemConfig result = systemConfigService.getConfig();
        assertEquals(500.0, result.getAlertRadius());
    }

    @Test
    void testGetConfig_Scenario2() {
        when(configRepository.findAll()).thenReturn(Collections.singletonList(config));
        SystemConfig result = systemConfigService.getConfig();
        assertEquals(500.0, result.getAlertRadius());
    }

    @Test
    void testGetConfig_Scenario3() {
        when(configRepository.findAll()).thenReturn(Collections.singletonList(config));
        SystemConfig result = systemConfigService.getConfig();
        assertEquals(500.0, result.getAlertRadius());
    }

    @Test
    void testGetConfig_Scenario4() {
        when(configRepository.findAll()).thenReturn(Collections.singletonList(config));
        SystemConfig result = systemConfigService.getConfig();
        assertEquals(500.0, result.getAlertRadius());
    }

    @Test
    void testGetConfig_Scenario5() {
        when(configRepository.findAll()).thenReturn(Collections.singletonList(config));
        SystemConfig result = systemConfigService.getConfig();
        assertEquals(500.0, result.getAlertRadius());
    }

    @Test
    void testGetConfig_Scenario6() {
        when(configRepository.findAll()).thenReturn(Collections.singletonList(config));
        SystemConfig result = systemConfigService.getConfig();
        assertEquals(500.0, result.getAlertRadius());
    }

    @Test
    void testGetConfig_Scenario7() {
        when(configRepository.findAll()).thenReturn(Collections.singletonList(config));
        SystemConfig result = systemConfigService.getConfig();
        assertEquals(500.0, result.getAlertRadius());
    }

    @Test
    void testGetConfig_Scenario8() {
        when(configRepository.findAll()).thenReturn(Collections.singletonList(config));
        SystemConfig result = systemConfigService.getConfig();
        assertEquals(500.0, result.getAlertRadius());
    }

    @Test
    void testGetConfig_Scenario9() {
        when(configRepository.findAll()).thenReturn(Collections.singletonList(config));
        SystemConfig result = systemConfigService.getConfig();
        assertEquals(500.0, result.getAlertRadius());
    }

    @Test
    void testGetConfig_Scenario10() {
        when(configRepository.findAll()).thenReturn(Collections.singletonList(config));
        SystemConfig result = systemConfigService.getConfig();
        assertEquals(500.0, result.getAlertRadius());
    }

    @Test
    void testGetConfig_Scenario11() {
        when(configRepository.findAll()).thenReturn(Collections.singletonList(config));
        SystemConfig result = systemConfigService.getConfig();
        assertEquals(500.0, result.getAlertRadius());
    }

    @Test
    void testGetConfig_Scenario12() {
        when(configRepository.findAll()).thenReturn(Collections.singletonList(config));
        SystemConfig result = systemConfigService.getConfig();
        assertEquals(500.0, result.getAlertRadius());
    }

    @Test
    void testGetConfig_Scenario13() {
        when(configRepository.findAll()).thenReturn(Collections.singletonList(config));
        SystemConfig result = systemConfigService.getConfig();
        assertEquals(500.0, result.getAlertRadius());
    }

    @Test
    void testGetConfig_Scenario14() {
        when(configRepository.findAll()).thenReturn(Collections.singletonList(config));
        SystemConfig result = systemConfigService.getConfig();
        assertEquals(500.0, result.getAlertRadius());
    }

    @Test
    void testGetConfig_Scenario15() {
        when(configRepository.findAll()).thenReturn(Collections.singletonList(config));
        SystemConfig result = systemConfigService.getConfig();
        assertEquals(500.0, result.getAlertRadius());
    }
}
