package com.neha.VideoStreamApp.redis;

public class UserKeyGenerator {

    private static final String USER_CACHE_PREFIX = "user:details:";
    private static final String JWT_BLACKLIST_PREFIX = "jwt:blacklist:";

    public static String getUserCacheKey(String username) {
        return USER_CACHE_PREFIX + username;
    }

    public static String getJwtBlacklistKey(String token) {
        return JWT_BLACKLIST_PREFIX + token;
    }
}
