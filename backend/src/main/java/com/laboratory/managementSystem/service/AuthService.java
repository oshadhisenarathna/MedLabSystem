package com.laboratory.managementSystem.service;

import com.laboratory.managementSystem.dto.request.AuthRequestDTO;
import com.laboratory.managementSystem.dto.request.OtpRequestDTO;
import com.laboratory.managementSystem.dto.response.AuthResponseDTO;

/**
 * [INTERFACE] AuthService
 * Package  : com.laboratory.managementSystem.service
 * Two separate authentication flows:
 * 1. Staff login  — username + password → JWT
 * 2. Patient login — NIC + mobile → OTP → short-lived JWT
 */
public interface AuthService {

    /**
     * Authenticates a staff member (Admin / Receptionist / Technician).
     * Returns a JWT token. Also signals if a forced password change is required.
     */
    AuthResponseDTO loginStaff(AuthRequestDTO request);

    /**
     * Step 1 of the Patient Portal login:
     * Validates that NIC matches the registered mobile, generates a 6-digit OTP,
     * saves it to the database, and sends it via SMS.
     */
    void requestPatientOtp(OtpRequestDTO request);

    /**
     * Step 2 of the Patient Portal login:
     * Validates the OTP using the patient's NIC, marks it as used, and returns a short-lived JWT
     * scoped to the patient's account.
     */
    String verifyPatientOtp(String nic, String otp);

    /**
     * Changes the staff member's password using their User ID.
     * Updates the password and sets the password changed flag to true.
     */
    void changePasswordById(Long id, String currentPassword, String newPassword);
}