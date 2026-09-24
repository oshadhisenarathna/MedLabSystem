package com.laboratory.managementSystem.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * [CLASS] FileStorageException  (extends RuntimeException)
 * Package  : com.laboratory.managementSystem.exception
 * Thrown when:
 *   - The PDF directory cannot be created on startup
 *   - Writing a PDF to disk fails
 *   - Reading a PDF from disk fails (file missing or unreadable)
 * GlobalExceptionHandler maps this to HTTP 500.
 */
@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class FileStorageException extends RuntimeException {

    public FileStorageException(String message, Throwable cause) {
        super(message, cause);
    }
}

