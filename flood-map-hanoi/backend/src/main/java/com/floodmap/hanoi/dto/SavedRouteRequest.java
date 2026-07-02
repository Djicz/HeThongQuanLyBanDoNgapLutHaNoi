package com.floodmap.hanoi.dto;

import lombok.Data;

@Data
public class SavedRouteRequest {
    private String name;
    private String startPointJson;
    private String endPointJson;
}
