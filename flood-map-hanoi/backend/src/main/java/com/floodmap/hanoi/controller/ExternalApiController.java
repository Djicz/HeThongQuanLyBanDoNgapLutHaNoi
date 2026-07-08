package com.floodmap.hanoi.controller;

import com.floodmap.hanoi.service.ExternalApiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/public/external")
public class ExternalApiController {

    @Autowired
    private ExternalApiService externalApiService;

    @GetMapping(value = "/nominatim/reverse", produces = "application/json;charset=UTF-8")
    public ResponseEntity<String> reverseGeocode(@RequestParam double lat, @RequestParam double lng) {
        try {
            String result = externalApiService.reverseGeocode(lat, lng);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("{\"error\": \"Failed to fetch address\"}");
        }
    }

    @GetMapping("/nominatim/search")
    public ResponseEntity<String> searchGeocode(@RequestParam String q) {
        String result = externalApiService.searchGeocode(q);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/osrm/route")
    public ResponseEntity<String> getRoute(
            @RequestParam double startLng, 
            @RequestParam double startLat, 
            @RequestParam double endLng, 
            @RequestParam double endLat,
            @RequestParam(defaultValue = "driving") String vehicleType) {
        String result = externalApiService.getRoute(startLng, startLat, endLng, endLat, vehicleType);
        return ResponseEntity.ok(result);
    }
}
