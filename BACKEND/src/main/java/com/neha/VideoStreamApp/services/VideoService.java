package com.neha.VideoStreamApp.services;

import com.neha.VideoStreamApp.entities.Video;
import com.neha.VideoStreamApp.dtos.response.VideoDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface VideoService {

    //save Video
    VideoDto save(Video video, MultipartFile file);

    // get video by id
    VideoDto get(String videoId);

    //get video by title
    VideoDto getByTitle(String title);

    List<VideoDto> getAll();

    //video processing
    String processVideo(String videoId);

    //delete video (Db+ folder)
    void delete(String videoId);
}
