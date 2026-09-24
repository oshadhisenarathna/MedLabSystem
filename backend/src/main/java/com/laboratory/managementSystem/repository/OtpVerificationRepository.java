package com.laboratory.managementSystem.repository;

import com.laboratory.managementSystem.entity.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * [INTERFACE] OtpVerificationRepository
 * Package  : com.laboratory.managementSystem.repository
 * Data Access Layer for OTP records in the Patient Portal login flow.
 */
@Repository
public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {

    /**
     * Find the latest valid (unused, not expired) OTP for a mobile number.
     * The service layer passes LocalDateTime.now() as the expiresAt check.
     */
    Optional<OtpVerification> findTopByMobileAndIsUsedFalseAndExpiresAtAfterOrderByIdDesc(
            String mobile, LocalDateTime now);

    /** Clean up all OTP records for a mobile (e.g. after successful login). */
    void deleteAllByMobile(String mobile);
}

