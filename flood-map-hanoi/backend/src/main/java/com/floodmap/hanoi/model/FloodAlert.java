package com.floodmap.hanoi.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.util.Date;

@Entity
@Table(name = "flood_alerts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FloodAlert {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    private String message;
    
    private int recipientCount;
    
    @CreationTimestamp
    private Date sendAt;
    
    @ManyToOne
    @JoinColumn(name = "flood_zone_id")
    private FloodZone floodZone;
}
