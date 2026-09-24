package com.laboratory.managementSystem.service.impl;

import com.laboratory.managementSystem.entity.LabTest;
import com.laboratory.managementSystem.exception.ResourceNotFoundException;
import com.laboratory.managementSystem.repository.LabTestRepository;
import com.laboratory.managementSystem.service.LabTestService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * [CLASS] LabTestServiceImpl
 * Package  : com.laboratory.managementSystem.service.impl
 * Implements LabTestService.
 */
@Service
@RequiredArgsConstructor
public class LabTestServiceImpl implements LabTestService {

    private final LabTestRepository labTestRepository;

    @Override
    @Transactional
    public LabTest addTest(String testCode, String testName, String referenceRange, BigDecimal price) {
        if (labTestRepository.existsByTestCode(testCode)) {
            throw new IllegalArgumentException("Test code '" + testCode + "' already exists.");
        }
        LabTest test = LabTest.builder()
                .testCode(testCode.toUpperCase())
                .testName(testName)
                .referenceRange(referenceRange)
                .price(price)
                .build();
        return labTestRepository.save(test);
    }

    @Override
    @Transactional
    public LabTest updateTest(Long testId, String testName, String referenceRange, BigDecimal price) {
        LabTest test = findById(testId);
        if (testName != null)      test.setTestName(testName);
        if (referenceRange != null) test.setReferenceRange(referenceRange);
        if (price != null)         test.setPrice(price);
        return labTestRepository.save(test);
    }

    @Override
    public List<LabTest> getAllTests() {
        return labTestRepository.findAll();
    }

    @Override
    public LabTest findById(Long testId) {
        return labTestRepository.findById(testId)
                .orElseThrow(() -> new ResourceNotFoundException("Lab test not found with id: " + testId));
    }
}

