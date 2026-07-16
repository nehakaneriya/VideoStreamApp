package com.neha.VideoStreamApp.services;

import com.neha.VideoStreamApp.dtos.AdminDashboardDto;
import com.neha.VideoStreamApp.dtos.UserDto;
import com.neha.VideoStreamApp.dtos.VideoDto;

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
}
