package com.laboratory.managementSystem.util;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;

/**
 * [CLASS] OtpGenerator
 * Package  : com.laboratory.managementSystem.util
 * Generates a cryptographically secure 6-digit OTP using SecureRandom.
 * SecureRandom is used instead of Math.random() to prevent predictable codes.
 */
@Component
public class OtpGenerator {

    private static final SecureRandom RANDOM  = new SecureRandom();
    private static final int          DIGITS  = 6;
    private static final int          MODULUS = 1_000_000; // 10^6

    /**
     * Returns a zero-padded 6-digit string, e.g. "048293".
     */
    public String generate() {
        int code = RANDOM.nextInt(MODULUS);
        return String.format("%0" + DIGITS + "d", code);
    }
}

