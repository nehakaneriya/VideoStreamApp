package com.neha.VideoStreamApp.services;

import com.neha.VideoStreamApp.dtos.response.CommentDto;

import java.util.List;

public interface CommentService {

    // User video par comment post kare (parentCommentId null = naya comment, set = reply)
    CommentDto addComment(String videoId, String text, String userEmail, String parentCommentId);

    // Ek video ke top-level comments (naye sabse pehle), har ek ke saath uske replies nested
    List<CommentDto> getCommentsByVideo(String videoId);

    // Comment delete kare — owner ya admin
    // Return: true = deleted, false = comment ka owner na hote hue bhi delete try kiya (caller 403 de)
    boolean deleteComment(String commentId, String requesterEmail, boolean isAdmin);

    // ── ADMIN ─────────────────────────────────────────────────────────────
    // Poore platform ke saare comments (moderation ke liye)
    List<CommentDto> getAllComments();

    // Admin — kisi bhi comment ko force delete kare
    void adminDeleteComment(String commentId);
}
