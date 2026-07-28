package com.neha.VideoStreamApp.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "comments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, length = 1000)
    private String text;

    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }

    // Comment kis user ne kiya
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Comment kis video par hai
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "video_id", nullable = false)
    private Video video;

    // Agar ye ek reply hai, to iska parent comment yahan store hoga
    // null = top-level comment, non-null = kisi comment ka reply
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_comment_id")
    private Comment parentComment;

    // Is comment ke saare replies (1-level-deep — reply ka reply allowed nahi)
    @Builder.Default
    @OneToMany(mappedBy = "parentComment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> replies = new ArrayList<>();
}
