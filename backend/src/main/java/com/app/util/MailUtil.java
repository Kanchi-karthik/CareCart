package com.app.util;

public class MailUtil {
    public static void sendMail(String to, String subject, String body) {
        System.out.println("------------------------------------------");
        System.out.println("SENDING EMAIL TO: " + to);
        System.out.println("SUBJECT: " + subject);
        System.out.println("BODY: " + body);
        System.out.println("------------------------------------------");
    }

    public static String generateOTP() {
        return String.valueOf((int) (Math.random() * 900000 + 100000));
    }

    public static String getAuthTemplate(String otp) {
        return "Welcome to CareCart Hub!\n\nYour authentication passcode is: " + otp +
                "\n\nPlease enter this code to verify your professional account.\n\nSecurely,\nCareCart Auth System";
    }

    public static String getResetTemplate(String otp) {
        return "CareCart Account Recovery\n\nSomeone requested a password reset for your account.\n\n" +
                "Your reset passcode is: " + otp
                + "\n\nIf this wasn't you, please ignore this email.\n\nCareCart Security Team";
    }
}
