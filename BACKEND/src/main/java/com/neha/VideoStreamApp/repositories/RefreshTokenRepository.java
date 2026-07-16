package com.neha.VideoStreamApp.repositories;

import com.neha.VideoStreamApp.entities.RefreshToken;
import com.neha.VideoStreamApp.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {
    Optional<RefreshToken> findByJti(String jti);
    List<RefreshToken> findByUser(User user);
    void deleteByUser(User user);
}
