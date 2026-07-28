package com.neha.VideoStreamApp.services.impl;

import com.neha.VideoStreamApp.entities.Video;
import com.neha.VideoStreamApp.repositories.CommentRepository;
import com.neha.VideoStreamApp.repositories.VideoRepository;
import com.neha.VideoStreamApp.services.VideoService;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import com.neha.VideoStreamApp.dtos.response.VideoDto;

@Service
public class VideoServiceImpl implements VideoService {

    @Value("${files.video}")
    String DIR;

    @Value("${file.video.hls}")
    String HLS_DIR;

    private  final VideoRepository videoRepository;
    private final CommentRepository commentRepository;

    public VideoServiceImpl(VideoRepository videoRepository, CommentRepository commentRepository) {
        this.videoRepository = videoRepository;
        this.commentRepository = commentRepository;
    }

    // ================= ABR TARGET RESOLUTIONS =================
    // label, height, video-bitrate, maxrate, bufsize, audio-bitrate
    private record Resolution(String label, int height, String videoBitrate, String maxrate, String bufsize, String audioBitrate) {}

    private static final List<Resolution> TARGET_RESOLUTIONS = List.of(
            new Resolution("1080p", 1080, "5000k", "5350k", "7500k", "192k"),
            new Resolution("720p", 720, "2800k", "2996k", "4200k", "128k"),
            new Resolution("480p", 480, "1400k", "1498k", "2100k", "128k"),
            new Resolution("240p", 240, "600k", "642k", "900k", "96k")
    );

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

    // ================= ABR VIDEO PROCESSING (multi-resolution) =================
    @Override
    public String processVideo(String videoId) {
        Video video = videoRepository.findById(videoId).orElseThrow(() -> new RuntimeException("Video not found"));
        Path videoPath = Paths.get(video.getFilePath());

        try {
            Path outputBase = Paths.get(HLS_DIR, videoId);
            Files.createDirectories(outputBase);

            // 1. Original video ki width/height ffprobe se nikalo
            int[] dimensions = getVideoDimensions(videoPath);
            int originalWidth = dimensions[0];
            int originalHeight = dimensions[1];
            double aspectRatio = (double) originalWidth / originalHeight;

            // 2. Sirf wahi resolutions banao jo original se chhoti/equal hain
            //    (upscaling se quality nahi sudhregi, sirf storage/time waste hoga)
            List<Resolution> eligible = TARGET_RESOLUTIONS.stream()
                    .filter(r -> r.height() <= originalHeight)
                    .toList();

            // Agar original video sabse chhoti target resolution se bhi chhota hai,
            // to kam se kam ek variant zaroor banao
            if (eligible.isEmpty()) {
                eligible = List.of(TARGET_RESOLUTIONS.get(TARGET_RESOLUTIONS.size() - 1));
            }

            // 3. Har eligible resolution ke liye alag ffmpeg command chalao (sequential loop)
            List<Resolution> generated = new ArrayList<>();
            for (Resolution res : eligible) {
                boolean success = transcodeToResolution(videoPath, outputBase, res);
                if (success) {
                    generated.add(res);
                }
            }

            if (generated.isEmpty()) {
                throw new RuntimeException("Video Processing Fail !! No resolution could be generated");
            }

            // 4. Master playlist generate karo — jo sab available variants ko list kare
            generateMasterPlaylist(outputBase, generated, aspectRatio);

            return videoId;

        } catch (IOException ex) {
            throw new RuntimeException("Video Processing fail !!", ex);
        }
    }

    // ffprobe se original video ka width aur height nikalta hai
    private int[] getVideoDimensions(Path videoPath) {
        try {
            List<String> cmd = List.of(
                    "ffprobe", "-v", "error",
                    "-select_streams", "v:0",
                    "-show_entries", "stream=width,height",
                    "-of", "csv=p=0",
                    videoPath.toString()
            );

            ProcessBuilder processBuilder = buildProcess(cmd);
            Process process = processBuilder.start();

            String output;
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                output = reader.readLine();
            }

            int exit = process.waitFor();
            if (exit != 0 || output == null || output.isBlank()) {
                throw new RuntimeException("Could not detect video resolution (ffprobe failed)");
            }

            // csv output format: width,height
            String[] parts = output.trim().split(",");
            int width = Integer.parseInt(parts[0].trim());
            int height = Integer.parseInt(parts[1].trim());
            return new int[]{width, height};

        } catch (IOException e) {
            throw new RuntimeException("ffprobe execution failed", e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("ffprobe interrupted", e);
        }
    }

