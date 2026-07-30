package com.neha.VideoStreamApp.security;

import com.neha.VideoStreamApp.entities.Provider;
import com.neha.VideoStreamApp.entities.RefreshToken;
import com.neha.VideoStreamApp.entities.Role;
import com.neha.VideoStreamApp.entities.User;
import com.neha.VideoStreamApp.repositories.RefreshTokenRepository;
import com.neha.VideoStreamApp.repositories.RoleRepository;
import com.neha.VideoStreamApp.repositories.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.Instant;
import java.util.HashSet;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final Logger logger= LoggerFactory.getLogger(this.getClass());
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final CookieService cookieService;
    private final RefreshTokenRepository refreshTokenRepository;
    private final RoleRepository roleRepository;

    @Value("${app.auth.frontend.success-redirect}")
    private String frontEndSuccessUrl;

    @Override
    @Transactional
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {

        OAuth2User oAuth2User=(OAuth2User)authentication.getPrincipal();

        String registrationId = "unknown";
        if (authentication instanceof OAuth2AuthenticationToken token){
            registrationId = token.getAuthorizedClientRegistrationId();
        }
        logger.info("OAuth2 login via: {}", registrationId);

        User user;
        switch (registrationId){
            case "google" -> {
                String googleId = oAuth2User.getAttributes().getOrDefault("sub", "").toString();
                String name = oAuth2User.getAttributes().getOrDefault("name", "").toString();
                Object rawEmail = oAuth2User.getAttributes().get("email");
                String email = (rawEmail != null) ? rawEmail.toString() : "";
                if (email.isBlank()) {
                    email = name + "@google.com";
                }

                Role role = roleRepository
                        .findByName("ROLE_USER")
                        .orElseThrow(() -> new RuntimeException("ROLE_USER not found"));
                User newuser = User.builder()
                        .email(email)
                        .name(name)
                        .enable(true)
                        .provider(Provider.GOOGLE)
                        .providerId(googleId)
                        .build();
                newuser.setRoles(new HashSet<>());
                newuser.getRoles().add(role);

                user = userRepository.findByEmail(email).map(existing -> {
                    existing.setName(name);
                    existing.setProvider(Provider.GOOGLE);
                    existing.setProviderId(googleId);
                    return userRepository.save(existing);
                }).orElseGet(() -> userRepository.save(newuser));
            }
            case "github"->{
                String name=oAuth2User.getAttributes().getOrDefault("login","").toString();
                String githubId=oAuth2User.getAttributes().getOrDefault("id","").toString();
                Object rawEmail = oAuth2User.getAttributes().get("email");
                String email = (rawEmail != null) ? rawEmail.toString() : "";
                if (email.isBlank()) {
                    email = name + "@github.com";
                }
                Role role = roleRepository
                        .findByName("ROLE_USER")
                        .orElseThrow(() -> new RuntimeException("ROLE_USER not found"));

                User newuser = User.builder()
                        .email(email)
                        .name(name)
                        .enable(true)
                        .provider(Provider.GITHUB)
                        .providerId(githubId)
                        .build();
                newuser.setRoles(new HashSet<>());
                newuser.getRoles().add(role);

                user = userRepository.findByEmail(email).map(existing -> {
                    existing.setName(name);
                    existing.setProvider(Provider.GITHUB);
                    existing.setProviderId(githubId);
                    return userRepository.save(existing);
                }).orElseGet(() -> userRepository.save(newuser));

            }
            default -> {
                throw new RuntimeException("Invalid Registration id");
            }
        }

        //username
        //user email
        //new usercreate
        //jwt token--token ke sath front --pe fir redirect.



        //refresh token bana ke dunga:
        String jti= UUID.randomUUID().toString();
        RefreshToken refreshTokenOb=RefreshToken.builder()
                .jti(jti)
                .user(user)
                .revoked(false)
                .expiresAt(Instant.now().plusSeconds(jwtService.getRefreshTtlSeconds()))
                .build();
        refreshTokenRepository.save(refreshTokenOb);
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user, refreshTokenOb.getJti());
        cookieService.attachRefreshCookie(response,refreshToken,(int)jwtService.getRefreshTtlSeconds());

       // response.getWriter().write("login successful");
        response.sendRedirect(frontEndSuccessUrl);
    }
}
