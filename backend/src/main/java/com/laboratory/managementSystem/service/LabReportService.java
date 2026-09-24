package com.laboratory.managementSystem.service;

import com.laboratory.managementSystem.dto.response.ReportViewDTO;
import com.laboratory.managementSystem.entity.LabReport;

import java.util.List;

/**
 * [INTERFACE] LabReportService
 * Package  : com.laboratory.managementSystem.service
 * Business logic contract for the full report lifecycle:
 * PENDING → ENTERED → VERIFIED → RELEASED
 */
public interface LabReportService {

    /** Technician's dashboard: fetch all reports with status PENDING or ENTERED. */
    List<ReportViewDTO> getPendingReports();

    /** Technician enters a raw result value. Status transitions to ENTERED. */
    ReportViewDTO enterResult(Long reportId, String resultValue, Long technicianId);

    /**
     * Technician verifies (approves) a previously entered result.
     * Status transitions to VERIFIED.
     * Triggers automatic HIGH/LOW flag calculation vs. the test's referenceRange.
     */
    ReportViewDTO verifyResult(Long reportId, Long technicianId);

    /**
     * After verification, generate the PDF and release the report.
     * Status transitions to RELEASED.
     * Sends an SMS notification to the patient's mobile number.
     */
    ReportViewDTO releaseReport(Long reportId);

    /** Patient Portal / Receptionist: fetch all reports for a patient. */
    List<ReportViewDTO> getReportsByPatient(Long patientId);

    /**
     * Public portal endpoint used after QR scan + OTP verification.
     * Returns the report DTO (including PDF URL) for the given QR token.
     */
    ReportViewDTO getReportByQrToken(String qrToken);
}

