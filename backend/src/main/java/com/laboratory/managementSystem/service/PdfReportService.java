package com.laboratory.managementSystem.service;

import com.laboratory.managementSystem.entity.LabReport;

/**
 * [INTERFACE] PdfReportService
 * Package  : com.laboratory.managementSystem.service
 * Compiles lab result data into a formatted PDF report with:
 *   - Laboratory letterhead
 *   - Patient details
 *   - Test results with HIGH/LOW flags
 *   - QR code for online verification
 */
public interface PdfReportService {

    /**
     * Generates the PDF for a released LabReport.
     * Saves it to disk via FileStorageService and returns the relative file path
     * (e.g. /reports/2026/06/fbc-p001.pdf).
     */
    String generatePdf(LabReport report);
}

