package com.laboratory.managementSystem.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * [CLASS] Appointment
 * Package  : com.laboratory.managementSystem.entity
 * Created by the Receptionist when a patient comes in for tests.
 * Acts as the invoice / billing record for the visit.
 */
@Entity
@Table(name = "appointment")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(unique = true, nullable = false)
    private String invoiceNo;


    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id", nullable = false)
    @JsonIgnoreProperties({"appointments", "hibernateLazyInitializer", "handler"})
    private Patient patient;


    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "receptionist_id")
    @JsonIgnoreProperties({"appointments", "hibernateLazyInitializer", "handler", "password"})
    private SystemUser receptionist;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    private LocalDateTime appointmentDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    public enum PaymentStatus {
        PAID, PENDING
    }
}