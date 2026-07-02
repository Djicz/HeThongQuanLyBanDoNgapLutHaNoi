package com.floodmap.hanoi.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "proofs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Proof {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    private String fileUrl;
    
    private String type; // IMAGE, VIDEO
    
    @ManyToOne
    @JoinColumn(name = "flood_report_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private FloodReport floodReport;
}
