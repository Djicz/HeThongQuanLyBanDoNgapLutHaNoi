package com.floodmap.hanoi.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.util.Date;

@Entity
@Table(name = "report_votes", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "report_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportVote {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "report_id", nullable = false)
    private FloodReport report;
    
    @Column(nullable = false)
    private boolean isUpvote;
    
    @CreationTimestamp
    private Date createdAt;
    
    @UpdateTimestamp
    private Date updatedAt;
}
