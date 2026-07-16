package com.neha.VideoStreamApp.security;

import com.neha.VideoStreamApp.helper.UserHelper;
import com.neha.VideoStreamApp.repositories.UserRepository;
import io.jsonwebtoken.*;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;


@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final Logger logger= LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        String header=request.getHeader("Authorization");

        if(header!=null && header.startsWith("Bearer ")){

            String token = header.substring(7);

            try{
                // Parse once, check type from same result — avoid double parse
                Jws<Claims> parse = jwtService.parse(token);
                Claims payload = parse.getPayload();

                if (!"access".equals(payload.get("typ"))) {
                    request.setAttribute("error", "Invalid token type: expected access token");
                    filterChain.doFilter(request, response);
                    return;
                }

                String userId = payload.getSubject();
                UUID userUuid = UserHelper.parseUUID(userId);

                // User DB mein dhundho
                var userOpt = userRepository.findById(userUuid);

                if (userOpt.isEmpty()) {
                    // User delete ho gaya — token invalid treat karo
                    request.setAttribute("error", "User no longer exists");
                    filterChain.doFilter(request, response);
                    return;
                }

                var user = userOpt.get();

                if (!user.isEnable()) {
                    // User disabled hai
                    request.setAttribute("error", "User account is disabled");
                    filterChain.doFilter(request, response);
                    return;
                }

                // User valid hai — authentication set karo
                List<GrantedAuthority> authorities = user.getRoles() == null ? List.of() :
                        user.getRoles().stream()
                                .map(role -> new SimpleGrantedAuthority(role.getName()))
                                .collect(Collectors.toList());
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(user.getEmail(), null, authorities);
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                if (SecurityContextHolder.getContext().getAuthentication() == null)
                    SecurityContextHolder.getContext().setAuthentication(authentication);
            } catch (ExpiredJwtException e) {
                logger.error("JWT Token Expired: {}", e.getMessage());
                request.setAttribute("error", "Token Expired");
            } catch (MalformedJwtException e){
                logger.error("Invalid JWT Token: {}", e.getMessage());
                request.setAttribute("error", "Invalid Token Format");

            } catch (Exception e){
                logger.error("Authentication Error: {}", e.getMessage());
                request.setAttribute("error", "Authentication Failed");


            }
        }
        filterChain.doFilter(request,response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String uri = request.getRequestURI();
        // /auth/me ko filter karo — authenticated endpoint hai
        if (uri.equals("/api/v1/auth/me")) return false;
        return uri.startsWith("/api/v1/auth");
    }
}
