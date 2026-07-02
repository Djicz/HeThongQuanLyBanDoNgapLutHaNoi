package com.floodmap.hanoi.repository;

import com.floodmap.hanoi.model.IpVisitLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IpVisitLogRepository extends JpaRepository<IpVisitLog, String> {
}
