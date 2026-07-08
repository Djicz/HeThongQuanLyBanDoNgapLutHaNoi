package com.floodmap.hanoi.repository;

import com.floodmap.hanoi.model.ReportVote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReportVoteRepository extends JpaRepository<ReportVote, String> {
    Optional<ReportVote> findByUserIdAndReportId(String userId, String reportId);
    java.util.List<ReportVote> findByReportId(String reportId);
}
