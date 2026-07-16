package com.neha.VideoStreamApp.repositories;

import com.neha.VideoStreamApp.entities.Video;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VideoRepository extends JpaRepository<Video,String>
{
    Optional<Video> findByTitle (String title);
}
