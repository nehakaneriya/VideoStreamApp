package com.neha.VideoStreamApp.controllers;


import com.neha.VideoStreamApp.dtos.response.ScrollResponse;
import com.neha.VideoStreamApp.entities.User;
import com.neha.VideoStreamApp.entities.Video;
import com.neha.VideoStreamApp.dtos.response.VideoDto;
import com.neha.VideoStreamApp.exception.ResourceNotFoundException;
import com.neha.VideoStreamApp.playload.CustomMessage;
import com.neha.VideoStreamApp.repositories.UserRepository;
import com.neha.VideoStreamApp.services.AppConstants;
import com.neha.VideoStreamApp.services.VideoService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/api/v1/videos")
@RequiredArgsConstructor
public class VideoController {

    private final VideoService videoService;
    private final UserRepository userRepository;


    //1. Upload Video API
    @PostMapping
    public ResponseEntity<?> create(
            @RequestParam("file")MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam(required = false) String category,
            Authentication authentication
            ){

        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized access");
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Logged in user not found in DB"));

                 // Create a Video object
                Video video=new Video();
                video.setTitle(title);
                video.setDescription(description);
                video.setUser(user);

                // Category (optional — backend 'other' default de dega agar null/blank hai)
                if (category != null && !category.isBlank()) {
                    video.setCategory(category.trim().toLowerCase());
                }

                // Save video metadata + file
                VideoDto savedVideo = videoService.save(video, file);

                if(savedVideo!=null)
                {
                    return ResponseEntity
                            .status(HttpStatus.CREATED)
                            .body(savedVideo);
                }
                else {
                    return ResponseEntity
                            .status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body(CustomMessage.builder()
                                    .message("Video Not Uploaded ")
                                    .success(false)
                                    .build()
                            );
                }
    }

    //2. Record a unique view (public — bina login bhi guest dekh sakta hai)
    //   Same user + same video lifetime me ek baar hi count hota hai
    @PostMapping("/{videoId}/view")
    public ResponseEntity<?> incrementView(
            @PathVariable String videoId,
            @RequestHeader(value = "X-Forwarded-For", required = false) String forwardedFor,
            Authentication authentication
    ) {
        UUID userId = null;
        if (authentication != null && authentication.getName() != null) {
            // Login user — unique check user_id se hoga
            var userOpt = userRepository.findByEmail(authentication.getName());
            if (userOpt.isPresent()) {
                userId = userOpt.get().getId();
            }
        }

        // Guest ke liye client IP
        String viewerIp = null;
        if (userId == null) {
            viewerIp = forwardedFor != null && !forwardedFor.isBlank()
                    ? forwardedFor.split(",")[0].trim()
                    : "unknown";
        }

        videoService.incrementView(videoId, userId, viewerIp);
        return ResponseEntity.ok(Map.of("viewCount", videoService.get(videoId).getViewCount()));
    }

