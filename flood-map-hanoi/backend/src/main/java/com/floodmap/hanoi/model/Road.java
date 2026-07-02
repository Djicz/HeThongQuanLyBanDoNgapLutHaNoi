package com.floodmap.hanoi.model;

import jakarta.persistence.*;
import lombok.*;
import org.locationtech.jts.geom.LineString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.util.Date;

@Entity
@Table(name = "roads")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Road {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    private String name;
    
    @Column(columnDefinition = "geometry(LineString,4326)")
    private LineString line;
    
    private int floodCount;
    
    private int safeScore; // 0 -> 10
    
    private String status; // ACTIVE, RESOLVED
    
    @CreationTimestamp
    private Date createdAt;
    
    @UpdateTimestamp
    private Date updatedAt;
}
