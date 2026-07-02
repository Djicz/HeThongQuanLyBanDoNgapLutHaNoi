package com.floodmap.hanoi.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.util.Date;

@Entity
@Table(name = "saved_routes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavedRoute {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    private String name;
    
    // Lưu tọa độ dưới dạng JSON text hoặc lưu điểm xuất phát / điểm đến đơn giản
    @Column(columnDefinition = "TEXT")
    private String startPointJson;
    
    @Column(columnDefinition = "TEXT")
    private String endPointJson;
    
    @CreationTimestamp
    private Date createdAt;
}
