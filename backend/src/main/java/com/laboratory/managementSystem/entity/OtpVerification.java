package com.laboratory.managementSystem.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * [CLASS] OtpVerification
 * Package  : com.laboratory.managementSystem.entity
 * Stores single-use OTP codes for the Patient Portal login flow.
 * Each OTP expires after a short window (e.g. 5 minutes) and can only
 * be used once (isUsed flag prevents replay attacks).
 */
@Entity
@Table(name = "otp_verification",
        indexes = @Index(name = "idx_otp_mobile", columnList = "mobile"))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtpVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(nullable = false)
    private String mobile;


    @Column(nullable = false)
    private String otp;


    @Column(nullable = false)
    private LocalDateTime expiresAt;


    @Column(nullable = false)
    @Builder.Default
    private Boolean isUsed = false;
}
