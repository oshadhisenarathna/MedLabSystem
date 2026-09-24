package com.laboratory.managementSystem.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

/**
 * [CLASS] Patient
 * Package  : com.laboratory.managementSystem.entity
 * Stores patient personal details.
 * mobile is mandatory — used for OTP delivery and patient portal login.
 */
@Entity
@Table(name = "patient")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(unique = true, nullable = false)
    private String nic;

    @Column(nullable = false)
    private String name;


    @Column(nullable = false)
    private String mobile;


    private LocalDate dob;

    private String gender;
}
