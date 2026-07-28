package com.neha.VideoStreamApp.exception;

import com.neha.VideoStreamApp.dtos.response.ApiError;
import com.neha.VideoStreamApp.dtos.response.ErrorResponse;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.CredentialsExpiredException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {


    private final Logger logger= LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler({
            UsernameNotFoundException.class,
            BadCredentialsException.class,
            CredentialsExpiredException.class,
            DisabledException.class

    })
    public ResponseEntity<ApiError> handleAuthException(Exception e, HttpServletRequest request){
        logger.warn("Auth exception: {}", e.getMessage());
       var apiError= ApiError.of(HttpStatus.UNAUTHORIZED.value(),"Unauthorized",e.getMessage(),request.getRequestURI());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(apiError);
    }

    //resource Didn't Find exception handler :: method
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFoundException(ResourceNotFoundException exception){
        ErrorResponse errorResponse = new ErrorResponse(exception.getMessage(), HttpStatus.NOT_FOUND,404);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgumentException(IllegalArgumentException exception){
        ErrorResponse errorResponse = new ErrorResponse(exception.getMessage(), HttpStatus.BAD_REQUEST,400);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    // Catch-all handler for RuntimeException and any other unhandled exceptions.
    // Without this, Spring returns the default HTML whitelabel error page instead of JSON.
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiError> handleRuntimeException(RuntimeException e, HttpServletRequest request) {
        logger.error("Unhandled RuntimeException at [{}]: {}", request.getRequestURI(), e.getMessage(), e);
        var apiError = ApiError.of(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                e.getMessage() != null ? e.getMessage() : "An unexpected error occurred",
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(apiError);
    }
}
