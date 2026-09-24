package com.laboratory.managementSystem.controller;



import com.laboratory.managementSystem.entity.Appointment;
import com.laboratory.managementSystem.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * [CLASS] AppointmentController
 * Package  : com.laboratory.managementSystem.controller
 *
 * Endpoints:
 *   POST   /api/appointments                          — Book appointment + create LabReport rows [RECEPTIONIST]
 *   PATCH  /api/appointments/{id}/pay                — Mark as paid                              [RECEPTIONIST]
 *   GET    /api/appointments/patient/{patientId}      — Appointment history for a patient         [RECEPTIONIST, ADMIN]
 *   GET    /api/appointments/date?date=2026-06-07     — Daily appointment list                    [ADMIN, RECEPTIONIST]
 *   GET    /api/appointments/{id}                     — Single appointment by ID                  [ADMIN, RECEPTIONIST]
 */
@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;


    @PostMapping
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    public ResponseEntity<Appointment> create(@RequestBody Map<String, Object> body) {
        Long patientId      = Long.valueOf(body.get("patientId").toString());
        Long receptionistId = Long.valueOf(body.get("receptionistId").toString());
        @SuppressWarnings("unchecked")
        List<Long> testIds  = ((List<Integer>) body.get("testIds"))
                .stream().map(Integer::longValue).toList();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(appointmentService.createAppointment(patientId, testIds, receptionistId));
    }

    @PatchMapping("/{id}/pay")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    public ResponseEntity<Appointment> markPaid(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.markAsPaid(id));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<List<Appointment>> byPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByPatient(patientId));
    }

    @GetMapping("/date")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<List<Appointment>> byDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByDate(date));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<Appointment> byId(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.findById(id));
    }
}
