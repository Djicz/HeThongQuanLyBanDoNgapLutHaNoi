package com.floodmap.hanoi.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.util.Date;

@Entity
@Table(name = "activity_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityLog {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    private String action;
    
    private String description;
    
    @CreationTimestamp
    private Date createdAt;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