    //3. Get All Videos
    @GetMapping
    public ResponseEntity<ScrollResponse<VideoDto>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant createdAfter,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant createdBefore,
            @RequestParam(required = false) String contentType,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String scrollId,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection
    ){
        ScrollResponse<VideoDto> response = videoService.getAll(

                search,
                userId,
                createdAfter,
                createdBefore,
                contentType,
                category,
                scrollId,
                pageSize,
                sortBy,
                Sort.Direction.fromString(sortDirection)

        );
        return ResponseEntity.ok(response);
    }

    //3. Get a Single Video
    @GetMapping("/{videoId}")
    public ResponseEntity<VideoDto> getSingleVideo(@PathVariable String videoId) {
        VideoDto video = videoService.get(videoId);
        return ResponseEntity.ok(video);
    }

    //4. Stream Full Video
    //http://localhost:2911/api/v1/videos/stream/
    @GetMapping("/stream/{videoId}")
    public ResponseEntity<Resource> stream(@PathVariable String videoId) {

        VideoDto video = videoService.get(videoId);

        String contentType = video.getContentType();
        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        // Load a video file from a system
        FileSystemResource resource = new FileSystemResource(video.getFilePath());

        if (!resource.exists()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        return ResponseEntity
                .ok()
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }

    //5. Stream Video in Chunks (Range Support)
    @GetMapping("/stream/range/{videoId}")
    public ResponseEntity<Resource> streamVideoRange(
    @PathVariable String videoId,
            @RequestHeader(value = "Range",required = false)  String range
    ) {

        VideoDto video = videoService.get(videoId);
        Path path = Paths.get(video.getFilePath());

        Resource resource = new FileSystemResource(path);

        String contentType = video.getContentType();
        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        long fileLength = path.toFile().length();

        // If no Range header → return full video
        if (range == null) {
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(resource);
        }

        // Extract range values
        long rangeStart;
        long rangeEnd;

        String[] ranges = range.replace("bytes=", "").split("-");
        if (ranges.length < 1 || ranges[0].isBlank()) {
            return ResponseEntity.status(HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE).build();
        }
        try {
            rangeStart = Long.parseLong(ranges[0]);
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE).build();
        }

        if (ranges.length > 1 && !ranges[1].isBlank()) {
            try {
                rangeEnd = Long.parseLong(ranges[1]);
            } catch (NumberFormatException e) {
                rangeEnd = rangeStart + AppConstants.CHUNK_SIZE - 1;
            }
        } else {
            rangeEnd = rangeStart + AppConstants.CHUNK_SIZE - 1;
        }

        if (rangeEnd >= fileLength) {
            rangeEnd = fileLength - 1;
        }

        try (InputStream inputStream = Files.newInputStream(path)) {
            inputStream.skip(rangeStart);

            long contentLength = rangeEnd - rangeStart + 1;

            byte[] data=new byte[(int) contentLength];
            inputStream.read(data, 0, data.length);

            // Set HTTP headers for Partial Content
            HttpHeaders httpHeaders = new HttpHeaders();
            httpHeaders.add("Content-Range", "bytes " + rangeStart + "-" + rangeEnd + "/" + fileLength);
            httpHeaders.add("Cache-Control", "no-store,must-revalidate");
            httpHeaders.add("Pragma", "no-cache");
            httpHeaders.add("Expires", "0");
            httpHeaders.add("X-Content-Type-Options", "nosniff");

            httpHeaders.setContentLength(contentLength);
            return ResponseEntity
                    .status(HttpStatus.PARTIAL_CONTENT)
                    .headers(httpHeaders)
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(new ByteArrayResource(data));


        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    //6. Serve HLS Files
    // HLS base directory from application.properties
    @Value("${file.video.hls}")
    private  String HLS_DIR;

    //Serve Master Playlist (master.m3u8) — sab resolution variants list karta hai
    @GetMapping("/{videoId}/master.m3u8")
    public ResponseEntity<Resource> serverMasterFile(@PathVariable String videoId){

        Path path = Paths.get(HLS_DIR, videoId, "master.m3u8");

        if (!Files.exists(path)){
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        Resource resource=new FileSystemResource(path);

        return ResponseEntity
                .ok()
                .header(HttpHeaders.CONTENT_TYPE,"application/vnd.apple.mpegurl")
                .body(resource);
    }

    //Serve Resolution-specific Playlist (e.g. /{videoId}/720p/playlist.m3u8)
    @GetMapping("/{videoId}/{resolution}/playlist.m3u8")
    public ResponseEntity<Resource> serveResolutionPlaylist(
            @PathVariable String videoId,
            @PathVariable String resolution) {

        Path path = Paths.get(HLS_DIR, videoId, resolution, "playlist.m3u8");
        if (!Files.exists(path)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        Resource resource = new FileSystemResource(path);

        return ResponseEntity
                .ok()
                .header(HttpHeaders.CONTENT_TYPE, "application/vnd.apple.mpegurl")
                .body(resource);
    }

    //Serve HLS Segment (.ts files) — ab resolution-wise subfolder mein hain
    @GetMapping("/{videoId}/{resolution}/{segment}.ts")
    public ResponseEntity<Resource> serveSegments(
            @PathVariable String videoId,
            @PathVariable String resolution,
            @PathVariable String segment) {

        //create a path for segment
        Path path = Paths.get(HLS_DIR, videoId, resolution, segment + ".ts");
        if (!Files.exists(path)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        Resource resource = new FileSystemResource(path);

        return ResponseEntity
                .ok()
                .header(HttpHeaders.CONTENT_TYPE, "video/mp2t")
                .body(resource);

    }

    //7. UPDATE VIDEO METADATA (title/description only)
    @PutMapping("/{videoId}")
    public ResponseEntity<?> updateVideo(
            @PathVariable String videoId,
            @RequestBody(required = false) Map<String, String> updates,
            Authentication authentication) {

        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        String email = authentication.getName();
        VideoDto video = videoService.get(videoId);

        // Owner ya Admin hi edit kar sakta hai (delete ke same rule)
        boolean isOwner = video.getUserEmail() != null && video.getUserEmail().equals(email);
        boolean isAdmin = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals("ROLE_ADMIN"));

        if (!isOwner && !isAdmin) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You are not allowed to edit this video");
        }

        String title = updates != null ? updates.get("title") : null;
        String description = updates != null ? updates.get("description") : null;

        VideoDto updatedVideo = videoService.update(videoId, title, description);
        return ResponseEntity.ok(updatedVideo);
    }

    //7. DELETE VIDEO (DB + FOLDER)
    @DeleteMapping("/{videoId}")
    public ResponseEntity<String> deleteVideo(
            @PathVariable String videoId,
            Authentication authentication) {

        if (authentication == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Unauthorized");
        }
        VideoDto video = videoService.get(videoId);
        String email = authentication.getName();

        // Check if the authenticated user is the owner of the video or has an admin role
        boolean isOwner = video.getUserEmail() != null && video.getUserEmail().equals(email);

        // Check if the user has an admin role
        boolean isAdmin = authentication.getAuthorities().stream().map(GrantedAuthority::getAuthority).anyMatch(role -> role.equals("ROLE_ADMIN"));


        if (!isOwner && !isAdmin) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(
                            "You are not allowed to delete this video"
                    );
        }


        videoService.delete(videoId);
        return ResponseEntity.ok("Video deleted successfully");
    }

    @GetMapping("/my-videos")
    public ResponseEntity<?> getMyVideos(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        String email = authentication.getName();

        // User ko fetch karenge uske videos ke saath
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // User ke pass multiple videos hain, toh ye puri list return karega
        List<VideoDto> myVideos = user.getVideos().stream().map(v -> {
            VideoDto dto = new VideoDto();
            dto.setVideoId(v.getVideoId());
            dto.setTitle(v.getTitle());
            dto.setDescription(v.getDescription());
            dto.setContentType(v.getContentType());
            dto.setCategory(v.getCategory());
            dto.setFilePath(v.getFilePath());
            dto.setViewCount(v.getViewCount());
            dto.setUserId(user.getId() != null ? user.getId().toString() : null);
            dto.setUserName(user.getName());
            dto.setUserEmail(user.getEmail());
            return dto;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(myVideos);
    }
}
