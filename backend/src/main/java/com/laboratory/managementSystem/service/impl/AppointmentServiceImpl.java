package com.laboratory.managementSystem.service.impl;

import com.laboratory.managementSystem.entity.*;
import com.laboratory.managementSystem.exception.ResourceNotFoundException;
import com.laboratory.managementSystem.repository.*;
import com.laboratory.managementSystem.service.AppointmentService;
import com.laboratory.managementSystem.util.DateTimeUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * [CLASS] AppointmentServiceImpl
 * Package  : com.laboratory.managementSystem.service.impl
 * Implements AppointmentService.
 *
 * Key side-effect: createAppointment also creates one LabReport row
 * (status = PENDING) per selected test, which immediately appears in
 * the Technician's pending list.
 */
@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final LabReportRepository   labReportRepository;
    private final PatientRepository     patientRepository;
    private final LabTestRepository     labTestRepository;
    private final UserRepository        userRepository;

    @Override
    @Transactional
    public Appointment createAppointment(Long patientId, List<Long> testIds, Long receptionistId) {

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found: " + patientId));

        SystemUser receptionist = userRepository.findById(receptionistId)
                .orElseThrow(() -> new ResourceNotFoundException("Receptionist not found: " + receptionistId));

        List<LabTest> tests = labTestRepository.findAllById(testIds);
        if (tests.size() != testIds.size()) {
            throw new ResourceNotFoundException("One or more test IDs are invalid.");
        }

        BigDecimal total = tests.stream()
                .map(LabTest::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        String invoiceNo = DateTimeUtil.generateInvoiceNo();

        Appointment appointment = Appointment.builder()
                .invoiceNo(invoiceNo)
                .patient(patient)
                .receptionist(receptionist)
                .totalAmount(total)
                .appointmentDate(LocalDateTime.now())
                .paymentStatus(Appointment.PaymentStatus.PENDING)
                .build();


        appointment = appointmentRepository.save(appointment);


        final Appointment savedAppointment = appointment;
        List<LabReport> reports = tests.stream()
                .map(test -> LabReport.builder()
                        .appointment(savedAppointment)
                        .patient(patient)
                        .labTest(test)
                        .status(LabReport.ReportStatus.PENDING)
                        .qrToken(UUID.randomUUID().toString())
                        .build())
                .toList();

        labReportRepository.saveAll(reports);


        return savedAppointment;
    }

    @Override
    @Transactional
    public Appointment markAsPaid(Long appointmentId) {

        Appointment appointment = findById(appointmentId);
        appointment.setPaymentStatus(Appointment.PaymentStatus.PAID);


        return appointmentRepository.saveAndFlush(appointment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Appointment> getAppointmentsByPatient(Long patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Appointment> getAppointmentsByDate(LocalDate date) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end   = date.plusDays(1).atStartOfDay();
        return appointmentRepository.findByAppointmentDateBetween(start, end);
    }

    @Override
    @Transactional(readOnly = true)
    public Appointment findById(Long appointmentId) {

        return appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found: " + appointmentId));
    }
}