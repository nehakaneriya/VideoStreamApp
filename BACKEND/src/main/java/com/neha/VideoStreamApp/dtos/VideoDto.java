package com.neha.VideoStreamApp.dtos;

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
    private String filePath;
    private Instant createdAt;

    // uploader details
    private String userId;
    private String userName;
    private String userEmail;
}
