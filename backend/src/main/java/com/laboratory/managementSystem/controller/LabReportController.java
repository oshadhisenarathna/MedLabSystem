package com.laboratory.managementSystem.controller;

import com.laboratory.managementSystem.dto.request.ReportResultDTO;
import com.laboratory.managementSystem.dto.response.ReportViewDTO;
import com.laboratory.managementSystem.service.LabReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * [CLASS] LabReportController
 * Package  : com.laboratory.managementSystem.controller
 *
 * Endpoints (Technician-facing):
 *   GET    /api/reports/pending                      — Technician's pending + entered list  [TECHNICIAN]
 *   PUT    /api/reports/{id}/result                  — Enter a test result                  [TECHNICIAN]
 *   PATCH  /api/reports/{id}/verify                  — Verify / approve the result          [TECHNICIAN]
 *   PATCH  /api/reports/{id}/release                 — Generate PDF and release report      [TECHNICIAN, ADMIN]
 *
 * Endpoints (Receptionist / Admin):
 *   GET    /api/reports/patient/{patientId}          — All reports for a patient            [RECEPTIONIST, ADMIN]
 */
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class LabReportController {

    private final LabReportService labReportService;

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('TECHNICIAN','ADMIN')")
    public ResponseEntity<List<ReportViewDTO>> pending() {
        return ResponseEntity.ok(labReportService.getPendingReports());
    }


    @PutMapping("/{id}/result")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<ReportViewDTO> enterResult(
            @PathVariable Long id,
            @Valid @RequestBody ReportResultDTO dto,
            @RequestHeader("X-User-Id") Long technicianId) {
        return ResponseEntity.ok(labReportService.enterResult(id, dto.getResultValue(), technicianId));
    }

    @PatchMapping("/{id}/verify")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<ReportViewDTO> verify(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long technicianId) {
        return ResponseEntity.ok(labReportService.verifyResult(id, technicianId));
    }

    @PatchMapping("/{id}/release")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'ADMIN')")
    public ResponseEntity<ReportViewDTO> release(@PathVariable Long id) {
        return ResponseEntity.ok(labReportService.releaseReport(id));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    public ResponseEntity<List<ReportViewDTO>> byPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(labReportService.getReportsByPatient(patientId));
    }
}

