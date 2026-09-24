package com.laboratory.managementSystem.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * [CLASS] ReportResultDTO
 * Package  : com.laboratory.managementSystem.dto.request
 * Payload used by the Lab Technician to enter a raw test result.
 * Mapped from PUT /api/reports/{reportId}/result
 */
@Data
public class ReportResultDTO {

    @NotNull(message = "Report ID is required")
    private Long reportId;


    @NotBlank(message = "Result value is required")
    private String resultValue;
}

