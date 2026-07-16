package com.neha.VideoStreamApp.services.impl;

import com.neha.VideoStreamApp.entities.Video;
import com.neha.VideoStreamApp.repositories.VideoRepository;
import com.neha.VideoStreamApp.services.VideoService;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import com.neha.VideoStreamApp.dtos.VideoDto;

@Service
public class VideoServiceImpl implements VideoService {

    @Value("${files.video}")
    String DIR;

    @Value("${file.video.hls}")
    String HLS_DIR;

    private  final VideoRepository videoRepository;

    public VideoServiceImpl(VideoRepository videoRepository) {
        this.videoRepository = videoRepository;
    }

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(Paths.get(DIR));
            Files.createDirectories(Paths.get(HLS_DIR));
        } catch (IOException e) {
            throw new RuntimeException("Could not create video directories", e);
        }
    }

    @Override
    public VideoDto save(Video video, MultipartFile file) {

        // 1. Empty file check
        if (file.isEmpty()) {
            throw new RuntimeException("Uploaded file is empty");
        }

        try {
            // 2. Clean original filename
            String raw = file.getOriginalFilename();
            if (raw == null || raw.isBlank()) {
                throw new RuntimeException("Invalid file name");
            }
            String originalFilename = StringUtils.cleanPath(raw);

            // 3. Generate unique filename (overwrite problem solved)
            String uniqueFileName = UUID.randomUUID() + "_" + originalFilename;

            // 4. Final path where video will be saved
            Path filePath = Paths.get(DIR, uniqueFileName);

            // 5. Save file to disk (try-with-resources → no memory leak)
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, filePath, StandardCopyOption.REPLACE_EXISTING);
            }

            // 6. Save metadata in a database
            video.setFilePath(filePath.toString());
            video.setContentType(file.getContentType());

            Video savedVideo = videoRepository.save(video);

            // 7. Start video processing (HLS conversion)
            processVideo(savedVideo.getVideoId());

            // 8. Return saved video info
            return mapToDto(savedVideo);

        } catch (IOException e) {
            throw new RuntimeException("Video upload failed", e);
        }
    }


    @Override
    public VideoDto get(String videoId) {

        Video video = videoRepository.findById(videoId).orElseThrow(() -> new RuntimeException("Video not found"));
        return mapToDto(video);
    }

    @Override
    public VideoDto getByTitle(String title) {
        throw new UnsupportedOperationException("getByTitle is not yet implemented");
    }

    @Override
    public List<VideoDto> getAll() {
        return videoRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public String processVideo(String videoId) {
        Video video = videoRepository.findById(videoId).orElseThrow(() -> new RuntimeException("Video not found"));
        String filePath=video.getFilePath();

        //path where to store data:
        Path videoPath=Paths.get(filePath);

        try {
            //ffmpeg command

            Path outputPath=Paths.get(HLS_DIR,videoId + "/");

            Files.createDirectories(outputPath);


            List<String> ffmpegCmd = List.of(
                    "ffmpeg", "-i", videoPath.toString(),
                    "-c:v", "libx264", "-c:a", "aac", "-strict", "-2",
                    "-f", "hls", "-hls_time", "10", "-hls_list_size", "0",
                    "-hls_segment_filename", outputPath + "/segment_%3d.ts",
                    outputPath + "/master.m3u8"
            );

            ProcessBuilder processBuilder;
            String os = System.getProperty("os.name").toLowerCase();
            if (os.contains("win")) {
                // Windows dev environment — cmd.exe ke through run karo
                String joinedCmd = String.join(" ",
                        ffmpegCmd.stream().map(s -> s.contains(" ") ? "\"" + s + "\"" : s).toList());
                processBuilder = new ProcessBuilder("cmd.exe", "/c", joinedCmd);
            } else {
                // Linux/Docker — direct binary invoke, shell ki zaroorat nahi
                processBuilder = new ProcessBuilder(ffmpegCmd);
            }
            processBuilder.inheritIO();
            Process process=processBuilder.start();
            int exit = process.waitFor();
            if (exit != 0) {
                throw new RuntimeException("Video Processing Fail !! Exit Code: " + exit);
            }

            return videoId;


        }catch ( IOException ex) {
            throw new RuntimeException("Video Processing fail !!");
        }catch (InterruptedException e){
            Thread.currentThread().interrupt();
            throw new RuntimeException("Video processing interrupted", e);
        } finally {
            // process is already waited on; no action needed here
            // but kept for clarity in case of future refactoring
        }
    }
    @Override
    public void delete(String videoId) {

        //DB se video lao
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new RuntimeException("Video not found"));

        //Original video delete
        File videoFile = new File(video.getFilePath());
        if (videoFile.exists()) {
            boolean deleted = videoFile.delete();
            if (!deleted) {
                throw new RuntimeException("Failed to delete original video file");
            }
        }

        //HLS folder delete
        File hlsDir = new File(HLS_DIR, videoId);
        if (hlsDir.exists()) {
            deleteDirectory(hlsDir);
        }

        //DB record delete
        videoRepository.delete(video);
    }

    //static NAHI (industry best practice)
    private void deleteDirectory(File dir) {
        File[] files = dir.listFiles();
        if (files != null) {
            for (File file : files) {
                if (file.isDirectory()) {
                    deleteDirectory(file);
                } else {
                    if (!file.delete()) {
                        throw new RuntimeException("Failed to delete file: " + file.getAbsolutePath());
                    }
                }
            }
        }
        if (!dir.delete()) {
            throw new RuntimeException("Failed to delete directory: " + dir.getAbsolutePath());
        }
    }

    private VideoDto mapToDto(Video video) {
        VideoDto dto = new VideoDto();
        dto.setVideoId(video.getVideoId());
        dto.setTitle(video.getTitle());
        dto.setDescription(video.getDescription());
        dto.setContentType(video.getContentType());
        dto.setFilePath(video.getFilePath());
        dto.setCreatedAt(video.getCreatedAt());
        if (video.getUser() != null) {
            dto.setUserId(video.getUser().getId() != null ? video.getUser().getId().toString() : null);
            dto.setUserName(video.getUser().getName());
            dto.setUserEmail(video.getUser().getEmail());
        }
        return dto;
    }

}
