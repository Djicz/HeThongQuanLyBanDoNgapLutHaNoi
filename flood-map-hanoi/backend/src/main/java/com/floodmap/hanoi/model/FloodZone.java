package com.floodmap.hanoi.model;

import jakarta.persistence.*;
import lombok.*;
import org.locationtech.jts.geom.Point;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.util.Date;

@Entity
@Table(name = "flood_zones")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FloodZone {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(columnDefinition = "geometry(Point,4326)")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Point centerPoint;
    
    private String district;
    
    private double radius;
    
    private String level; // LOW, MEDIUM, HIGH
    
    private String description;
    
    private String status; // ACTIVE, RESOLVED
    
    private int floodCount;
    
    @CreationTimestamp
    private Date createdAt;
    
    @UpdateTimestamp
    private Date updatedAt;
}
