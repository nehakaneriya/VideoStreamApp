package com.neha.VideoStreamApp.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.Instant;

@Entity
@Table(name="yt_video",
        indexes = {
                @Index(name = "idx_video_title", columnList = "title"),
                @Index(name = "idx_video_user", columnList = "user_id"),
                @Index(name = "idx_video_created", columnList = "createdAt"),
                @Index(name = "idx_video_content_type", columnList = "contentType")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Video extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String videoId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String contentType;

    @Column(nullable = false)
    private String filePath;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference
    private User user;
}