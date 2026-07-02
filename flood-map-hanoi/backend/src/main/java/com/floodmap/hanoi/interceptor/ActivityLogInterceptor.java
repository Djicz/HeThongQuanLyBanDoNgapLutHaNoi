package com.floodmap.hanoi.interceptor;

import com.floodmap.hanoi.model.ActivityLog;
import com.floodmap.hanoi.model.User;
import com.floodmap.hanoi.repository.ActivityLogRepository;
import com.floodmap.hanoi.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Optional;

@Component
public class ActivityLogInterceptor implements HandlerInterceptor {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private UserRepository userRepository;

    private String translateAction(String method, String uri) {
        if (uri.matches("^/api/flood-reports/?$") && "POST".equalsIgnoreCase(method)) return "Gửi báo cáo";
        if (uri.matches("^/api/flood-reports/.+$") && "PUT".equalsIgnoreCase(method)) return "Cập nhật báo cáo";
        if (uri.matches("^/api/flood-reports/.+$") && "DELETE".equalsIgnoreCase(method)) return "Xóa báo cáo";
        if (uri.matches("^/api/user/reports/.+$") && "DELETE".equalsIgnoreCase(method)) return "Xóa báo cáo";
        if (uri.matches("^/api/votes/.+$") && "POST".equalsIgnoreCase(method)) return "Vote báo cáo";
        if (uri.startsWith("/api/admin/notifications")) {
            if ("POST".equalsIgnoreCase(method)) return "Tạo thông báo";
            if ("PUT".equalsIgnoreCase(method)) return "Sửa thông báo";
            if ("DELETE".equalsIgnoreCase(method)) return "Xóa thông báo";
        }
        if (uri.matches("^/api/mod/reports/.+$") && "PUT".equalsIgnoreCase(method)) return "Duyệt báo cáo";
        if (uri.matches("^/api/mod/zones/?$") && "POST".equalsIgnoreCase(method)) return "Thêm vùng ngập";
        if (uri.matches("^/api/mod/zones/.+$") && "PUT".equalsIgnoreCase(method)) return "Sửa vùng ngập";
        if (uri.matches("^/api/mod/zones/.+$") && "DELETE".equalsIgnoreCase(method)) return "Xóa vùng ngập";
        if (uri.matches("^/api/admin/users/.+$") && "PUT".equalsIgnoreCase(method)) return "Phân quyền người dùng";
        if (uri.matches("^/api/admin/config/?$") && "PUT".equalsIgnoreCase(method)) return "Sửa cấu hình hệ thống";
        return method;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        String method = request.getMethod();
        // Skip GET and OPTIONS requests
        if ("GET".equalsIgnoreCase(method) || "OPTIONS".equalsIgnoreCase(method)) {
            return;
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && !authentication.getName().equals("anonymousUser")) {
            String username = authentication.getName(); // this is actually email in this app
            Optional<User> userOpt = userRepository.findByEmail(username);
            if (userOpt.isPresent()) {
                ActivityLog log = new ActivityLog();
                log.setAction(translateAction(method, request.getRequestURI()));
                log.setDescription(request.getRequestURI());
                log.setUser(userOpt.get());
                activityLogRepository.save(log);
            }
        }
    }
}
