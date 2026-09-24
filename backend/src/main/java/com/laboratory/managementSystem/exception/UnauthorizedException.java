package com.laboratory.managementSystem.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * [CLASS] UnauthorizedException  (extends RuntimeException)
 * Package  : com.laboratory.managementSystem.exception
 * Thrown for:
 *   - Invalid username/password on staff login
 *   - Incorrect or expired OTP on patient portal login
 *   - Trying to perform a state transition out of order (e.g. releasing an unverified report)
 * GlobalExceptionHandler maps this to HTTP 401.
 */
@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class UnauthorizedException extends RuntimeException {

    public UnauthorizedException(String message) {
        super(message);
    }
}
