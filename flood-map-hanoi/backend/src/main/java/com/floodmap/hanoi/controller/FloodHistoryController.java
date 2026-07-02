package com.floodmap.hanoi.controller;

import com.floodmap.hanoi.dto.FloodHistoryDTO;
import com.floodmap.hanoi.service.FloodReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/history")
@CrossOrigin(origins = "*")
public class FloodHistoryController {

    @Autowired
    private FloodReportService floodReportService;

    @GetMapping
    public List<FloodHistoryDTO> getFloodHistory() {
        return floodReportService.getFloodHistory();
    }
}
