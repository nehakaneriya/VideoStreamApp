package com.neha.VideoStreamApp.services.impl;

import com.neha.VideoStreamApp.config.AppConstants;
import com.neha.VideoStreamApp.dtos.UserDto;
import com.neha.VideoStreamApp.repositories.RoleRepository;
import com.neha.VideoStreamApp.services.AuthService;
import com.neha.VideoStreamApp.services.UserService;
import lombok.AllArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
@AllArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private RoleRepository roleRepository;


    @Override
    public UserDto registerUser(UserDto userDto) {

        return userService.createUser(userDto);


    }
}
