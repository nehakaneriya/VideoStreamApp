package com.neha.VideoStreamApp.services.impl;

import com.neha.VideoStreamApp.dtos.response.CommentDto;
import com.neha.VideoStreamApp.entities.Comment;
import com.neha.VideoStreamApp.entities.User;
import com.neha.VideoStreamApp.entities.Video;
import com.neha.VideoStreamApp.exception.ResourceNotFoundException;
import com.neha.VideoStreamApp.repositories.CommentRepository;
import com.neha.VideoStreamApp.repositories.UserRepository;
import com.neha.VideoStreamApp.repositories.VideoRepository;
import com.neha.VideoStreamApp.services.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final VideoRepository videoRepository;

    @Override
    public CommentDto addComment(String videoId, String text, String userEmail, String parentCommentId) {

        if (text == null || text.isBlank()) {
            throw new IllegalArgumentException("Comment text cannot be empty");
        }
        if (text.length() > 1000) {
            throw new IllegalArgumentException("Comment too long (max 1000 characters)");
        }

        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new ResourceNotFoundException("Video not found"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Comment parentComment = null;
        if (parentCommentId != null && !parentCommentId.isBlank()) {
            parentComment = commentRepository.findById(parentCommentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Parent comment not found"));

            // 1-level-deep restriction — reply ka reply allowed nahi
            // (agar parent khud kisi ka reply hai, to naya comment usi video ke top-level parent se link karo)
            if (parentComment.getParentComment() != null) {
                throw new IllegalArgumentException("Cannot reply to a reply. Only one level of replies is allowed.");
            }

            // Parent comment usi video ka hona chahiye
            if (!parentComment.getVideo().getVideoId().equals(videoId)) {
                throw new IllegalArgumentException("Parent comment does not belong to this video");
            }
        }

        Comment comment = Comment.builder()
                .text(text.trim())
                .user(user)
                .video(video)
                .parentComment(parentComment)
                .build();

        Comment saved = commentRepository.save(comment);
        return mapToDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommentDto> getCommentsByVideo(String videoId) {

        // Video exist karta hai ya nahi, confirm kar lo (galat videoId pe 404 milna chahiye)
        if (!videoRepository.existsById(videoId)) {
            throw new ResourceNotFoundException("Video not found");
        }

        // Sirf top-level comments lao, har ek ke replies nested-list ke roop mein saath mein aayenge
        return commentRepository.findByVideo_VideoIdAndParentCommentIsNullOrderByCreatedAtDesc(videoId)
                .stream()
                .map(this::mapToDtoWithReplies)
                .collect(Collectors.toList());
    }

    @Override
    public boolean deleteComment(String commentId, String requesterEmail, boolean isAdmin) {

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        boolean isOwner = comment.getUser().getEmail().equals(requesterEmail);

        if (!isOwner && !isAdmin) {
            return false;
        }

        // Comment ke saare replies bhi automatically delete ho jayenge
        // (Comment.replies field pe cascade = ALL, orphanRemoval = true lagaya hai)
        commentRepository.delete(comment);
        return true;
    }

    // ── ADMIN ─────────────────────────────────────────────────────────────
    @Override
    public List<CommentDto> getAllComments() {
        return commentRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public void adminDeleteComment(String commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));
        // Replies bhi cascade se automatically delete ho jayenge
        commentRepository.delete(comment);
    }

    private CommentDto mapToDto(Comment comment) {
        return CommentDto.builder()
                .id(comment.getId())
                .text(comment.getText())
                .createdAt(comment.getCreatedAt())
                .videoId(comment.getVideo() != null ? comment.getVideo().getVideoId() : null)
                .videoTitle(comment.getVideo() != null ? comment.getVideo().getTitle() : null)
                .userId(comment.getUser().getId() != null ? comment.getUser().getId().toString() : null)
                .userName(comment.getUser().getName())
                .userEmail(comment.getUser().getEmail())
                .parentCommentId(comment.getParentComment() != null ? comment.getParentComment().getId() : null)
                .build();
    }

    // Top-level comment ke saath uske saare replies bhi nest karke deta hai (oldest reply pehle — natural reading order)
    private CommentDto mapToDtoWithReplies(Comment comment) {
        CommentDto dto = mapToDto(comment);
        List<CommentDto> replyDtos = comment.getReplies().stream()
                .sorted((a, b) -> a.getCreatedAt().compareTo(b.getCreatedAt()))
                .map(this::mapToDto)
                .collect(Collectors.toList());
        dto.setReplies(replyDtos);
        return dto;
    }
}
