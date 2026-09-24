package com.laboratory.managementSystem.controller;

import com.laboratory.managementSystem.entity.LabTest;
import com.laboratory.managementSystem.repository.LabTestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * [CLASS] LabTestController
 * Package  : com.laboratory.managementSystem.controller
 * Handles requests for the Lab Test Catalogue.
 */
@RestController
@RequestMapping("/api/tests")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class LabTestController {

    private final LabTestRepository labTestRepository;


    @GetMapping
    public ResponseEntity<List<LabTest>> getAllLabTests() {
        // ඩේටාබේස් එකේ තියෙන ඔක්කොම ලැබ් ටෙස්ට් වර්ග ටික අරන් ෆ්‍රොන්ටෙන්ඩ් එකට බලන්න යවනවා
        List<LabTest> labTests = labTestRepository.findAll();
        return ResponseEntity.ok(labTests);
    }
}
