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
import java.util.Optional;
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
        return createUserInternal(userDto, true);
    }

    @Override
    public UserDto createPendingUser(UserDto userDto) {
        return createUserInternal(userDto, false);
    }

    private UserDto createUserInternal(UserDto userDto, boolean enable) {
        if(userDto.getEmail()==null || userDto.getEmail().isBlank()){
            throw new IllegalArgumentException("Email is Required");
        }
        if(userDto.getPassword()==null || userDto.getPassword().isBlank()){
            throw new IllegalArgumentException("Password is Required");
        }

        // Strong password enforcement (registration)
        validatePassword(userDto.getPassword());

        String cleanEmail = userDto.getEmail().trim();
        Optional<User> existingUserOpt = userRepository.findByEmail(cleanEmail)
                .or(() -> userRepository.findByEmail(cleanEmail.toLowerCase()));

        if (existingUserOpt.isPresent()) {
            User existingUser = existingUserOpt.get();
            if (existingUser.isEnable()) {
                throw new IllegalArgumentException("Email already exists");
            }
            // If the user was pending verification, update details with new registration info
            existingUser.setName(userDto.getName());
            existingUser.setPassword(passwordEncoder.encode(userDto.getPassword()));
            existingUser.setProvider(userDto.getProvider() != null ? userDto.getProvider() : Provider.LOCAL);
            existingUser.setEnable(enable);
            User savedUser = userRepository.save(existingUser);
            return modelMapper.map(savedUser, UserDto.class);
        }


        User user = modelMapper.map(userDto, User.class);
        user.setProvider(userDto.getProvider()!=null ? userDto.getProvider() : Provider.LOCAL);

        user.setPassword(
                passwordEncoder.encode(userDto.getPassword())
        );
        // Email verification ke liye account initially disabled rahega —
        // OTP verify hone par enable=true ho jayega (AuthController.verifyOtp)
        user.setEnable(enable);
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

        // Name update
        if (userDto.getName() != null && !userDto.getName().isBlank()) {
            existingUser.setName(userDto.getName().trim());
        }

        if(userDto.getPassword()!=null && !userDto.getPassword().isBlank())
            existingUser.setPassword(passwordEncoder.encode(userDto.getPassword()));

        existingUser.setUpdatedAt(Instant.now());
        User updatedUser = userRepository.save(existingUser);

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
