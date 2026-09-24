package com.laboratory.managementSystem.service.impl;

import com.laboratory.managementSystem.config.JwtAuthFilter;
import com.laboratory.managementSystem.dto.request.AuthRequestDTO;
import com.laboratory.managementSystem.dto.request.OtpRequestDTO;
import com.laboratory.managementSystem.dto.response.AuthResponseDTO;
import com.laboratory.managementSystem.entity.OtpVerification;
import com.laboratory.managementSystem.entity.Patient;
import com.laboratory.managementSystem.entity.SystemUser;
import com.laboratory.managementSystem.exception.UnauthorizedException;
import com.laboratory.managementSystem.repository.OtpVerificationRepository;
import com.laboratory.managementSystem.repository.PatientRepository;
import com.laboratory.managementSystem.repository.UserRepository;
import com.laboratory.managementSystem.service.AuthService;
import com.laboratory.managementSystem.service.SmsService; // 💡 1. SmsService එක Import කරගත්තා
import com.laboratory.managementSystem.util.DateTimeUtil;
import com.laboratory.managementSystem.util.OtpGenerator;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * [CLASS] AuthServiceImpl
 * Package  : com.laboratory.managementSystem.service.impl
 * Implements AuthService.
 *
 * Staff login  : username + password → JWT with role claim
 * Patient login: NIC + mobile → OTP SMS → OTP verify → JWT with patient claim
 */
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository             userRepository;
    private final PatientRepository          patientRepository;
    private final OtpVerificationRepository  otpRepository;
    private final PasswordEncoder            passwordEncoder;
    private final OtpGenerator               otpGenerator;
    private final SmsService                 smsService;

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-ms:86400000}")
    private long jwtExpirationMs;

    // ── Staff Login ─────────────────────────────────────────────────────────────

    @Override
    public AuthResponseDTO loginStaff(AuthRequestDTO request) {
        SystemUser user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new UnauthorizedException("Invalid username or password."));

        if (!user.getIsActive()) {
            throw new UnauthorizedException("This account has been deactivated.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid username or password.");
        }

        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole().name());
        claims.put("userId", user.getId());

        String token = buildToken(user.getUsername(), claims);

        return AuthResponseDTO.builder()
                .token(token)
                .username(user.getUsername())
                .role(user.getRole())
                .isPasswordChanged(user.getIsPasswordChanged())
                .build();
    }

    @Override
    @Transactional
    public void changePasswordById(Long id, String currentPassword, String newPassword) {
        SystemUser user = userRepository.findById(id)
                .orElseThrow(() -> new UnauthorizedException("User not found with id: " + id));

        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new UnauthorizedException("Incorrect current password! Please try again.");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setIsPasswordChanged(true);
        userRepository.save(user);
    }

    // ── Patient OTP Flow ────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void requestPatientOtp(OtpRequestDTO request) {
        // Validate that NIC + mobile match the same patient record
        Patient patient = patientRepository.findByNic(request.getNic())
                .orElseThrow(() -> new UnauthorizedException("No patient found with the given NIC."));

        if (!patient.getMobile().equals(request.getMobile())) {
            throw new UnauthorizedException("Mobile number does not match the registered record.");
        }

        String code = otpGenerator.generate();

        OtpVerification otp = OtpVerification.builder()
                .mobile(patient.getMobile())
                .otp(code)
                .expiresAt(DateTimeUtil.otpExpiry())
                .isUsed(false)
                .build();

        otpRepository.save(otp);


        smsService.sendOtpSms(patient.getMobile(), code);
    }


    @Override
    @Transactional
    public String verifyPatientOtp(String nic, String otp) {


        Patient patient = patientRepository.findByNic(nic)
                .orElseThrow(() -> new UnauthorizedException("Patient not found with the given NIC."));


        String mobile = patient.getMobile();

        OtpVerification record = otpRepository
                .findTopByMobileAndIsUsedFalseAndExpiresAtAfterOrderByIdDesc(mobile, LocalDateTime.now())
                .orElseThrow(() -> new UnauthorizedException("OTP has expired or was not found. Please request a new one."));

        if (!record.getOtp().equals(otp)) {
            throw new UnauthorizedException("Incorrect OTP.");
        }


        record.setIsUsed(true);
        otpRepository.save(record);

        Map<String, Object> claims = new HashMap<>();
        claims.put("role", "PATIENT");
        claims.put("patientId", patient.getId());

        return buildToken(patient.getNic(), claims);
    }

    // ── Helpers ─────────────────────────────────────────────────────────────────

    private String buildToken(String subject, Map<String, Object> claims) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(Keys.hmacShaKeyFor(jwtSecret.getBytes()), SignatureAlgorithm.HS256)
                .compact();
    }
}