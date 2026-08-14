package com.neha.VideoStreamApp.cache;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.neha.VideoStreamApp.dtos.response.ScrollResponse;
import com.neha.VideoStreamApp.dtos.response.VideoDto;
import com.neha.VideoStreamApp.redis.VideoKeyGenerator;
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
    private final VideoKeyGenerator keyGenerator;
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
            String category,
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
                category,
                scrollId,
                pageSize,
                sortBy,
                sortDirection);
        try {
            Object cached = redisTemplate.opsForValue().get(cacheKey);
            if (cached != null) {
                logger.info("[VIDEO-CACHE] CACHE HIT. key={}", cacheKey);
                return objectMapper.convertValue(cached, new TypeReference<ScrollResponse<VideoDto>>() {});
            } else {
                logger.info("[VIDEO-CACHE] CACHE MISS. key={}", cacheKey);
                return null;
            }
        }
        catch (Exception e) {
            logger.error("[VIDEO-CACHE][ERR-VC-001] Error retrieving cached scroll response. key={} Error: {}", cacheKey, e.getMessage(), e);
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
            String category,
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
                category,
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

            logger.info("[VIDEO-CACHE] Scroll response cached. key={} ttlMinutes={}", cacheKey, CACHE_TTL_MINUTES);
        } catch (Exception e) {
            logger.error("[VIDEO-CACHE][ERR-VC-002] Error caching scroll response. key={} Error: {}", cacheKey, e.getMessage(), e);
        }
    }

    public void evictScrollCache() {
        try{
            String pattern = keyGenerator.generateScrollCachePattern();
            Set<String> keys = redisTemplate.keys(pattern);
            if (keys!=null && !keys.isEmpty()) {
                Long delete=redisTemplate.delete(keys);
                logger.info("[VIDEO-CACHE] Scroll cache evicted. pattern={} keysDeleted={}", pattern, keys.size());
            } else {
                logger.info("[VIDEO-CACHE] No scroll cache keys found for eviction. pattern={}", pattern);
            }
        }
        catch (Exception e) {
            logger.error("[VIDEO-CACHE][ERR-VC-003] Error evicting scroll cache. pattern={} Error: {}", keyGenerator.generateScrollCachePattern(), e.getMessage(), e);
        }
    }
}
