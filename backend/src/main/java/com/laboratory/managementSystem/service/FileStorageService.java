package com.laboratory.managementSystem.service;

import org.springframework.core.io.Resource;

/**
 * [INTERFACE] FileStorageService
 * Package  : com.laboratory.managementSystem.service
 * Handles saving and reading PDF files on the local filesystem.
 * PDFs are stored at: {storage.base-path}/reports/YYYY/MM/filename.pdf
 * Only the relative path is persisted in the database.
 */
public interface FileStorageService {

    /**
     * Saves a PDF byte array to disk.
     * @param data     PDF bytes from PdfReportService
     * @param filename Desired file name (e.g. "fbc-p001.pdf")
     * @return Relative path stored in the database (e.g. /reports/2026/06/fbc-p001.pdf)
     */
    String savePdf(byte[] data, String filename);

    /**
     * Loads a PDF from disk as a Spring Resource (for streaming to the client).
     * @param relativePath The path stored in LabReport.pdfUrl
     */
    Resource loadPdf(String relativePath);
}

