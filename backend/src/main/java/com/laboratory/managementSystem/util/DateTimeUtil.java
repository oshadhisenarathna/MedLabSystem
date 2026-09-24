package com.laboratory.managementSystem.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * [CLASS] DateTimeUtil
 * Package  : com.laboratory.managementSystem.util
 * Centralises date/time formatting and time-sensitive calculations
 * (OTP expiry, invoice number generation) so changes are in one place.
 */
public final class DateTimeUtil {

    private DateTimeUtil() {} // utility class — no instantiation


    private static final DateTimeFormatter INVOICE_DATE_FMT =
            DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss");


    public static String generateInvoiceNo() {
        String dateTimePart = LocalDateTime.now().format(INVOICE_DATE_FMT);
        return "APP-" + dateTimePart;
    }

    /**
     * Returns the OTP expiration timestamp (current time + 5 minutes).
     */
    public static LocalDateTime otpExpiry() {
        return LocalDateTime.now().plusMinutes(5);
    }

    /**
     * Formats a LocalDateTime to a human-readable report timestamp.
     * e.g. "07 Jun 2026, 14:35"
     */
    public static String formatForReport(LocalDateTime dateTime) {
        if (dateTime == null) return "-";
        return dateTime.format(DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm"));
    }
}