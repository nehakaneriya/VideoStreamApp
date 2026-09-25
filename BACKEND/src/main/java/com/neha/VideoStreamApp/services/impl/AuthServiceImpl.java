package com.neha.VideoStreamApp.services.impl;

import com.neha.VideoStreamApp.cache.UserCacheService;
import com.neha.VideoStreamApp.dtos.common.UserDto;
import com.neha.VideoStreamApp.entities.User;
import com.neha.VideoStreamApp.exception.BadRequestException;
import com.neha.VideoStreamApp.repositories.UserRepository;
import com.neha.VideoStreamApp.services.AuthService;
import com.neha.VideoStreamApp.services.MailService;
import com.neha.VideoStreamApp.services.OtpService;
import com.neha.VideoStreamApp.services.UserService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;


@Service
@AllArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserService userService;
    private final OtpService otpService;
    private final MailService mailService;
    private final UserRepository userRepository;
    private final UserCacheService userCacheService;

    @Override
    public UserDto registerUser(UserDto userDto) {

        // User enable=false se create hota hai (email verify hone tak login nahi kar sakta)
        UserDto created = userService.createPendingUser(userDto);

        // OTP generate karo, Redis me store karo, email par bhejo
        String otp = otpService.generateAndStore(created.getEmail());
        mailService.sendOtpEmail(created.getEmail(), created.getName(), otp);

        return created;
    }

    @Override
    public void cancelRegistration(String email) {
        if (email == null || email.isBlank()) {
            throw new BadRequestException("Email is required");
        }

        String cleanEmail = email.trim();
        userRepository.findByEmail(cleanEmail)
                .or(() -> userRepository.findByEmail(cleanEmail.toLowerCase()))
                .ifPresent(user -> {
                    if (user.isEnable()) {
                        throw new BadRequestException("Cannot cancel registration for an already verified user");
                    }
                    userRepository.delete(user);
                    if (user.getId() != null) {
                        userCacheService.evictUserCache(user.getId().toString());
                    }
                });

        otpService.clear(cleanEmail);
    }
}
