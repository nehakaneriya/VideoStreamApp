package com.neha.VideoStreamApp.services.impl;

import com.neha.VideoStreamApp.dtos.common.UserDto;
import com.neha.VideoStreamApp.services.AuthService;
import com.neha.VideoStreamApp.services.MailService;
import com.neha.VideoStreamApp.services.OtpService;
import com.neha.VideoStreamApp.services.UserService;
import lombok.AllArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
@AllArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserService userService;
    private final OtpService otpService;
    private final MailService mailService;

    @Override
    public UserDto registerUser(UserDto userDto) {

        // User enable=false se create hota hai (email verify hone tak login nahi kar sakta)
        UserDto created = userService.createPendingUser(userDto);

        // OTP generate karo, Redis me store karo, email par bhejo
        String otp = otpService.generateAndStore(created.getEmail());
        mailService.sendOtpEmail(created.getEmail(), created.getName(), otp);

        return created;
    }
}
