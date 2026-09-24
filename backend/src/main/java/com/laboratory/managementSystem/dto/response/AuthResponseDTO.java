package com.laboratory.managementSystem.dto.response;

import com.laboratory.managementSystem.entity.SystemUser;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * [CLASS] AuthResponseDTO
 * Package  : com.laboratory.managementSystem.dto.response
 * Returned to the client after a successful staff login.
 * The frontend stores the JWT and uses it in the Authorization header.
 * isPasswordChanged lets the frontend decide whether to redirect to
 * the forced-password-change screen.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponseDTO {

    private String token;
    private String username;
    private SystemUser.Role role;


    private boolean isPasswordChanged;
}

