package com.floodmap.hanoi.controller;

import com.floodmap.hanoi.dto.MessageResponse;
import com.floodmap.hanoi.dto.SavedRouteRequest;
import com.floodmap.hanoi.model.SavedRoute;
import com.floodmap.hanoi.service.SavedRouteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user/routes")
@CrossOrigin(origins = "*")
public class SavedRouteController {

    @Autowired
    private SavedRouteService savedRouteService;

    @GetMapping
    public ResponseEntity<?> getSavedRoutes() {
        List<SavedRoute> routes = savedRouteService.getSavedRoutes();
        if (routes == null) return ResponseEntity.status(401).body(new MessageResponse("Unauthorized"));
        return ResponseEntity.ok(routes);
    }

    @PostMapping
    public ResponseEntity<?> saveRoute(@RequestBody SavedRouteRequest request) {
        boolean success = savedRouteService.saveRoute(request);
        if (!success) return ResponseEntity.status(401).body(new MessageResponse("Unauthorized"));
        return ResponseEntity.ok(new MessageResponse("Lưu lộ trình thành công"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRoute(@PathVariable String id) {
        String result = savedRouteService.deleteRoute(id);
        if (result.equals("Unauthorized")) return ResponseEntity.status(401).body(new MessageResponse("Unauthorized"));
        if (result.equals("Forbidden")) return ResponseEntity.status(403).body(new MessageResponse("Forbidden"));
        if (result.equals("Đã xóa lộ trình")) return ResponseEntity.ok(new MessageResponse(result));
        return ResponseEntity.badRequest().body(new MessageResponse(result));
    }
}
