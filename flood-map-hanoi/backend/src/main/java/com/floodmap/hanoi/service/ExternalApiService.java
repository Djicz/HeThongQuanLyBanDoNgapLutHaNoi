package com.floodmap.hanoi.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
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
        try {
            String url = String.format("https://nominatim.openstreetmap.org/reverse?format=json&lat=%s&lon=%s", lat, lng);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, getEntityWithUserAgent(), String.class);
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response.getBody());
            
            if (root.has("display_name")) {
                ObjectNode result = mapper.createObjectNode();
                result.put("display_name", root.get("display_name").asText());
                return result.toString();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return "{}";
    }

    public String searchGeocode(String query) {
        try {
            String url = String.format("https://nominatim.openstreetmap.org/search?format=json&q=%s&limit=1", query);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, getEntityWithUserAgent(), String.class);
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response.getBody());
            ArrayNode resultArray = mapper.createArrayNode();
            
            if (root.isArray() && root.size() > 0) {
                JsonNode first = root.get(0);
                ObjectNode obj = mapper.createObjectNode();
                obj.put("lat", first.path("lat").asText());
                obj.put("lon", first.path("lon").asText());
                resultArray.add(obj);
            }
            return resultArray.toString();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return "[]";
    }

    public String getRoute(double startLng, double startLat, double endLng, double endLat, String vehicleType) {
        String profile = "driving";
        if ("foot".equalsIgnoreCase(vehicleType) || "walking".equalsIgnoreCase(vehicleType)) {
            profile = "foot";
        }
        String url = String.format("http://router.project-osrm.org/route/v1/%s/%s,%s;%s,%s?overview=full&geometries=geojson&alternatives=3&steps=true", 
                profile, startLng, startLat, endLng, endLat);
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, getEntityWithUserAgent(), String.class);
        return response.getBody();
    }
}
