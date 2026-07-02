package com.floodmap.hanoi.controller;

import com.floodmap.hanoi.dto.MessageResponse;
import com.floodmap.hanoi.model.SavedRoute;
import com.floodmap.hanoi.model.User;
import com.floodmap.hanoi.repository.SavedRouteRepository;
import com.floodmap.hanoi.repository.UserRepository;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/user/routes")
@CrossOrigin(origins = "*")
public class SavedRouteController {

    @Autowired
    private SavedRouteRepository savedRouteRepository;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            String email = ((UserDetails) principal).getUsername();
            return userRepository.findByEmail(email).orElse(null);
        }
        return null;
    }

    @GetMapping
    public ResponseEntity<?> getSavedRoutes() {
        User user = getCurrentUser();
        if (user == null) return ResponseEntity.status(401).body(new MessageResponse("Unauthorized"));
        
        List<SavedRoute> routes = savedRouteRepository.findByUserId(user.getId());
        return ResponseEntity.ok(routes);
    }

    @PostMapping
    public ResponseEntity<?> saveRoute(@RequestBody SavedRouteRequest request) {
        User user = getCurrentUser();
        if (user == null) return ResponseEntity.status(401).body(new MessageResponse("Unauthorized"));
        
        SavedRoute route = SavedRoute.builder()
                .user(user)
                .name(request.getName())
                .startPointJson(request.getStartPointJson())
                .endPointJson(request.getEndPointJson())
                .build();
                
        savedRouteRepository.save(route);
        return ResponseEntity.ok(new MessageResponse("Lưu lộ trình thành công"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRoute(@PathVariable String id) {
        User user = getCurrentUser();
        if (user == null) return ResponseEntity.status(401).body(new MessageResponse("Unauthorized"));
        
        Optional<SavedRoute> routeOpt = savedRouteRepository.findById(id);
        if (routeOpt.isPresent()) {
            SavedRoute route = routeOpt.get();
            if (!route.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).body(new MessageResponse("Forbidden"));
            }
            savedRouteRepository.delete(route);
            return ResponseEntity.ok(new MessageResponse("Đã xóa lộ trình"));
        }
        return ResponseEntity.badRequest().body(new MessageResponse("Không tìm thấy lộ trình"));
    }
}

@Data
class SavedRouteRequest {
    private String name;
    private String startPointJson;
    private String endPointJson;
}
