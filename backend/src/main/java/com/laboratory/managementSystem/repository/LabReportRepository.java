package com.laboratory.managementSystem.repository;

import com.laboratory.managementSystem.entity.LabReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * [INTERFACE] LabReportRepository
 * Package  : com.laboratory.managementSystem.repository
 * Data Access Layer for LabReport (test results + PDF management).
 */
@Repository
public interface LabReportRepository extends JpaRepository<LabReport, Long> {

    /** Used by the public portal endpoint when a QR code is scanned. */
    Optional<LabReport> findByQrToken(String qrToken);

    /** Patient Portal — fetch all reports belonging to a patient. */
    List<LabReport> findByPatientId(Long patientId);

    /** Technician dashboard — fetch all PENDING tests across all patients. */
    List<LabReport> findByStatus(LabReport.ReportStatus status);

    /** Technician dashboard — fetch pending tests for a specific appointment. */
    List<LabReport> findByAppointmentId(Long appointmentId);
}

