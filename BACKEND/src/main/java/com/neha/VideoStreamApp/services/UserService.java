package com.neha.VideoStreamApp.services;

import com.neha.VideoStreamApp.dtos.UserDto;

public interface UserService {


    //create user
    UserDto createUser(UserDto userDto);

    //get all users
    Iterable<UserDto> getAllUsers();

    //get user by email
    UserDto getUserByEmail(String email);

    //get user by id
    UserDto getUserById(String userId);

    //update user
    UserDto updateUser(UserDto userDto, String userId);

    //delete user
    void deleteUser(String userId);


}


