package com.neha.VideoStreamApp.dtos.response;

import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeedbackDto {

    private String id;
    private String message;
    private Instant createdAt;

    // User details for display purposes (optional)
    private String userId;
    private String userName;
    private String userEmail;
}
