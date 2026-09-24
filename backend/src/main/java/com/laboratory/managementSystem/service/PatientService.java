package com.laboratory.managementSystem.service;

import com.laboratory.managementSystem.dto.request.PatientRegisterDTO;
import com.laboratory.managementSystem.entity.Patient;

import java.util.List;

/**
 * [INTERFACE] PatientService
 * Package  : com.laboratory.managementSystem.service
 * Business logic contract for patient profile management.
 * Receptionists register patients; all roles can search.
 */
public interface PatientService {

    /** Receptionist registers a new patient. Validates NIC and mobile uniqueness. */
    Patient registerPatient(PatientRegisterDTO dto);

    /** Fetch a patient by their database ID. */
    Patient findById(Long patientId);

    /** Search by NIC — used at reception when a patient arrives again. */
    Patient findByNic(String nic);

    /** Search by mobile number — used in OTP verification flow. */
    Patient findByMobile(String mobile);

    /** List all patients (Admin / Receptionist view). */
    List<Patient> getAllPatients();
}

