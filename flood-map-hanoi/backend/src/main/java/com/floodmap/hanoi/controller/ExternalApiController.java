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

    @GetMapping("/nominatim/reverse")
    public ResponseEntity<String> reverseGeocode(@RequestParam double lat, @RequestParam double lng) {
        String result = externalApiService.reverseGeocode(lat, lng);
        return ResponseEntity.ok(result);
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
            @RequestParam double endLat) {
        String result = externalApiService.getRoute(startLng, startLat, endLng, endLat);
        return ResponseEntity.ok(result);
    }
}
