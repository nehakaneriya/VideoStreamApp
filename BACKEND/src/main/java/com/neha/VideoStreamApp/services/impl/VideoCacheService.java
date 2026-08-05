package com.neha.VideoStreamApp.services.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.neha.VideoStreamApp.dtos.response.ScrollResponse;
import com.neha.VideoStreamApp.dtos.response.VideoDto;
import com.neha.VideoStreamApp.redis.KeyGenerator;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.springframework.data.domain.Sort;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.TimeUnit;


@Service
@RequiredArgsConstructor
public class VideoCacheService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final KeyGenerator keyGenerator;
    private final ObjectMapper objectMapper;

    // Cache TTL in minutes configuration
    private static final long CACHE_TTL_MINUTES = 10;
    private Logger logger = org.slf4j.LoggerFactory.getLogger(VideoCacheService.class);


    //get cached scroll response
    public ScrollResponse<VideoDto> getCachedScrollResponse(
            String search,
            UUID userId,
            Instant createdAfter,
            Instant createdBefore,
            String contentType,
            String scrollId,
            int pageSize,
            String sortBy,
            Sort.Direction sortDirection
    ) {
        String cacheKey = keyGenerator.generateScrollCacheKey(
                search,
                userId,
                createdAfter,
                createdBefore,
                contentType,
                scrollId,
                pageSize,
                sortBy,
                sortDirection);
        try {
            Object cached = redisTemplate.opsForValue().get(cacheKey);
            if (cached != null) {
                logger.info("Cache hit for key: {}", cacheKey);
                return objectMapper.convertValue(cached, new TypeReference<ScrollResponse<VideoDto>>() {});
            } else {
                logger.info("Cache miss for key: {}", cacheKey);
                return null;
            }
        }
        catch (Exception e) {
            logger.error("Error retrieving cached scroll response with key: {}. Error: {}", cacheKey, e.getMessage());
            return null;
        }
    }

    //cache scroll response
    public void cacheScrollResponse(
            ScrollResponse<VideoDto> scrollResponse,
            String search,
            UUID userId,
            Instant createdAfter,
            Instant createdBefore,
            String contentType,
            String scrollId,
            int pageSize,
            String sortBy,
            Sort.Direction sortDirection
    ) {
        String cacheKey = keyGenerator.generateScrollCacheKey(
                search,
                userId,
                createdAfter,
                createdBefore,
                contentType,
                scrollId,
                pageSize,
                sortBy,
                sortDirection);

        try{
            redisTemplate.opsForValue().set(
                    cacheKey,
                    scrollResponse,
                    CACHE_TTL_MINUTES,
                    TimeUnit.MINUTES);

            logger.info("Cached scroll response with key: {}", cacheKey);
        } catch (Exception e) {
            logger.error("Error caching scroll response with key: {}. Error: {}", cacheKey, e.getMessage());
        }
    }

    public void evictScrollCache() {
        try{
            String pattern = keyGenerator.generateScrollCachePattern();
            Set<String> keys = redisTemplate.keys(pattern);
            if (keys!=null && !keys.isEmpty()) {
                Long delete=redisTemplate.delete(keys);
                logger.info("Evicting scroll cache with pattern: {}. Keys found: {}", pattern, keys.size());
            } else {
                logger.info("No keys found for eviction with pattern: {}", pattern);
            }
        }
        catch (Exception e) {
            logger.error("Error evicting scroll cache with pattern: {}. Error: {}", keyGenerator.generateScrollCachePattern(), e.getMessage());
        }
    }
}
