package com.laboratory.managementSystem.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class SmsService {

    @Value("${twilio.account.sid}")
    private String accountSid;

    @Value("${twilio.auth.token}")
    private String authToken;

    @Value("${twilio.phone.number}")
    private String fromPhoneNumber;

    // lsb report ready SMS
    public void sendReportReadySms(String toPhoneNumber, String patientName, String testName, String qrToken) {
        try {
            Twilio.init(accountSid, authToken);

            String formattedToNumber = toPhoneNumber.trim();
            if (formattedToNumber.startsWith("0")) {
                formattedToNumber = "+94" + formattedToNumber.substring(1);
            }


            String portalUrl = "http://localhost:5173/portal/login";

            String smsBody = String.format(
                    "Hi %s, Your lab report for %s is now ready. " +
                            "Log into our Patient Portal to view it: %s (Token: %s)",
                    patientName,
                    testName,
                    portalUrl,
                    qrToken
            );

            Message message = Message.creator(
                    new PhoneNumber(formattedToNumber),
                    new PhoneNumber(fromPhoneNumber),
                    smsBody
            ).create();

            log.info("Report SMS sent successfully! SID: {}", message.getSid());

        } catch (Exception e) {
            log.error("Failed to send Report SMS via Twilio to {}: {}", toPhoneNumber, e.getMessage());
        }
    }

    // 💡
    public void sendOtpSms(String toPhoneNumber, String otp) {
        try {
            Twilio.init(accountSid, authToken);

            // නම්බර් එක +94 ෆෝමැට් එකට හදාගන්නවා
            String formattedToNumber = toPhoneNumber.trim();
            if (formattedToNumber.startsWith("0")) {
                formattedToNumber = "+94" + formattedToNumber.substring(1);
            }

            // SMS මැසේජ් එක
            String smsBody = String.format(
                    "Your MedLab Patient Portal verification code is: %s. This code is valid for 5 minutes. Please do not share this with anyone.",
                    otp
            );

            Message message = Message.creator(
                    new PhoneNumber(formattedToNumber), // පේෂන්ට්ගේ නම්බර් එක
                    new PhoneNumber(fromPhoneNumber),   // ඔයාගේ Twilio නම්බර් එක
                    smsBody
            ).create();

            log.info("OTP SMS sent successfully via Twilio! SID: {}", message.getSid());

        } catch (Exception e) {
            // මොකක් හරි වැරදීමකින් Twilio එක වැඩ නොකළොත් Error එක ලොග් කරනවා
            log.error("Failed to send OTP SMS via Twilio to {}: {}", toPhoneNumber, e.getMessage());
        }
    }
}