    // Ek resolution ke liye ffmpeg se HLS segments + playlist banata hai
    private boolean transcodeToResolution(Path inputPath, Path outputBase, Resolution res) {
        try {
            Path resDir = outputBase.resolve(res.label());
            Files.createDirectories(resDir);

            List<String> ffmpegCmd = List.of(
                    "ffmpeg", "-y", "-i", inputPath.toString(),
                    "-vf", "scale=-2:" + res.height(),
                    "-c:v", "libx264", "-preset", "veryfast",
                    "-b:v", res.videoBitrate(), "-maxrate", res.maxrate(), "-bufsize", res.bufsize(),
                    "-c:a", "aac", "-b:a", res.audioBitrate(),
                    "-hls_time", "10", "-hls_list_size", "0",
                    "-hls_segment_filename", resDir + "/segment_%3d.ts",
                    resDir + "/playlist.m3u8"
            );

            ProcessBuilder processBuilder = buildProcess(ffmpegCmd);
            processBuilder.inheritIO();
            Process process = processBuilder.start();
            int exit = process.waitFor();
            return exit == 0;

        } catch (IOException e) {
            throw new RuntimeException("Video Processing fail for resolution: " + res.label(), e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Video processing interrupted for resolution: " + res.label(), e);
        }
    }

    // master.m3u8 likhta hai — sab generated resolutions ko bandwidth+resolution tag ke saath list karta hai
    private void generateMasterPlaylist(Path outputBase, List<Resolution> generated, double aspectRatio) throws IOException {
        StringBuilder sb = new StringBuilder();
        sb.append("#EXTM3U\n");

        for (Resolution res : generated) {
            int bandwidth = parseBitrateToBps(res.videoBitrate()) + parseBitrateToBps(res.audioBitrate());
            int width = calculateWidth(res.height(), aspectRatio);
            sb.append("#EXT-X-STREAM-INF:BANDWIDTH=").append(bandwidth)
                    .append(",RESOLUTION=").append(width).append("x").append(res.height()).append("\n");
            sb.append(res.label()).append("/playlist.m3u8\n");
        }

        Files.writeString(outputBase.resolve("master.m3u8"), sb.toString());
    }

    // "2800k" -> 2800000
    private int parseBitrateToBps(String bitrate) {
        String cleaned = bitrate.toLowerCase().replace("k", "");
        return Integer.parseInt(cleaned) * 1000;
    }

    // Height se width nikalta hai (original aspect ratio maintain karke), even number banata hai
    private int calculateWidth(int height, double aspectRatio) {
        int width = (int) Math.round(height * aspectRatio);
        if (width % 2 != 0) width += 1;
        return width;
    }

    // OS ke hisaab se ProcessBuilder banata hai — Windows dev pe cmd.exe, Linux/Docker pe direct
    private ProcessBuilder buildProcess(List<String> cmd) {
        String os = System.getProperty("os.name").toLowerCase();
        if (os.contains("win")) {
            String joinedCmd = String.join(" ",
                    cmd.stream().map(s -> s.contains(" ") ? "\"" + s + "\"" : s).toList());
            return new ProcessBuilder("cmd.exe", "/c", joinedCmd);
        } else {
            return new ProcessBuilder(cmd);
        }
    }

    @Override
    @Transactional
    public void delete(String videoId) {

        //DB se video lao
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new RuntimeException("Video not found"));

        //Video pe jo comments hain, unhe pehle delete karo
        //(foreign key constraint ki wajah se video delete nahi hoga jab tak comments hain)
        //Pehle REPLIES delete karo (child rows) — warna self-referencing
        //parent_comment_id constraint fail ho sakta hai
        commentRepository.deleteByVideo_VideoIdAndParentCommentIsNotNull(videoId);
        //Phir baaki (top-level) comments delete karo
        commentRepository.deleteByVideo_VideoId(videoId);

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
