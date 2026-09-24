package com.laboratory.managementSystem.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException; // 💡 අලුතින් එකතු කළ import එක

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * [CLASS] GlobalExceptionHandler
 * Package  : com.laboratory.managementSystem.exception
 *
 * @RestControllerAdvice intercepts ALL exceptions thrown by any controller
 * and returns clean, consistent JSON error bodies instead of Spring's
 * default white-label error page.
 *
 * Error response format:
 * {
 * "timestamp": "2026-06-07T14:35:00",
 * "status": 404,
 * "error": "Not Found",
 * "message": "Patient not found with NIC: 199012345678"
 * }
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    // ── 404 ─────────────────────────────────────────────────────────────────────
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(ResourceNotFoundException ex) {
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    // ── 401 ─────────────────────────────────────────────────────────────────────
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<Map<String, Object>> handleUnauthorized(UnauthorizedException ex) {
        return buildResponse(HttpStatus.UNAUTHORIZED, ex.getMessage());
    }

    // ── 500 ─────────────────────────────────────────────────────────────────────
    @ExceptionHandler(FileStorageException.class)
    public ResponseEntity<Map<String, Object>> handleFileStorage(FileStorageException ex) {
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage());
    }

    // ── 400 — Business rule violations ──────────────────────────────────────────
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArg(IllegalArgumentException ex) {
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    // ── 400 — Type conversion / Path variable mismatches (undefined handling) ───
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, Object>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        String providedValue = String.valueOf(ex.getValue());
        String message;

        // ෆ්‍රන්ට්එන්ඩ් එකෙන් වැරදිලාවත් 'undefined' කියලා එවුවොත් ඒක හඳුනාගෙන දෙන පණිවිඩය
        if ("undefined".equals(providedValue)) {
            message = "Invalid Request: The frontend sent a literal 'undefined' string as an ID path variable.";
        } else {
            String requiredType = ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "unknown";
            message = String.format("Parameter '%s' should be of type '%s'. Provided value: '%s'",
                    ex.getName(), requiredType, providedValue);
        }

        return buildResponse(HttpStatus.BAD_REQUEST, message);
    }

    // ── 400 — @Valid / @Validated field errors ───────────────────────────────────
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(fe.getField(), fe.getDefaultMessage());
        }
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status",  HttpStatus.BAD_REQUEST.value());
        body.put("error",   "Validation Failed");
        body.put("details", fieldErrors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    // ── 500 — Catch-all ──────────────────────────────────────────────────────────
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneric(Exception ex) {
        ex.printStackTrace(); // log to console; replace with a proper logger in production
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR,
                "An unexpected error occurred. Please contact the administrator.");
    }

    // ── Helper ───────────────────────────────────────────────────────────────────
    private ResponseEntity<Map<String, Object>> buildResponse(HttpStatus status, String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status",  status.value());
        body.put("error",   status.getReasonPhrase());
        body.put("message", message);
        return ResponseEntity.status(status).body(body);
    }
}