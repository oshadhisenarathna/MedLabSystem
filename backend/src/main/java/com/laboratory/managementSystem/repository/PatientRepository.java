package com.laboratory.managementSystem.repository;

import com.laboratory.managementSystem.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * [INTERFACE] PatientRepository
 * Package  : com.laboratory.managementSystem.repository
 * Data Access Layer for Patient records.
 */
@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

    /** Patient Portal login — patients identify themselves by NIC. */
    Optional<Patient> findByNic(String nic);

    /** Look up patient by mobile number (used during OTP flow). */
    Optional<Patient> findByMobile(String mobile);

    /** Prevent duplicate NIC registrations at the service layer. */
    boolean existsByNic(String nic);

    /** Prevent duplicate mobile registrations. */
    boolean existsByMobile(String mobile);
}

