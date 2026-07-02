package com.floodmap.hanoi.dto;

import lombok.Data;
import java.util.Date;

@Data
public class FloodHistoryDTO {
    private String id;
    private String description;
    private String level;
    private int floodCount;
    private String status;
    private Date lastUpdate;
    private Double lat;
    private Double lng;
}
