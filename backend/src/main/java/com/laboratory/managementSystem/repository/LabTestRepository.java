package com.laboratory.managementSystem.repository;

import com.laboratory.managementSystem.entity.LabTest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * [INTERFACE] LabTestRepository
 * Package  : com.laboratory.managementSystem.repository
 * Data Access Layer for LabTest (test catalogue managed by Admin).
 */
@Repository
public interface LabTestRepository extends JpaRepository<LabTest, Long> {

    /** Find a test by its short code (e.g. "FBC", "FBS"). */
    Optional<LabTest> findByTestCode(String testCode);

    /** Prevent duplicate test codes when Admin adds a new test. */
    boolean existsByTestCode(String testCode);
}

