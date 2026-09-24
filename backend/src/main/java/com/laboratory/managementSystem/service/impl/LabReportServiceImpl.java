package com.laboratory.managementSystem.service.impl;

import com.laboratory.managementSystem.dto.response.ReportViewDTO;
import com.laboratory.managementSystem.entity.LabReport;
import com.laboratory.managementSystem.entity.Patient;
import com.laboratory.managementSystem.entity.SystemUser;
import com.laboratory.managementSystem.exception.ResourceNotFoundException;
import com.laboratory.managementSystem.exception.UnauthorizedException;
import com.laboratory.managementSystem.repository.LabReportRepository;
import com.laboratory.managementSystem.repository.UserRepository;
import com.laboratory.managementSystem.service.LabReportService;
import com.laboratory.managementSystem.service.PdfReportService;
import com.laboratory.managementSystem.service.SmsService;
import com.laboratory.managementSystem.util.DateTimeUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.Period;
import java.util.List;

/**
 * [CLASS] LabReportServiceImpl
 * Package  : com.laboratory.managementSystem.service.impl
 * Implements LabReportService.
 */
@Service
@RequiredArgsConstructor
public class LabReportServiceImpl implements LabReportService {

    private final LabReportRepository labReportRepository;
    private final UserRepository      userRepository;
    private final PdfReportService    pdfReportService;
    private final SmsService          smsService;

    // ── Technician actions ──────────────────────────────────────────────────────

    @Override
    public List<ReportViewDTO> getPendingReports() {
        List<LabReport> pending  = labReportRepository.findByStatus(LabReport.ReportStatus.PENDING);
        List<LabReport> entered  = labReportRepository.findByStatus(LabReport.ReportStatus.ENTERED);
        List<LabReport> verified = labReportRepository.findByStatus(LabReport.ReportStatus.VERIFIED);

        pending.addAll(entered);
        pending.addAll(verified);

        return pending.stream().map(this::toDto).toList();
    }

    @Override
    @Transactional
    public ReportViewDTO enterResult(Long reportId, String resultValue, Long technicianId) {
        LabReport report = getReport(reportId);
        SystemUser tech  = getTechnician(technicianId);

        report.setResultValue(resultValue);
        report.setTechnician(tech);
        report.setStatus(LabReport.ReportStatus.ENTERED);

        return toDto(labReportRepository.save(report));
    }

    @Override
    @Transactional
    public ReportViewDTO verifyResult(Long reportId, Long technicianId) {
        LabReport report = getReport(reportId);
        if (report.getStatus() != LabReport.ReportStatus.ENTERED) {
            throw new UnauthorizedException("Report must be in ENTERED status before it can be verified.");
        }
        SystemUser tech = getTechnician(technicianId);
        report.setTechnician(tech);
        report.setStatus(LabReport.ReportStatus.VERIFIED);
        return toDto(labReportRepository.save(report));
    }

    @Override
    @Transactional
    public ReportViewDTO releaseReport(Long reportId) {
        LabReport report = getReport(reportId);
        if (report.getStatus() != LabReport.ReportStatus.VERIFIED) {
            throw new UnauthorizedException("Report must be VERIFIED before it can be released.");
        }


        report.setIssuedDate(LocalDateTime.now());


        String pdfPath = pdfReportService.generatePdf(report);
        report.setPdfUrl(pdfPath);
        report.setStatus(LabReport.ReportStatus.RELEASED);

        LabReport saved = labReportRepository.save(report);


        try {
            if (saved.getPatient().getMobile() != null && !saved.getPatient().getMobile().isEmpty()) {
                smsService.sendReportReadySms(
                        saved.getPatient().getMobile(),
                        saved.getPatient().getName(),
                        saved.getLabTest().getTestName(),
                        saved.getQrToken()
                );
            }
        } catch (Exception e) {
            System.err.println("👉 ACTUAL Twilio SMS Sending Failed: " + e.getMessage());
        }

        return toDto(saved);
    }

    // ── Patient / Receptionist views ────────────────────────────────────────────

    @Override
    public List<ReportViewDTO> getReportsByPatient(Long patientId) {
        return labReportRepository.findByPatientId(patientId)
                .stream().map(this::toDto).toList();
    }

    @Override
    public ReportViewDTO getReportByQrToken(String qrToken) {
        LabReport report = labReportRepository.findByQrToken(qrToken)
                .orElseThrow(() -> new ResourceNotFoundException("No report found for QR token: " + qrToken));
        return toDto(report);
    }

    // ── Private helpers ─────────────────────────────────────────────────────────

    private LabReport getReport(Long reportId) {
        return labReportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Lab report not found: " + reportId));
    }

    private SystemUser getTechnician(Long technicianId) {
        return userRepository.findById(technicianId)
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found: " + technicianId));
    }

    private ReportViewDTO toDto(LabReport report) {
        Patient patient = report.getPatient();
        int age = (patient.getDob() != null)
                ? Period.between(patient.getDob(), java.time.LocalDate.now()).getYears()
                : 0;

        String flag = calculateFlag(report.getResultValue(), report.getLabTest().getReferenceRange());

        return ReportViewDTO.builder()
                .reportId(report.getId())
                .invoiceNo(report.getAppointment().getInvoiceNo())
                .patientName(patient.getName())
                .patientNic(patient.getNic())
                .patientAge(age)
                .patientGender(patient.getGender())
                .testCode(report.getLabTest().getTestCode())
                .testName(report.getLabTest().getTestName())
                .referenceRange(report.getLabTest().getReferenceRange())
                .resultValue(report.getResultValue())
                .resultFlag(flag)
                .status(report.getStatus().name())
                .pdfUrl(report.getPdfUrl())
                .issuedDate(report.getIssuedDate())
                .build();
    }


    private String calculateFlag(String resultValue, String referenceRange) {
        if (resultValue == null || referenceRange == null) return "N/A";
        try {
            double value = Double.parseDouble(resultValue.trim());
            String[] parts = referenceRange.split("-");
            if (parts.length == 2) {
                double low  = Double.parseDouble(parts[0].trim().replaceAll("[^0-9.]", ""));
                double high = Double.parseDouble(parts[1].trim().replaceAll("[^0-9.]", ""));
                if (value < low)  return "LOW";
                if (value > high) return "HIGH";
                return "NORMAL";
            }
        } catch (Exception e) {
            System.err.println("Flag Calculation Notation Note: " + e.getMessage() + " for value [" + resultValue + "]");
        }
        return "N/A";
    }
}