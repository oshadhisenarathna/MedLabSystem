package com.laboratory.managementSystem.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.time.LocalDate;

/**
 * [CLASS] PatientRegisterDTO
 * Package  : com.laboratory.managementSystem.dto.request
 * Payload used by the Receptionist to register a new patient.
 * Mapped from POST /api/patients/register
 */
@Data
public class PatientRegisterDTO {

    @NotBlank(message = "NIC is required")
    private String nic;

    @NotBlank(message = "Name is required")
    private String name;

    /** Mobile is mandatory — used for OTP delivery and Patient Portal login. */
    @NotBlank(message = "Mobile number is required")
    @Pattern(regexp = "^\\d{10}$", message = "Mobile must be a 10-digit number")
    private String mobile;

    private LocalDate dob;

    private String gender;
}

