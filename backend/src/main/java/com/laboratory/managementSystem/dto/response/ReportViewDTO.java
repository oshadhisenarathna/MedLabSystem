package com.laboratory.managementSystem.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * [CLASS] ReportViewDTO
 * Package  : com.laboratory.managementSystem.dto.response
 * Formatted report data sent to the frontend (Patient Portal or Receptionist view).
 * Includes the result value AND whether it is flagged HIGH / LOW compared
 * to the lab test's reference range.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportViewDTO {

    private Long reportId;
    private String invoiceNo;

    // Patient info
    private String patientName;
    private String patientNic;
    private int    patientAge;
    private String patientGender;

    // Test info
    private String testCode;
    private String testName;
    private String referenceRange;

    // Result
    private String resultValue;


    private String resultFlag;

    private String status;
    private String pdfUrl;
    private LocalDateTime issuedDate;
}
