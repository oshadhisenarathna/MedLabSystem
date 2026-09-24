package com.laboratory.managementSystem.service.impl;

import com.laboratory.managementSystem.dto.request.PatientRegisterDTO;
import com.laboratory.managementSystem.entity.Patient;
import com.laboratory.managementSystem.exception.ResourceNotFoundException;
import com.laboratory.managementSystem.repository.PatientRepository;
import com.laboratory.managementSystem.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * [CLASS] PatientServiceImpl
 * Package  : com.laboratory.managementSystem.service.impl
 * Implements PatientService.
 */
@Service
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;

    @Override
    @Transactional
    public Patient registerPatient(PatientRegisterDTO dto) {
        if (patientRepository.existsByNic(dto.getNic())) {
            throw new IllegalArgumentException("A patient with NIC '" + dto.getNic() + "' already exists.");
        }
        if (patientRepository.existsByMobile(dto.getMobile())) {
            throw new IllegalArgumentException("Mobile number '" + dto.getMobile() + "' is already registered.");
        }
        Patient patient = Patient.builder()
                .nic(dto.getNic())
                .name(dto.getName())
                .mobile(dto.getMobile())
                .dob(dto.getDob())
                .gender(dto.getGender())
                .build();
        return patientRepository.save(patient);
    }

    @Override
    public Patient findById(Long patientId) {
        return patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + patientId));
    }

    @Override
    public Patient findByNic(String nic) {
        return patientRepository.findByNic(nic)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with NIC: " + nic));
    }

    @Override
    public Patient findByMobile(String mobile) {
        return patientRepository.findByMobile(mobile)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with mobile: " + mobile));
    }

    @Override
    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }
}

