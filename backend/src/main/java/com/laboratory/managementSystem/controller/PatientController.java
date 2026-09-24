package com.laboratory.managementSystem.controller;

import com.laboratory.managementSystem.dto.request.PatientRegisterDTO;
import com.laboratory.managementSystem.entity.Patient;
import com.laboratory.managementSystem.service.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * [CLASS] PatientController
 * Package  : com.laboratory.managementSystem.controller
 *
 * Endpoints:
 *   POST   /api/patients/register        — Register a new patient  [RECEPTIONIST, ADMIN]
 *   GET    /api/patients                 — List all patients        [ADMIN, RECEPTIONIST]
 *   GET    /api/patients/{id}            — Get patient by ID        [ADMIN, RECEPTIONIST, TECHNICIAN]
 *   GET    /api/patients/nic/{nic}       — Search by NIC            [ADMIN, RECEPTIONIST]
 */
@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @PostMapping("/register")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<Patient> register(@Valid @RequestBody PatientRegisterDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(patientService.registerPatient(dto));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<List<Patient>> getAllPatients() {
        return ResponseEntity.ok(patientService.getAllPatients());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'TECHNICIAN')")
    public ResponseEntity<Patient> getById(@PathVariable Long id) {
        return ResponseEntity.ok(patientService.findById(id));
    }

    @GetMapping("/nic/{nic}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<Patient> getByNic(@PathVariable String nic) {
        return ResponseEntity.ok(patientService.findByNic(nic));
    }
}

