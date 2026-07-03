package com.floodmap.hanoi.model;

import jakarta.persistence.*;
import lombok.*;
import org.locationtech.jts.geom.Point;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "flood_reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FloodReport {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(columnDefinition = "geometry(Point,4326)")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Point location;
    
    private String district;
    
    private String level; // LOW, MEDIUM, HIGH
    
    private String description;
    
    private String status; // PENDING, VERIFIED, REJECTED, EXPIRED, DELETED
    
    private int evaluated; // 0 -> 100
    
    @Column(columnDefinition = "integer default 0")
    private int upvotes;
    
    @Column(columnDefinition = "integer default 0")
    private int downvotes;
    
    @CreationTimestamp
    private Date createdAt;
    
    @UpdateTimestamp
    private Date updatedAt;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    @OneToMany(mappedBy = "floodReport", cascade = CascadeType.ALL)
    private List<Proof> proofs;
    
    @com.fasterxml.jackson.annotation.JsonProperty("lat")
    public Double getLat() {
        return location != null ? location.getY() : null;
    }
    
    @com.fasterxml.jackson.annotation.JsonProperty("lng")
    public Double getLng() {
        return location != null ? location.getX() : null;
    }
}
