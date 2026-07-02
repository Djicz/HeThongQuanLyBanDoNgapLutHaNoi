package com.floodmap.hanoi.controller;

import com.floodmap.hanoi.dto.MessageResponse;
import com.floodmap.hanoi.model.FloodZone;
import com.floodmap.hanoi.service.FloodZoneService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/mod/zones")
@PreAuthorize("hasRole('MOD') or hasRole('ADMIN')")
public class ModFloodZoneController {

    @Autowired
    private FloodZoneService floodZoneService;

    @GetMapping
    public ResponseEntity<List<FloodZone>> getAllZones() {
        return ResponseEntity.ok(floodZoneService.getAllZones());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateZone(@PathVariable String id, @RequestBody FloodZone zoneDetails) {
        if (floodZoneService.updateZone(id, zoneDetails)) {
            return ResponseEntity.ok(new MessageResponse("Cập nhật điểm ngập thành công"));
        }
        return ResponseEntity.badRequest().body(new MessageResponse("Không tìm thấy điểm ngập"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteZone(@PathVariable String id) {
        if (floodZoneService.deleteZone(id)) {
            return ResponseEntity.ok(new MessageResponse("Đã xóa điểm ngập thành công"));
        }
        return ResponseEntity.badRequest().body(new MessageResponse("Không tìm thấy điểm ngập"));
    }
}
