package com.floodmap.hanoi.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class ExternalApiService {

    @Autowired
    private RestTemplate restTemplate;

    private HttpEntity<String> getEntityWithUserAgent() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("User-Agent", "FloodMapHanoi/1.0 (support@floodmaphanoi.com)");
        return new HttpEntity<>(headers);
    }

    public String reverseGeocode(double lat, double lng) {
        String url = String.format("https://nominatim.openstreetmap.org/reverse?format=json&lat=%s&lon=%s&zoom=18&addressdetails=1", lat, lng);
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, getEntityWithUserAgent(), String.class);
        return response.getBody();
    }

    public String searchGeocode(String query) {
        String url = String.format("https://nominatim.openstreetmap.org/search?format=json&q=%s&limit=1", query);
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, getEntityWithUserAgent(), String.class);
        return response.getBody();
    }

    public String getRoute(double startLng, double startLat, double endLng, double endLat) {
        String url = String.format("http://router.project-osrm.org/route/v1/driving/%s,%s;%s,%s?overview=full&geometries=geojson&alternatives=3", 
                startLng, startLat, endLng, endLat);
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, getEntityWithUserAgent(), String.class);
        return response.getBody();
    }
}
