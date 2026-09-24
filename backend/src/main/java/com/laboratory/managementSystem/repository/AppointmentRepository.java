package com.laboratory.managementSystem.repository;

import com.laboratory.managementSystem.entity.Appointment;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * [INTERFACE] AppointmentRepository
 * Package  : com.laboratory.managementSystem.repository
 * Data Access Layer for Appointment (billing / visit records).
 */
@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {


    @Override
    @EntityGraph(attributePaths = {"patient", "receptionist"})
    Optional<Appointment> findById(Long id);


    @EntityGraph(attributePaths = {"patient", "receptionist"})
    Optional<Appointment> findByInvoiceNo(String invoiceNo);


    @EntityGraph(attributePaths = {"patient", "receptionist"})
    List<Appointment> findByPatientId(Long patientId);


    @EntityGraph(attributePaths = {"patient", "receptionist"})
    List<Appointment> findByAppointmentDateBetween(LocalDateTime start, LocalDateTime end);
}