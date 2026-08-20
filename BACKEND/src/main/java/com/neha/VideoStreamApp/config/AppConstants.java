package com.neha.VideoStreamApp.config;

public class AppConstants {

    // ─── PUBLIC: Bina login ke accessible ───────────────────────────────────
    public static final String[] AUTH_PUBLIC_URLS = {

            // Auth (login / register / token refresh / logout — token required nahi)
            "/api/v1/auth/login",
            "/api/v1/auth/register",
            "/api/v1/auth/refresh",
            "/api/v1/auth/logout",
            "/api/v1/auth/admin/login",
            "/api/v1/auth/admin/refresh",
            "/api/v1/auth/admin/logout",

            // Email verification (OTP) — bina login ke accessible
            "/api/v1/auth/verify-otp",
            "/api/v1/auth/resend-otp",

            // OAuth2 callbacks (Spring Security handle karta hai)
            "/oauth2/**",
            "/login/oauth2/**",

            // Swagger / API Docs (dev only — prod mein disable karna)
            "/v3/api-docs/**",
            "/swagger-ui.html",
            "/swagger-ui/**",

            // Public video list + single video metadata (GET only)
            // NOTE: POST /api/v1/videos (upload) is PROTECTED — SecurityConfig mein handle hoga
            "/api/v1/videos",
            "/api/v1/videos/*",

            // Public channel page — kisi bhi user ke videos (bina login)
            "/api/v1/videos/user/*",

            // Public categories list (filter chips + upload dropdown ke liye)
            "/api/v1/categories",

            // HLS streaming — public (video player ke liye token nahi chahiye)
            "/api/v1/videos/*/master.m3u8",
            "/api/v1/videos/*/*/playlist.m3u8",
            "/api/v1/videos/*/*/*.ts",

            // Legacy direct stream (public — HLS se replace ho chuka hai)
            "/api/v1/videos/stream/**",
    };

    // ─── COMMENTS: GET public hai, POST/DELETE SecurityConfig mein method-wise protected ───
    public static final String COMMENTS_GET_PATTERN = "/api/v1/videos/*/comments";

    // ─── ADMIN ONLY ──────────────────────────────────────────────────────────
    public static final String[] AUTH_ADMIN_URLS = {
            "/api/v1/admin/**",    // poora admin panel
    };

    public static final String ADMIN_ROLE = "ADMIN";
    public static final String USER_ROLE  = "USER";
}
