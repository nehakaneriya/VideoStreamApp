package com.neha.VideoStreamApp.repositories;

import com.neha.VideoStreamApp.entities.Video;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VideoRepository extends JpaRepository<Video,String>, JpaSpecificationExecutor<Video>
{
    Optional<Video> findByTitle (String title);

    List<Video> findByUserEmail(String email);
}
