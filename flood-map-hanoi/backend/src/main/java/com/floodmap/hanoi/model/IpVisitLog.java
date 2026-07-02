package com.floodmap.hanoi.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity
@Table(name = "ip_visit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class IpVisitLog {
    @Id
    private String ip;
    private Date lastVisit;
}
