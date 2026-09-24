package com.laboratory.managementSystem.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

/**
 * [CLASS] LabTest
 * Package  : com.laboratory.managementSystem.entity
 * Master catalogue of all medical tests offered by the laboratory.
 * Admin manages (add / edit) these records.
 */
@Entity
@Table(name = "lab_test")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabTest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(unique = true, nullable = false)
    private String testCode;


    @Column(nullable = false)
    private String testName;


    private String referenceRange;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;
}
