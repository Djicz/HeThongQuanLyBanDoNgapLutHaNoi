package com.floodmap.hanoi.repository;

import com.floodmap.hanoi.model.SavedRoute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SavedRouteRepository extends JpaRepository<SavedRoute, String> {
    List<SavedRoute> findByUserId(String userId);
}
