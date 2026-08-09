package com.neha.VideoStreamApp.cache;

import com.neha.VideoStreamApp.redis.UserKeyGenerator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Slf4j
@Service
public class JwtBlacklistService {
    private final RedisTemplate<String, Object> redisTemplate;

    public JwtBlacklistService(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    // Token ko remaining validity time ke liye blacklist karein
    public void blacklistToken(String token, long expirationMillis) {
        if (expirationMillis <= 0) {
            log.warn("[JWT-BLACKLIST] Token already expired, skipping blacklist. expiryMillis={}", expirationMillis);
            return;
        }
        try {
            String key = UserKeyGenerator.getJwtBlacklistKey(token);
            redisTemplate.opsForValue().set(key, "revoked", expirationMillis, TimeUnit.MILLISECONDS);
            log.info("[JWT-BLACKLIST] Token blacklisted successfully. key={}... ttlMillis={}", key.substring(0, Math.min(60, key.length())), expirationMillis);
        } catch (Exception e) {
            log.error("[JWT-BLACKLIST][ERR-JWT-BL-001] Failed to blacklist token. Reason: {}", e.getMessage(), e);
        }
    }

    // Check karein ki token blacklisted hai ya nahi
    public boolean isTokenBlacklisted(String token) {
        try {
            String key = UserKeyGenerator.getJwtBlacklistKey(token);
            boolean blacklisted = Boolean.TRUE.equals(redisTemplate.hasKey(key));
            if (blacklisted) {
                log.info("[JWT-BLACKLIST] Token IS blacklisted (rejected request). key={}...", key.substring(0, Math.min(60, key.length())));
            }
            return blacklisted;
        } catch (Exception e) {
            log.error("[JWT-BLACKLIST][ERR-JWT-BL-002] Redis check failed for token blacklist. Reason: {}", e.getMessage(), e);
            // Safe fallback: agar Redis down hai to token block na karein (availability first)
            return false;
        }
    }
}
