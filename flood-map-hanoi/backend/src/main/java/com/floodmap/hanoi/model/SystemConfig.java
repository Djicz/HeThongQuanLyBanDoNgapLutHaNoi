package com.floodmap.hanoi.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;
import java.util.Date;

@Entity
@Table(name = "system_configs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    private double alertRadius;
    
    private int reportExpired; // in hours or minutes
    
    private int autoDeletePercent; // 0 -> 100
    
    @Column(columnDefinition = "bigint default 0")
    private long totalVisits;

    @UpdateTimestamp
    private Date updatedAt;
}
