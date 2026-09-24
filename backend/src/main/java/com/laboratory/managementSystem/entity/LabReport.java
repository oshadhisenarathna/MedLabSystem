package com.laboratory.managementSystem.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * [CLASS] LabReport
 * Package  : com.laboratory.managementSystem.entity
 * One row per individual test result for an appointment.
 * Technician fills in resultValue and verifies; PDF path + QR token
 * are populated once the report is generated and released.
 */
@Entity
@Table(name = "lab_report")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id", nullable = false)
    @JsonIgnore
    private Appointment appointment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    @JsonIgnore
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_id", nullable = false)
    private LabTest labTest;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "technician_id")
    private SystemUser technician;


    private String resultValue;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ReportStatus status = ReportStatus.PENDING;


    private String pdfUrl;


    @Column(unique = true)
    private String qrToken;

    private LocalDateTime issuedDate;

    public enum ReportStatus {
        PENDING,   // Appointment created, waiting for sample
        ENTERED,   // Technician entered result value
        VERIFIED,  // Technician approved / verified the result
        RELEASED   // PDF generated and report made available to patient
    }
}

