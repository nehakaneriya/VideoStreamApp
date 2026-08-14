package com.neha.VideoStreamApp.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class VideoDto {

    private String videoId;
    private String title;
    private String description;
    private String contentType;
    private String category;
    private String filePath;

    // views
    private long viewCount;

    private Instant createdAt;
    private Instant updatedAt;

    // uploader details
    private String userId;
    private String userName;
    private String userEmail;

    // admin panel ke liye — is video pe kitne comments hain
    private Long commentCount;
}
