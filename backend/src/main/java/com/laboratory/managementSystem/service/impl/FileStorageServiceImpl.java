package com.laboratory.managementSystem.service.impl;

import com.laboratory.managementSystem.exception.FileStorageException;
import com.laboratory.managementSystem.service.FileStorageService;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;

/**
 * [CLASS] FileStorageServiceImpl
 * Package  : com.laboratory.managementSystem.service.impl
 * Implements FileStorageService.
 *
 * PDFs are organised by year/month on disk:
 *   {storage.base-path}/reports/2026/06/fbc-p001.pdf
 *
 * application.properties key:
 *   storage.base-path=/var/labstorage
 */
@Slf4j
@Service
public class FileStorageServiceImpl implements FileStorageService {

    @Value("${storage.base-path:/var/labstorage}")
    private String basePath;

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(Paths.get(basePath, "reports"));
            log.info("File storage root initialised at: {}", basePath);
        } catch (IOException e) {
            throw new FileStorageException("Could not initialise storage directory.", e);
        }
    }

    @Override
    public String savePdf(byte[] data, String filename) {
        LocalDate now = LocalDate.now();
        String relativePath = String.format("reports/%d/%02d/%s",
                now.getYear(), now.getMonthValue(), filename);
        Path fullPath = Paths.get(basePath, relativePath);

        try {
            Files.createDirectories(fullPath.getParent());
            Files.write(fullPath, data);
            log.info("PDF saved: {}", fullPath);

            return "/" + relativePath;
        } catch (IOException e) {
            throw new FileStorageException("Failed to save PDF: " + filename, e);
        }
    }

    @Override
    public Resource loadPdf(String relativePath) {
        try {
            // Strip leading slash if present
            String clean = relativePath.startsWith("/") ? relativePath.substring(1) : relativePath;
            Path   file  = Paths.get(basePath, clean);
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            }
            throw new FileStorageException("PDF file not found or not readable: " + relativePath, null);
        } catch (MalformedURLException e) {
            throw new FileStorageException("Invalid PDF path: " + relativePath, e);
        }
    }
}
