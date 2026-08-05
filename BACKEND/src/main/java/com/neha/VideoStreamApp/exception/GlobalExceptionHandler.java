package com.neha.VideoStreamApp.exception;

import com.neha.VideoStreamApp.dtos.response.ApiError;
import com.neha.VideoStreamApp.dtos.response.ErrorResponse;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.CredentialsExpiredException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    // ===================== Authentication =====================

    @ExceptionHandler({
            UsernameNotFoundException.class,
            BadCredentialsException.class,
            CredentialsExpiredException.class,
            DisabledException.class
    })
    public ResponseEntity<ApiError> handleAuthException(
            Exception ex,
            HttpServletRequest request) {

        log.warn("Authentication Error : {}", ex.getMessage());

        ApiError error = ApiError.of(
                HttpStatus.UNAUTHORIZED.value(),
                "Unauthorized",
                ex.getMessage(),
                request.getRequestURI()
        );

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    // ===================== JWT =====================

    @ExceptionHandler({
            ExpiredJwtException.class,
            JwtException.class
    })
    public ResponseEntity<ApiError> handleJwtException(
            Exception ex,
            HttpServletRequest request) {

        log.warn("JWT Error : {}", ex.getMessage());

        ApiError error = ApiError.of(
                HttpStatus.UNAUTHORIZED.value(),
                "Invalid Token",
                ex.getMessage(),
                request.getRequestURI()
        );

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    // ===================== Resource Not Found =====================

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFoundException(
            ResourceNotFoundException ex) {

        ErrorResponse response = new ErrorResponse(
                ex.getMessage(),
                HttpStatus.NOT_FOUND,
                HttpStatus.NOT_FOUND.value()
        );

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    // ===================== Bad Request =====================

    @ExceptionHandler({
            BadRequestException.class,
            IllegalArgumentException.class
    })
    public ResponseEntity<ErrorResponse> handleBadRequest(Exception ex) {

        ErrorResponse response = new ErrorResponse(
                ex.getMessage(),
                HttpStatus.BAD_REQUEST,
                HttpStatus.BAD_REQUEST.value()
        );

        return ResponseEntity.badRequest().body(response);
    }

    // ===================== Duplicate Resource =====================

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateResource(
            DuplicateResourceException ex) {

        ErrorResponse response = new ErrorResponse(
                ex.getMessage(),
                HttpStatus.CONFLICT,
                HttpStatus.CONFLICT.value()
        );

        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }

    // ===================== Video Processing =====================

    @ExceptionHandler(VideoProcessingException.class)
    public ResponseEntity<ErrorResponse> handleVideoProcessingException(
            VideoProcessingException ex) {

        ErrorResponse response = new ErrorResponse(
                ex.getMessage(),
                HttpStatus.INTERNAL_SERVER_ERROR,
                HttpStatus.INTERNAL_SERVER_ERROR.value()
        );

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(response);
    }

    // ===================== Validation =====================

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
            MethodArgumentNotValidException ex) {

        String message = ex.getBindingResult()
                .getFieldError()
                .getDefaultMessage();

        ErrorResponse response = new ErrorResponse(
                message,
                HttpStatus.BAD_REQUEST,
                HttpStatus.BAD_REQUEST.value()
        );

        return ResponseEntity.badRequest().body(response);
    }

    // ===================== Fallback =====================

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleException(
            Exception ex,
            HttpServletRequest request) {

        log.error("Unhandled Exception", ex);

        ApiError error = ApiError.of(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                ex.getMessage() != null ? ex.getMessage() : "Unexpected Error",
                request.getRequestURI()
        );

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(error);
    }
}