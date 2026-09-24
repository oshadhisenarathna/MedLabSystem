package com.laboratory.managementSystem.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * [CLASS] ResourceNotFoundException  (extends RuntimeException)
 * Package  : com.laboratory.managementSystem.exception
 * Thrown when a requested entity (patient, report, user, etc.) does not exist
 * in the database. GlobalExceptionHandler maps this to HTTP 404.
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
