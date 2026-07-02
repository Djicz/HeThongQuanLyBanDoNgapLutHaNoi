package com.floodmap.hanoi.dto;

public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private String id;
    private String email;
    private String role;
    private String fullName;
    private String status;
    private int reputationPoint;

    public JwtResponse(String accessToken, String id, String email, String role, String fullName, String status, int reputationPoint) {
        this.token = accessToken;
        this.id = id;
        this.email = email;
        this.role = role;
        this.fullName = fullName;
        this.status = status;
        this.reputationPoint = reputationPoint;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public int getReputationPoint() { return reputationPoint; }
    public void setReputationPoint(int reputationPoint) { this.reputationPoint = reputationPoint; }
}
