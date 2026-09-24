package com.laboratory.managementSystem.controller;

import com.laboratory.managementSystem.dto.request.AuthRequestDTO;
import com.laboratory.managementSystem.dto.request.OtpRequestDTO;
import com.laboratory.managementSystem.dto.response.AuthResponseDTO;
import com.laboratory.managementSystem.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * [CLASS] AuthController
 * Package  : com.laboratory.managementSystem.controller
 *
 * Endpoints:
 * POST /api/auth/login                       — Staff login (Admin / Receptionist / Technician)
 * POST /api/auth/request-otp                 — Patient portal: sends OTP to registered mobile
 * POST /api/auth/verify-otp                  — Patient portal: validates OTP and returns JWT
 * POST /api/auth/users/{id}/change-password  — Routed via public auth to bypass Spring Security
 *SecurityConfig excludes /api/auth/** from authentication.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthService authService;


    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody AuthRequestDTO request) {
        return ResponseEntity.ok(authService.loginStaff(request));
    }


    @PostMapping("/request-otp")
    public ResponseEntity<Map<String, String>> requestOtp(@Valid @RequestBody OtpRequestDTO request) {
        authService.requestPatientOtp(request);
        return ResponseEntity.ok(Map.of("message", "OTP sent to your registered mobile number."));
    }


    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, String>> verifyOtp(@RequestBody Map<String, String> body) {

        String nic = body.get("nic");
        String otp = body.get("otp");


        String token  = authService.verifyPatientOtp(nic, otp);
        return ResponseEntity.ok(Map.of("token", token));
    }


    @PostMapping("/users/{id}/change-password")
    public ResponseEntity<Map<String, String>> changePasswordById(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        String currentPassword = body.get("currentPassword");
        String newPassword     = body.get("newPassword");

        authService.changePasswordById(id, currentPassword, newPassword);

        return ResponseEntity.ok(Map.of("message", "Password changed successfully."));
    }
}