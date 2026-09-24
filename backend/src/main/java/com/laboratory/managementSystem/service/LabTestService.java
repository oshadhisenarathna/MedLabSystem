package com.laboratory.managementSystem.service;

import com.laboratory.managementSystem.entity.LabTest;

import java.math.BigDecimal;
import java.util.List;

/**
 * [INTERFACE] LabTestService
 * Package  : com.laboratory.managementSystem.service
 * Business logic contract for the test catalogue (Admin-managed).
 */
public interface LabTestService {

    /** Admin adds a new test to the catalogue. */
    LabTest addTest(String testCode, String testName, String referenceRange, BigDecimal price);

    /** Admin updates price or reference range of an existing test. */
    LabTest updateTest(Long testId, String testName, String referenceRange, BigDecimal price);

    /** Fetch all available tests (used in appointment booking UI). */
    List<LabTest> getAllTests();

    /** Fetch a single test by ID. */
    LabTest findById(Long testId);
}

