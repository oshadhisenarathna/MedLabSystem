package com.laboratory.managementSystem.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * [CLASS] AuthRequestDTO
 * Package  : com.laboratory.managementSystem.dto.request
 * Payload for system staff login (Admin / Receptionist / Technician).
 * Mapped from POST /api/auth/login
 */
@Data
public class AuthRequestDTO {

    @NotBlank(message = "Username is required")
    private String username;

    @NotBlank(message = "Password is required")
    private String password;
}

