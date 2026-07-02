package com.floodmap.hanoi.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.util.Date;

@Entity
@Table(name = "system_notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemNotification {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    private String title;
    
    private String message;
    
    private String type; // GENERAL, PERSONAL
    
    private String status; // ACTIVE, RESOLVED
    
    @CreationTimestamp
    private Date createdAt;
    
    @UpdateTimestamp
    private Date updatedAt;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
