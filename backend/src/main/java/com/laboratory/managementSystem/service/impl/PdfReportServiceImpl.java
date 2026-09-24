package com.laboratory.managementSystem.service.impl;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.laboratory.managementSystem.entity.LabReport;
import com.laboratory.managementSystem.entity.Patient;
import com.laboratory.managementSystem.service.FileStorageService;
import com.laboratory.managementSystem.service.PdfReportService;
import com.laboratory.managementSystem.util.QrCodeGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.time.format.DateTimeFormatter;

/**
 * [CLASS] PdfReportServiceImpl
 * Package  : com.laboratory.managementSystem.service.impl
 * Implements PdfReportService using iText 7.
 */
@Service
@RequiredArgsConstructor
public class PdfReportServiceImpl implements PdfReportService {

    private final FileStorageService fileStorageService;
    private final QrCodeGenerator    qrCodeGenerator;

    @Value("${app.portal.base-url:https://portal.yourlab.lk}")
    private String portalBaseUrl;

    @Value("${app.lab.name:City Medical Laboratory}")
    private String labName;

    @Value("${app.lab.address:123 Main Street, Colombo 07}")
    private String labAddress;

    @Override
    public String generatePdf(LabReport report) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

            PdfWriter   writer   = new PdfWriter(baos);
            PdfDocument pdfDoc   = new PdfDocument(writer);
            Document    document = new Document(pdfDoc);

            //  Letterhead
            document.add(new Paragraph(labName)
                    .setBold().setFontSize(18)
                    .setTextAlignment(TextAlignment.CENTER));
            document.add(new Paragraph(labAddress)
                    .setFontSize(10)
                    .setTextAlignment(TextAlignment.CENTER));
            document.add(new Paragraph("─────────────────────────────────────────────")
                    .setTextAlignment(TextAlignment.CENTER));

            // Patient details
            Patient patient = report.getPatient();
            int age = (patient.getDob() != null)
                    ? Period.between(patient.getDob(), LocalDate.now()).getYears()
                    : 0;

            document.add(new Paragraph("Patient Name : " + patient.getName()));
            document.add(new Paragraph("NIC          : " + patient.getNic()));
            document.add(new Paragraph("Age / Gender : " + age + " yrs / " + patient.getGender()));
            document.add(new Paragraph("Invoice No.  : " + report.getAppointment().getInvoiceNo()));


            LocalDateTime issuedDate = report.getIssuedDate() != null ? report.getIssuedDate() : LocalDateTime.now();
            document.add(new Paragraph("Issued Date  : " +
                    issuedDate.format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm"))));

            document.add(new Paragraph(" "));

            //  Result table
            Table table = new Table(UnitValue.createPercentArray(new float[]{3, 2, 2, 2}))
                    .useAllAvailableWidth();

            // Header row
            for (String header : new String[]{"Test", "Result", "Reference Range", "Flag"}) {
                table.addHeaderCell(new Cell()
                        .add(new Paragraph(header).setBold())
                        .setBackgroundColor(new DeviceRgb(0, 102, 204))
                        .setFontColor(ColorConstants.WHITE));
            }

            // Data row
            String flag = calculateFlag(
                    report.getResultValue(),
                    report.getLabTest().getReferenceRange());

            table.addCell(report.getLabTest().getTestName());
            table.addCell(report.getResultValue() != null ? report.getResultValue() : "-");
            table.addCell(report.getLabTest().getReferenceRange() != null
                    ? report.getLabTest().getReferenceRange() : "-");

            Cell flagCell = new Cell().add(new Paragraph(flag));
            if ("HIGH".equals(flag) || "LOW".equals(flag)) {
                flagCell.setFontColor(ColorConstants.RED).setBold();
            }
            table.addCell(flagCell);
            document.add(table);

            //  QR code
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Scan QR code to verify this report online:")
                    .setFontSize(9));
            String qrUrl = portalBaseUrl + "/r/" + report.getQrToken();

            byte[] qrBytes = qrCodeGenerator.generateQrCodeBytes(qrUrl, 100, 100);
            com.itextpdf.io.image.ImageData imgData =
                    com.itextpdf.io.image.ImageDataFactory.create(qrBytes);
            document.add(new com.itextpdf.layout.element.Image(imgData));

            document.close();

            //  Save to disk
            String filename = report.getLabTest().getTestCode().toLowerCase()
                    + "-p" + report.getPatient().getId()
                    + "-" + report.getId() + ".pdf";

            return fileStorageService.savePdf(baos.toByteArray(), filename);

        } catch (Exception e) {
            throw new com.laboratory.managementSystem.exception.FileStorageException(
                    "Failed to generate PDF for report id=" + report.getId(), e);
        }
    }

    private String calculateFlag(String resultValue, String referenceRange) {
        if (resultValue == null || referenceRange == null) return "N/A";
        try {
            double value  = Double.parseDouble(resultValue.trim());
            String[] parts = referenceRange.split("-");
            if (parts.length == 2) {
                double low  = Double.parseDouble(parts[0].trim().replaceAll("[^0-9.]", ""));
                double high = Double.parseDouble(parts[1].trim().replaceAll("[^0-9.]", ""));
                if (value < low)  return "LOW";
                if (value > high) return "HIGH";
                return "NORMAL";
            }
        } catch (NumberFormatException ignored) {}
        return "N/A";
    }
}