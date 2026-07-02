package com.floodmap.hanoi.service;

import com.floodmap.hanoi.dto.SavedRouteRequest;
import com.floodmap.hanoi.model.SavedRoute;
import com.floodmap.hanoi.model.User;
import com.floodmap.hanoi.repository.SavedRouteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SavedRouteService {

    @Autowired
    private SavedRouteRepository savedRouteRepository;

    @Autowired
    private UserService userService;

    private User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            String email = ((UserDetails) principal).getUsername();
            return userService.getUserByEmail(email).orElse(null);
        }
        return null;
    }

    public List<SavedRoute> getSavedRoutes() {
        User user = getCurrentUser();
        if (user == null) return null;
        
        return savedRouteRepository.findByUserId(user.getId());
    }

    public boolean saveRoute(SavedRouteRequest request) {
        User user = getCurrentUser();
        if (user == null) return false;
        
        SavedRoute route = SavedRoute.builder()
                .user(user)
                .name(request.getName())
                .startPointJson(request.getStartPointJson())
                .endPointJson(request.getEndPointJson())
                .build();
                
        savedRouteRepository.save(route);
        return true;
    }

    public String deleteRoute(String id) {
        User user = getCurrentUser();
        if (user == null) return "Unauthorized";
        
        Optional<SavedRoute> routeOpt = savedRouteRepository.findById(id);
        if (routeOpt.isPresent()) {
            SavedRoute route = routeOpt.get();
            if (!route.getUser().getId().equals(user.getId())) {
                return "Forbidden";
            }
            savedRouteRepository.delete(route);
            return "Đã xóa lộ trình";
        }
        return "Không tìm thấy lộ trình";
    }
}
