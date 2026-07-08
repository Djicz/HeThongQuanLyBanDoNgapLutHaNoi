package com.floodmap.hanoi.dto;

import lombok.Data;

@Data
public class FloodReportDTO {
    private String id;
    private double lat;
    private double lng;
    private String level;
    private String description;
    private String status;
    private String userId;
    private int upvotes;
    private int downvotes;
    private String proofImage;
}
