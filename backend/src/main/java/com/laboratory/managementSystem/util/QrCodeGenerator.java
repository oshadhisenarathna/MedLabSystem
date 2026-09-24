package com.laboratory.managementSystem.util;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Map;

/**
 * [CLASS] QrCodeGenerator
 * Package  : com.laboratory.managementSystem.util
 * Converts a URL string into a QR code PNG image byte array using ZXing.
 */
@Component
public class QrCodeGenerator {

    /**
     * Generates a QR code PNG as a byte array.
     *
     * @param content URL or text to encode
     * @param width   pixel width of the output image
     * @param height  pixel height of the output image
     * @return PNG image bytes
     */
    public byte[] generateQrCodeBytes(String content, int width, int height) {
        QRCodeWriter writer = new QRCodeWriter();
        Map<EncodeHintType, Object> hints = Map.of(
                EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H,
                EncodeHintType.MARGIN, 1
        );
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            BitMatrix matrix = writer.encode(content, BarcodeFormat.QR_CODE, width, height, hints);
            MatrixToImageWriter.writeToStream(matrix, "PNG", baos);
            return baos.toByteArray();
        } catch (WriterException | IOException e) {
            throw new RuntimeException("Failed to generate QR code for: " + content, e);
        }
    }
}

