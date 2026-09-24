package com.laboratory.managementSystem.controller;

import com.laboratory.managementSystem.dto.response.ReportViewDTO;
import com.laboratory.managementSystem.service.FileStorageService;
import com.laboratory.managementSystem.service.LabReportService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * [CLASS] PortalController
 * Package  : com.laboratory.managementSystem.controller
 * Public-facing endpoints for the Patient Portal.
 */
@RestController
@RequestMapping("/api/portal")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class PortalController {

    private final LabReportService  labReportService;
    private final FileStorageService fileStorageService;


    @GetMapping("/r/{qrToken}")
    public ResponseEntity<ReportViewDTO> viewByQr(@PathVariable String qrToken) {
        return ResponseEntity.ok(labReportService.getReportByQrToken(qrToken));
    }


    @GetMapping("/reports/me")
    public ResponseEntity<List<ReportViewDTO>> myReports(
            @RequestHeader("X-Patient-Id") Long patientId) {
        return ResponseEntity.ok(labReportService.getReportsByPatient(patientId));
    }


    @GetMapping("/reports/**")
    public ResponseEntity<Resource> downloadPdf(HttpServletRequest request) {


        String requestURI = request.getRequestURI();
        String prefix = "/api/portal/reports/";

        String pdfPath = requestURI.substring(requestURI.indexOf(prefix) + prefix.length());
        if (pdfPath.endsWith("/pdf")) {
            pdfPath = pdfPath.substring(0, pdfPath.length() - 4);
        }


        Resource resource = fileStorageService.loadPdf("/" + pdfPath);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"report.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(resource);
    }
}