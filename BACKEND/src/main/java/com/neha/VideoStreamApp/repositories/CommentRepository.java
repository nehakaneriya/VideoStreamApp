package com.neha.VideoStreamApp.repositories;

import com.neha.VideoStreamApp.entities.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, String> {

    // Ek particular video ke saare top-level comments (replies alag se, nested aayenge) — naye sabse pehle
    List<Comment> findByVideo_VideoIdAndParentCommentIsNullOrderByCreatedAtDesc(String videoId);

    // ADMIN — poore platform ke saare comments (flat list, replies bhi isme aa jayenge), naye sabse pehle
    List<Comment> findAllByOrderByCreatedAtDesc();

    // Video delete karne se pehle — REPLIES pehle delete karo (child rows),
    // taaki self-referencing foreign key (parent_comment_id) error na de
    void deleteByVideo_VideoIdAndParentCommentIsNotNull(String videoId);

    // Phir baaki (top-level) comments delete karo
    void deleteByVideo_VideoId(String videoId);
}
