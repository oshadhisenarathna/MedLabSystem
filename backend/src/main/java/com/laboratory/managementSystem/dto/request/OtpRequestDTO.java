package com.laboratory.managementSystem.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * [CLASS] OtpRequestDTO
 * Package  : com.laboratory.managementSystem.dto.request
 * Payload for the Patient Portal OTP request step.
 * Patient provides their NIC (or Lab No.) and registered mobile number.
 * Mapped from POST /api/portal/request-otp
 */
@Data
public class OtpRequestDTO {

    @NotBlank(message = "NIC is required")
    private String nic;

    @NotBlank(message = "Mobile number is required")
    private String mobile;
}
