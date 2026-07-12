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
import com.floodmap.hanoi.repository.FloodReportRepository;
import com.floodmap.hanoi.repository.SystemConfigRepository;
import com.floodmap.hanoi.model.FloodReport;
import com.floodmap.hanoi.model.SystemConfig;
import java.util.List;

@Service
public class ExternalApiService {

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private FloodReportRepository floodReportRepository;

    @Autowired
    private SystemConfigRepository systemConfigRepository;

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371000;
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                        * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }


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
            String encodedQuery = java.net.URLEncoder.encode(query, java.nio.charset.StandardCharsets.UTF_8.toString());
            String url = "https://nominatim.openstreetmap.org/search?format=json&q=" + encodedQuery + "&limit=5";
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, getEntityWithUserAgent(), String.class);
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response.getBody());
            ArrayNode resultArray = mapper.createArrayNode();
            
            if (root.isArray()) {
                for (JsonNode node : root) {
                    ObjectNode obj = mapper.createObjectNode();
                    obj.put("lat", node.path("lat").asText());
                    obj.put("lon", node.path("lon").asText());
                    obj.put("display_name", node.path("display_name").asText());
                    resultArray.add(obj);
                }
            }
            return resultArray.toString();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return "[]";
    }

    public String countFloodedAreas(double startLng, double startLat, double endLng, double endLat, String vehicleType) {
        String profile = "driving";
        if ("foot".equalsIgnoreCase(vehicleType) || "walking".equalsIgnoreCase(vehicleType)) {
            profile = "foot";
        }
        String url = String.format("http://router.project-osrm.org/route/v1/%s/%s,%s;%s,%s?overview=full&geometries=geojson&alternatives=3&steps=true", 
                profile, startLng, startLat, endLng, endLat);
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, getEntityWithUserAgent(), String.class);
        
        String responseBody = response.getBody();
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(responseBody);
            
            double alertRadius = 500.0;
            List<SystemConfig> configs = systemConfigRepository.findAll();
            if (!configs.isEmpty()) {
                alertRadius = configs.get(0).getAlertRadius();
            }
            
            List<FloodReport> verifiedReports = floodReportRepository.findAll().stream()
                .filter(r -> "VERIFIED".equals(r.getStatus()))
                .toList();

            JsonNode routesNode = root.path("routes");
            if (routesNode.isArray() && routesNode.size() > 0) {
                int minFlooded = Integer.MAX_VALUE;
                JsonNode bestRoute = routesNode.get(0);
                
                for (JsonNode route : routesNode) {
                    JsonNode coordinates = route.path("geometry").path("coordinates");
                    int floodedCount = 0;
                    
                    if (coordinates.isArray()) {
                        for (FloodReport report : verifiedReports) {
                            if (report.getLocation() == null) continue;
                            double rLat = report.getLocation().getY();
                            double rLng = report.getLocation().getX();
                            
                            boolean isFlooded = false;
                            for (JsonNode coord : coordinates) {
                                double pLng = coord.get(0).asDouble();
                                double pLat = coord.get(1).asDouble();
                                double dist = calculateDistance(pLat, pLng, rLat, rLng);
                                if (dist <= alertRadius) {
                                    isFlooded = true;
                                    break;
                                }
                            }
                            if (isFlooded) {
                                floodedCount++;
                            }
                        }
                    }
                    
                    if (floodedCount < minFlooded) {
                        minFlooded = floodedCount;
                        bestRoute = route;
                    }
                    if (minFlooded == 0) break; // Optimal found
                }
                
                // Construct new response
                ObjectNode newResponse = mapper.createObjectNode();
                newResponse.set("code", root.get("code"));
                newResponse.set("waypoints", root.get("waypoints"));
                
                ArrayNode newRoutes = mapper.createArrayNode();
                newRoutes.add(bestRoute);
                newResponse.set("routes", newRoutes);
                
                newResponse.put("floodedAreasCount", minFlooded);
                
                return newResponse.toString();
            }
            
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return responseBody;
    }
}
