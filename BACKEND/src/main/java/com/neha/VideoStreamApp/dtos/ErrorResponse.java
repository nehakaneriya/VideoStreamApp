package com.neha.VideoStreamApp.dtos;

import org.springframework.http.HttpStatus;

public record ErrorResponse(
        String message,
        HttpStatus httpStatus,
        int statusCode
      )
{
}
