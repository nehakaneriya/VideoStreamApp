package com.neha.VideoStreamApp.services;

import com.neha.VideoStreamApp.dtos.response.ScrollResponse;
import com.neha.VideoStreamApp.entities.Video;
import com.neha.VideoStreamApp.dtos.response.VideoDto;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface VideoService {

    //save Video
    VideoDto save(Video video, MultipartFile file);

    // get video by id
    VideoDto get(String videoId);

    //get video by title
    VideoDto getByTitle(String title);

    // Cursor Pagination
    ScrollResponse<VideoDto> getAll(
            String search,
            UUID userId,
            Instant createdAfter,
            Instant createdBefore,
            String contentType,
            String scrollId,
            int pageSize,
            String sortBy,
            Sort.Direction sortDirection
    );
    //video processing
    String processVideo(String videoId);

    //delete video (Db+ folder)
    void delete(String videoId);

    List<VideoDto> getVideosByUserEmail(String email);
}
