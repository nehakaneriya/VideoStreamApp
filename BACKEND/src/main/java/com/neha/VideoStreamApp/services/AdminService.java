package com.neha.VideoStreamApp.services;

import com.neha.VideoStreamApp.dtos.response.AdminDashboardDto;
import com.neha.VideoStreamApp.dtos.common.UserDto;
import com.neha.VideoStreamApp.dtos.response.CategoryStatsDto;
import com.neha.VideoStreamApp.dtos.response.VideoDto;

import java.util.List;
import java.util.UUID;

public interface AdminService {
    AdminDashboardDto getDashboardStats();
    List<UserDto> getAllUsers();
    UserDto getUserById(UUID userId);
    void deleteUser(UUID userId);
    void deleteVideo(String videoId);
    List<VideoDto> getAllVideos();
    void assignAdminRole(UUID userId);

    // Admin role hatao — user wapas normal USER ban jayega
    void removeAdminRole(UUID userId);

    // Admin: har category me kitne videos hain
    List<CategoryStatsDto> getCategoryStats();
}
