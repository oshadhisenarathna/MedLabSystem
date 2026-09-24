package com.laboratory.managementSystem.service;

import com.laboratory.managementSystem.entity.Appointment;

import java.time.LocalDate;
import java.util.List;

/**
 * [INTERFACE] AppointmentService
 * Package  : com.laboratory.managementSystem.service
 * Business logic contract for appointment booking and billing.
 */
public interface AppointmentService {

    /**
     * Receptionist books an appointment for a patient.
     * - Generates a unique invoice number (e.g. APP-20260607-001).
     * - Calculates total from the selected test IDs.
     * - Creates LabReport rows (status=PENDING) for each selected test.
     *   This adds them to the Technician's pending list automatically.
     */
    Appointment createAppointment(Long patientId, List<Long> testIds, Long receptionistId);

    /** Mark an appointment's payment as PAID. */
    Appointment markAsPaid(Long appointmentId);

    /** Fetch appointments for a specific patient (history). */
    List<Appointment> getAppointmentsByPatient(Long patientId);

    /** Fetch all appointments on a given day (daily report). */
    List<Appointment> getAppointmentsByDate(LocalDate date);

    /** Fetch a single appointment by ID. */
    Appointment findById(Long appointmentId);
}

