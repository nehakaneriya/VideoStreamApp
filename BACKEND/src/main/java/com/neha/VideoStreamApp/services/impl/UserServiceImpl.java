package com.neha.VideoStreamApp.services.impl;

import com.neha.VideoStreamApp.cache.UserCacheService;
import com.neha.VideoStreamApp.config.AppConstants;
import com.neha.VideoStreamApp.dtos.common.UserDto;
import com.neha.VideoStreamApp.entities.Provider;
import com.neha.VideoStreamApp.entities.Role;
import com.neha.VideoStreamApp.entities.User;
import com.neha.VideoStreamApp.exception.ResourceNotFoundException;
import com.neha.VideoStreamApp.helper.UserHelper;
import com.neha.VideoStreamApp.repositories.RoleRepository;
import com.neha.VideoStreamApp.repositories.UserRepository;
import com.neha.VideoStreamApp.services.UserService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;
import java.util.stream.StreamSupport;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

   private final UserRepository userRepository;
   private final ModelMapper modelMapper;
   private final RoleRepository roleRepository;
   private final PasswordEncoder passwordEncoder;
   private final UserCacheService userCacheService;

    // Password policy — min 6 chars, at least one letter, one number, one special symbol
    private void validatePassword(String password) {
        if (password.length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters long");
        }
        if (!password.matches(".*[A-Za-z].*")) {
            throw new IllegalArgumentException("Password must contain at least one letter");
        }
        if (!password.matches(".*\\d.*")) {
            throw new IllegalArgumentException("Password must contain at least one number");
        }
        if (!password.matches(".*[^A-Za-z0-9].*")) {
            throw new IllegalArgumentException("Password must contain at least one special character");
        }
    }


    @Override
    public UserDto createUser(UserDto userDto) {
        if(userDto.getEmail()==null || userDto.getEmail().isBlank()){
            throw new IllegalArgumentException("Email is Required");
        }
        if(userDto.getPassword()==null || userDto.getPassword().isBlank()){
            throw new IllegalArgumentException("Password is Required");
        }

        // Strong password enforcement (registration)
        validatePassword(userDto.getPassword());

        if (userRepository.existsByEmail(userDto.getEmail())){
            throw new IllegalArgumentException("Email already exists");
        }


        User user = modelMapper.map(userDto, User.class);
        user.setProvider(userDto.getProvider()!=null ? userDto.getProvider() : Provider.LOCAL);

        user.setPassword(
                passwordEncoder.encode(userDto.getPassword())
        );
        // assign the default role
        Role role = roleRepository
                .findByName("ROLE_" + AppConstants.USER_ROLE)
                .orElseThrow(() -> new RuntimeException("Default role not found"));

        user.getRoles().add(role);
        User savedUser = userRepository.save(user);
        return modelMapper.map(savedUser,UserDto.class);
    }

    @Override
    @Transactional(readOnly = true)
    public Iterable<UserDto> getAllUsers() {

        return StreamSupport
                .stream(userRepository.findAll().spliterator(), false)
                .map(user -> modelMapper.map(user, UserDto.class))
                .toList();
    }

    @Override
    public UserDto getUserByEmail(String email) {

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with given email id"));

        return modelMapper.map(user,UserDto.class);
    }

    @Override
    public UserDto getUserById(String userId) {
        User user = userRepository.findById(UserHelper.parseUUID(userId)).orElseThrow(() -> new ResourceNotFoundException("User not found with the given id"));

        return modelMapper.map(user,UserDto.class);
    }

    @Override
    public UserDto updateUser(UserDto userDto, String userId) {
        UUID uId = UserHelper.parseUUID(userId);
        User existingUser=userRepository
                .findById(uId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with the given id"));
        //we are not going to change email id for this project
        if(userDto.getName()!=null)existingUser.setName(userDto.getName());
        // NOTE: provider yahan kabhi set nahi karte — UserDto mein provider ka
        // default LOCAL hota hai (UserDto.java), isliye agar profile update mein
        // {name, password} hi bheja jaye to ye provider ko LOCAL me override kar deta tha.
        // User ka provider (LOCAL/GOOGLE/GITHUB) fixed rehta hai, profile edit se change nahi hota.

        // Password update — sirf tab jab explicitly bheja gaya ho
        if(userDto.getPassword()!=null && !userDto.getPassword().isBlank())
            existingUser.setPassword(passwordEncoder.encode(userDto.getPassword()));

        // enable field — sirf ADMIN change kar sakta hai, profile update mein ignore karo
        // (UserDto mein default true hai, isliye blindly set karna dangerous hai)
        // UserServiceImpl caller ke paas context nahi — isliye yahan set nahi karte
        // AdminServiceImpl alag se handle karta hai
        existingUser.setUpdatedAt(Instant.now());
        User updatedUser = userRepository.save(existingUser);

        // Profile update hone par Redis user-cache bhi refresh karo —
        // nahi to JWT auth principal 60 min tak purana naam/roles rakhega
        userCacheService.evictUserCache(updatedUser.getId().toString());

        return modelMapper.map(updatedUser,UserDto.class);
    }

    @Override
    public void deleteUser(String userId) {

        UUID uId = UserHelper.parseUUID(userId);
        User user = userRepository.findById(uId).orElseThrow(() -> new ResourceNotFoundException("User not found with the given id"));
        userRepository.delete(user);

    }
}
