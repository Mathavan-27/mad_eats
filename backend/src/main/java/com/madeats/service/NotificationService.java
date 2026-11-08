package com.madeats.service;

import com.madeats.entity.NotificationLog;
import com.madeats.entity.Order;
import com.madeats.entity.OrderItem;
import com.madeats.entity.OrderNotification;
import com.madeats.repository.NotificationLogRepository;
import com.madeats.repository.OrderNotificationRepository;
import com.madeats.repository.OrderRepository;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.File;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    @Autowired
    private NotificationLogRepository notificationLogRepository;

    @Autowired
    private OrderNotificationRepository orderNotificationRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PdfReportService pdfReportService;

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${owner.phone:9363114514}")
    private String ownerPhone;

    @Value("${owner.email:mathavanpalanisamy9@gmail.com}")
    private String ownerEmail;

    @Value("${spring.mail.username:mathavanpalanisamy9@gmail.com}")
    private String mailFromUsername;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    @Value("${sms.gateway.provider:SIMULATED}")
    private String smsGatewayProvider;

    @Value("${sms.twilio.account-sid:}")
    private String twilioAccountSid;

    @Value("${sms.twilio.auth-token:}")
    private String twilioAuthToken;

    @Value("${sms.twilio.from-number:}")
    private String twilioFromNumber;

    @Value("${sms.msg91.auth-key:}")
    private String msg91AuthKey;

    @Value("${sms.msg91.sender-id:MADEAT}")
    private String msg91SenderId;

    @Value("${whatsapp.business.phone-number-id:}")
    private String whatsappPhoneNumberId;

    @Value("${whatsapp.business.access-token:}")
    private String whatsappAccessToken;

    @Value("${whatsapp.business.recipient-number:919363114514}")
    private String whatsappRecipientNumber;

    public void dispatchAllOwnerNotifications(Order order) {
        File pdfFile = null;
        try {
            pdfFile = pdfReportService.generateOrderPdfFile(order);
            order.setPdfPath(pdfFile.getAbsolutePath());
            orderRepository.save(order);
        } catch (Exception e) {
            System.err.println("Could not generate order confirmation PDF file: " + e.getMessage());
        }

        sendOwnerSmsNotification(order);
        sendOwnerEmailNotification(order, pdfFile);
        sendOwnerWhatsAppNotification(order);
        recordOrderNotificationLegacy(order);
    }

    public NotificationLog sendOwnerSmsNotification(Order order) {
        String orderCode = order.getOrderCode();
        if (orderCode == null || orderCode.isBlank()) {
            orderCode = "ME-" + String.format("%06d", order.getId());
        }

        Optional<NotificationLog> existingOpt = notificationLogRepository.findFirstByOrderIdAndNotificationType(order.getId(), "SMS");
        NotificationLog log = existingOpt.orElseGet(NotificationLog::new);
        if (log.getId() != null && "SENT".equals(log.getStatus())) {
            return log;
        }

        int totalItemCount = 0;
        StringBuilder itemsSummary = new StringBuilder();
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                totalItemCount += (item.getQuantity() != null ? item.getQuantity() : 1);
                itemsSummary.append(item.getQuantity()).append("x ").append(item.getFoodName()).append(", ");
            }
        }
        String cleanItems = itemsSummary.toString();
        if (cleanItems.endsWith(", ")) {
            cleanItems = cleanItems.substring(0, cleanItems.length() - 2);
        }
        if (cleanItems.isBlank()) {
            cleanItems = "Standard Meal Order";
        }

        String smsText = "MAD EATS – NEW ORDER RECEIVED!\n\n"
                + "Order ID: " + orderCode + "\n"
                + "Customer: " + order.getCustomerName() + "\n"
                + "Mobile: " + order.getPhone() + "\n"
                + "Items (" + totalItemCount + "): " + cleanItems + "\n"
                + "Total Amount: Rs. " + order.getTotalAmount() + "\n"
                + "Payment: CASH ON DELIVERY\n\n"
                + "Please check the Owner Portal for complete order details.";

        log.setOrderId(order.getId());
        log.setNotificationType("SMS");
        log.setRecipient(ownerPhone);
        log.setSubject("MAD EATS - NEW ORDER RECEIVED!");
        log.setMessageContent(smsText);
        log.setIsRead(false);

        if ("SIMULATED".equalsIgnoreCase(smsGatewayProvider) || (twilioAccountSid.isBlank() && msg91AuthKey.isBlank())) {
            log.setStatus("SIMULATED");
            log.setErrorMessage("Simulated mode active - SMS gateway not connected. Configure MSG91 or Twilio environment variables to enable live transmission.");
        } else {
            try {
                boolean success = executeSmsDelivery(ownerPhone, smsText);
                if (success) {
                    log.setStatus("SENT");
                    log.setErrorMessage(null);
                } else {
                    log.setStatus("FAILED");
                    log.setErrorMessage("SMS gateway returned delivery failure or rejected payload.");
                }
            } catch (Exception ex) {
                log.setStatus("FAILED");
                log.setErrorMessage(ex.getMessage());
            }
        }

        log.setSentAt(LocalDateTime.now());
        log.setUpdatedAt(LocalDateTime.now());
        return notificationLogRepository.save(log);
    }

    public NotificationLog sendOwnerEmailNotification(Order order, File pdfFile) {
        String orderCode = order.getOrderCode();
        if (orderCode == null || orderCode.isBlank()) {
            orderCode = "ME-" + String.format("%06d", order.getId());
        }

        Optional<NotificationLog> existingOpt = notificationLogRepository.findFirstByOrderIdAndNotificationType(order.getId(), "EMAIL");
        NotificationLog log = existingOpt.orElseGet(NotificationLog::new);
        if (log.getId() != null && "SENT".equals(log.getStatus())) {
            return log;
        }

        String emailSubject = "NEW ORDER RECEIVED - MAD EATS - " + orderCode;

        StringBuilder itemsHtmlBuilder = new StringBuilder();
        StringBuilder itemsTextBuilder = new StringBuilder();
        if (order.getItems() != null) {
            for (OrderItem it : order.getItems()) {
                itemsHtmlBuilder.append("<tr>")
                        .append("<td style='padding: 8px 12px; border-bottom: 1px solid #e2e8f0;'>").append(it.getFoodName()).append("</td>")
                        .append("<td style='padding: 8px 12px; border-bottom: 1px solid #e2e8f0; text-align: center;'>").append(it.getQuantity()).append("</td>")
                        .append("<td style='padding: 8px 12px; border-bottom: 1px solid #e2e8f0; text-align: right;'>Rs. ").append(it.getPrice()).append("</td>")
                        .append("<td style='padding: 8px 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold;'>Rs. ").append(it.getSubtotal()).append("</td>")
                        .append("</tr>");

                itemsTextBuilder.append(" - ")
                        .append(it.getQuantity())
                        .append("x ")
                        .append(it.getFoodName())
                        .append(" (Rs. ")
                        .append(it.getPrice())
                        .append(" each = Rs. ")
                        .append(it.getSubtotal())
                        .append(")\n");
            }
        }

        String customerEmailVal = order.getCustomerEmail() != null && !order.getCustomerEmail().isBlank()
                ? order.getCustomerEmail()
                : (order.getUser() != null ? order.getUser().getEmail() : "Not Provided");

        String orderDateStr = order.getOrderDate() != null ? order.getOrderDate().format(DATE_FORMATTER) : "N/A";
        String delFeeStr = (order.getDeliveryFee() == null || order.getDeliveryFee().signum() == 0) ? "FREE" : "Rs. " + order.getDeliveryFee();

        String htmlBody = "<!DOCTYPE html>"
                + "<html>"
                + "<head><meta charset='UTF-8'></head>"
                + "<body style='margin:0; padding:20px; font-family:Arial, sans-serif; background-color:#f8fafc; color:#1e293b;'>"
                + "<div style='max-width:620px; margin:0 auto; background:#ffffff; border-radius:12px; border:1px solid #e2e8f0; overflow:hidden;'>"
                + "<div style='background-color:#e11d48; padding:24px; text-align:center; color:#ffffff;'>"
                + "<h1 style='margin:0; font-size:26px; font-weight:bold; letter-spacing:1px;'>MAD EATS</h1>"
                + "<p style='margin:6px 0 0; font-size:14px; opacity:0.9;'>New Customer Food Order Received</p>"
                + "</div>"
                + "<div style='padding:24px;'>"
                + "<div style='background:#fff1f2; border-left:4px solid #e11d48; padding:12px 16px; margin-bottom:20px; border-radius:4px;'>"
                + "<strong style='color:#9f1239; font-size:15px;'>Order ID: " + orderCode + "</strong><br/>"
                + "<span style='font-size:13px; color:#475569;'>Order Date: " + orderDateStr + " | Status: " + (order.getOrderStatus() != null ? order.getOrderStatus() : "PLACED") + "</span>"
                + "</div>"
                + "<h3 style='font-size:14px; text-transform:uppercase; color:#64748b; margin:16px 0 8px; border-bottom:1px solid #e2e8f0; padding-bottom:4px;'>Customer Details</h3>"
                + "<table style='width:100%; font-size:14px; margin-bottom:16px;'>"
                + "<tr><td style='color:#64748b; width:140px; padding:4px 0;'>Customer Name:</td><td><strong>" + order.getCustomerName() + "</strong></td></tr>"
                + "<tr><td style='color:#64748b; padding:4px 0;'>Customer Mobile:</td><td><a href='tel:" + order.getPhone() + "' style='color:#e11d48; text-decoration:none; font-weight:bold;'>" + order.getPhone() + "</a></td></tr>"
                + "<tr><td style='color:#64748b; padding:4px 0;'>Customer Email:</td><td>" + customerEmailVal + "</td></tr>"
                + "<tr><td style='color:#64748b; padding:4px 0; vertical-align:top;'>Delivery Address:</td><td>" + order.getDeliveryAddress() + "</td></tr>"
                + "</table>"
                + "<h3 style='font-size:14px; text-transform:uppercase; color:#64748b; margin:16px 0 8px; border-bottom:1px solid #e2e8f0; padding-bottom:4px;'>Ordered Items</h3>"
                + "<table style='width:100%; border-collapse:collapse; font-size:13px; margin-bottom:20px;'>"
                + "<thead><tr style='background:#f1f5f9; color:#475569; text-align:left;'>"
                + "<th style='padding:8px 12px; border-bottom:1px solid #cbd5e1;'>Food Item</th>"
                + "<th style='padding:8px 12px; border-bottom:1px solid #cbd5e1; text-align:center;'>Qty</th>"
                + "<th style='padding:8px 12px; border-bottom:1px solid #cbd5e1; text-align:right;'>Price</th>"
                + "<th style='padding:8px 12px; border-bottom:1px solid #cbd5e1; text-align:right;'>Subtotal</th>"
                + "</tr></thead>"
                + "<tbody>" + itemsHtmlBuilder.toString() + "</tbody>"
                + "</table>"
                + "<table style='width:100%; font-size:14px; margin-bottom:20px;'>"
                + "<tr><td style='text-align:right; color:#64748b; padding:4px 12px;'>Subtotal:</td><td style='text-align:right; width:120px; padding:4px 0;'>Rs. " + (order.getSubtotal() != null ? order.getSubtotal() : "0.00") + "</td></tr>"
                + "<tr><td style='text-align:right; color:#64748b; padding:4px 12px;'>GST (5%):</td><td style='text-align:right; padding:4px 0;'>Rs. " + (order.getGstAmount() != null ? order.getGstAmount() : "0.00") + "</td></tr>"
                + "<tr><td style='text-align:right; color:#64748b; padding:4px 12px;'>Delivery Charges:</td><td style='text-align:right; padding:4px 0;'>" + delFeeStr + "</td></tr>"
                + "<tr><td style='text-align:right; color:#64748b; padding:4px 12px;'>Discount:</td><td style='text-align:right; padding:4px 0;'>Rs. 0.00</td></tr>"
                + "<tr style='border-top:2px solid #e2e8f0;'><td style='text-align:right; font-weight:bold; font-size:16px; padding:8px 12px;'>Final Order Amount:</td><td style='text-align:right; font-weight:bold; font-size:18px; color:#e11d48; padding:8px 0;'>Rs. " + order.getTotalAmount() + "</td></tr>"
                + "<tr><td style='text-align:right; color:#15803d; font-weight:bold; padding:4px 12px;'>Payment Method:</td><td style='text-align:right; color:#15803d; font-weight:bold; padding:4px 0;'>Cash on Delivery (COD)</td></tr>"
                + "</table>"
                + "<div style='text-align:center; padding:16px; background:#f8fafc; border-radius:8px;'>"
                + "<p style='margin:0 0 10px; font-size:13px; color:#475569;'>Please log in to your Owner Portal to manage this order.</p>"
                + "<span style='display:inline-block; background:#e11d48; color:#ffffff; padding:10px 24px; border-radius:6px; font-weight:bold; text-decoration:none;'>MAD EATS Owner Dashboard</span>"
                + "</div>"
                + "</div>"
                + "<div style='background:#f1f5f9; padding:12px; text-align:center; font-size:12px; color:#94a3b8; border-top:1px solid #e2e8f0;'>"
                + "MAD EATS Restaurant &bull; Automated Kitchen Alert System &bull; Generated: " + LocalDateTime.now().format(DATE_FORMATTER)
                + "</div>"
                + "</div>"
                + "</body></html>";

        String textBody = "Hello MAD EATS Owner,\n\n"
                + "A new food order has been successfully placed.\n\n"
                + "Order ID: " + orderCode + "\n"
                + "Customer Name: " + order.getCustomerName() + "\n"
                + "Customer Mobile: " + order.getPhone() + "\n"
                + "Customer Email: " + customerEmailVal + "\n"
                + "Delivery Address: " + order.getDeliveryAddress() + "\n\n"
                + "Order Items:\n"
                + itemsTextBuilder.toString() + "\n"
                + "Subtotal: Rs. " + order.getSubtotal() + "\n"
                + "GST (5%): Rs. " + order.getGstAmount() + "\n"
                + "Delivery Charges: " + delFeeStr + "\n"
                + "Discount: Rs. 0.00\n"
                + "Final Order Amount: Rs. " + order.getTotalAmount() + "\n\n"
                + "Payment Method: CASH ON DELIVERY\n"
                + "Order Date & Time: " + orderDateStr + "\n"
                + "Order Status: " + (order.getOrderStatus() != null ? order.getOrderStatus() : "PLACED") + "\n\n"
                + "Please log in to your Owner Portal to manage this order.\n\n"
                + "Thank you,\nMAD EATS Restaurant";

        log.setOrderId(order.getId());
        log.setNotificationType("EMAIL");
        log.setRecipient(ownerEmail);
        log.setSubject(emailSubject);
        log.setMessageContent(textBody);
        log.setIsRead(false);

        if (mailSender == null || mailPassword == null || mailPassword.isBlank()) {
            log.setStatus("PENDING");
            log.setErrorMessage("JavaMailSender SMTP credentials not set (configure SPRING_MAIL_PASSWORD environment variable to transmit live email).");
        } else {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(mailFromUsername, "MAD EATS Orders");
                helper.setTo(ownerEmail);
                helper.setSubject(emailSubject);
                helper.setText(textBody, htmlBody);

                byte[] pdfBytes;
                if (pdfFile != null && pdfFile.exists()) {
                    helper.addAttachment("MAD_EATS_Order_" + orderCode + ".pdf", pdfFile);
                } else {
                    pdfBytes = pdfReportService.generateOrderPdfBytes(order);
                    helper.addAttachment("MAD_EATS_Order_" + orderCode + ".pdf", new ByteArrayResource(pdfBytes));
                }

                mailSender.send(message);
                log.setStatus("SENT");
                log.setErrorMessage(null);
            } catch (Exception ex) {
                log.setStatus("FAILED");
                log.setErrorMessage("Email dispatch failed: " + ex.getMessage());
            }
        }

        log.setSentAt(LocalDateTime.now());
        log.setUpdatedAt(LocalDateTime.now());
        return notificationLogRepository.save(log);
    }

    public NotificationLog sendOwnerWhatsAppNotification(Order order) {
        String orderCode = order.getOrderCode();
        if (orderCode == null || orderCode.isBlank()) {
            orderCode = "ME-" + String.format("%06d", order.getId());
        }

        Optional<NotificationLog> existingOpt = notificationLogRepository.findFirstByOrderIdAndNotificationType(order.getId(), "WHATSAPP");
        NotificationLog log = existingOpt.orElseGet(NotificationLog::new);
        if (log.getId() != null && "SENT".equals(log.getStatus())) {
            return log;
        }

        int totalCount = 0;
        if (order.getItems() != null) {
            for (OrderItem it : order.getItems()) {
                totalCount += (it.getQuantity() != null ? it.getQuantity() : 1);
            }
        }

        String waMessage = "MAD EATS - NEW ORDER ALERT!\n"
                + "Order ID: " + orderCode + "\n"
                + "Customer: " + order.getCustomerName() + "\n"
                + "Phone: " + order.getPhone() + "\n"
                + "Items: " + totalCount + " items\n"
                + "Total: Rs. " + order.getTotalAmount() + "\n"
                + "Payment: CASH ON DELIVERY";

        log.setOrderId(order.getId());
        log.setNotificationType("WHATSAPP");
        log.setRecipient(whatsappRecipientNumber != null ? whatsappRecipientNumber : ownerPhone);
        log.setSubject("MAD EATS WhatsApp Order Alert");
        log.setMessageContent(waMessage);
        log.setIsRead(false);

        if (whatsappPhoneNumberId == null || whatsappPhoneNumberId.isBlank() || whatsappAccessToken == null || whatsappAccessToken.isBlank()) {
            log.setStatus("SIMULATED");
            log.setErrorMessage("WhatsApp Business Cloud API credentials not configured (WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN). Notification prepared and logged.");
        } else {
            try {
                String sanitizedTo = log.getRecipient().replaceAll("[^0-9]", "");
                String jsonPayload = "{"
                        + "\"messaging_product\":\"whatsapp\","
                        + "\"to\":\"" + sanitizedTo + "\","
                        + "\"type\":\"text\","
                        + "\"text\":{\"body\":\"" + waMessage.replace("\n", "\\n") + "\"}"
                        + "}";

                String url = "https://graph.facebook.com/v19.0/" + whatsappPhoneNumberId + "/messages";
                HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
                HttpRequest req = HttpRequest.newBuilder()
                        .uri(URI.create(url))
                        .header("Authorization", "Bearer " + whatsappAccessToken)
                        .header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                        .build();

                HttpResponse<String> resp = client.send(req, HttpResponse.BodyHandlers.ofString());
                if (resp.statusCode() >= 200 && resp.statusCode() < 300) {
                    log.setStatus("SENT");
                    log.setErrorMessage(null);
                } else {
                    log.setStatus("FAILED");
                    log.setErrorMessage("WhatsApp API error: " + resp.body());
                }
            } catch (Exception ex) {
                log.setStatus("FAILED");
                log.setErrorMessage("WhatsApp dispatch exception: " + ex.getMessage());
            }
        }

        log.setSentAt(LocalDateTime.now());
        log.setUpdatedAt(LocalDateTime.now());
        return notificationLogRepository.save(log);
    }

    private boolean executeSmsDelivery(String recipientMobile, String message) {
        if ("TWILIO".equalsIgnoreCase(smsGatewayProvider) && !twilioAccountSid.isBlank() && !twilioAuthToken.isBlank()) {
            return sendTwilioSms(recipientMobile, message);
        }

        if ("MSG91".equalsIgnoreCase(smsGatewayProvider) && !msg91AuthKey.isBlank()) {
            return sendMsg91Sms(recipientMobile, message);
        }

        return false;
    }

    private boolean sendTwilioSms(String recipientMobile, String message) {
        try {
            String sanitizedPhone = recipientMobile.startsWith("+") ? recipientMobile : "+91" + recipientMobile.replaceAll("[^0-9]", "");
            String url = "https://api.twilio.com/2010-04-01/Accounts/" + twilioAccountSid + "/Messages.json";
            String form = "To=" + URLEncoder.encode(sanitizedPhone, StandardCharsets.UTF_8)
                    + "&From=" + URLEncoder.encode(twilioFromNumber, StandardCharsets.UTF_8)
                    + "&Body=" + URLEncoder.encode(message, StandardCharsets.UTF_8);

            String auth = Base64.getEncoder().encodeToString((twilioAccountSid + ":" + twilioAuthToken).getBytes(StandardCharsets.UTF_8));
            HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Authorization", "Basic " + auth)
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .POST(HttpRequest.BodyPublishers.ofString(form))
                    .build();

            HttpResponse<String> resp = client.send(request, HttpResponse.BodyHandlers.ofString());
            return resp.statusCode() >= 200 && resp.statusCode() < 300;
        } catch (Exception e) {
            System.err.println("Twilio SMS dispatch exception: " + e.getMessage());
            return false;
        }
    }

    private boolean sendMsg91Sms(String recipientMobile, String message) {
        try {
            String sanitizedPhone = recipientMobile.replaceAll("[^0-9]", "");
            if (sanitizedPhone.length() == 10) {
                sanitizedPhone = "91" + sanitizedPhone;
            }
            String url = "https://control.msg91.com/api/v5/otp?authkey=" + URLEncoder.encode(msg91AuthKey, StandardCharsets.UTF_8)
                    + "&template_id=" + URLEncoder.encode(msg91SenderId, StandardCharsets.UTF_8)
                    + "&mobile=" + URLEncoder.encode(sanitizedPhone, StandardCharsets.UTF_8)
                    + "&otp=" + URLEncoder.encode(message, StandardCharsets.UTF_8);

            HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.noBody())
                    .build();

            HttpResponse<String> resp = client.send(request, HttpResponse.BodyHandlers.ofString());
            return resp.statusCode() >= 200 && resp.statusCode() < 300;
        } catch (Exception e) {
            System.err.println("MSG91 SMS dispatch exception: " + e.getMessage());
            return false;
        }
    }

    public NotificationLog retryNotification(Long logId) {
        Optional<NotificationLog> opt = notificationLogRepository.findById(logId);
        if (opt.isEmpty()) {
            throw new RuntimeException("Notification log #" + logId + " not found.");
        }

        NotificationLog log = opt.get();
        log.setRetryCount(log.getRetryCount() == null ? 1 : log.getRetryCount() + 1);

        Optional<Order> orderOpt = orderRepository.findById(log.getOrderId());
        if (orderOpt.isEmpty()) {
            log.setStatus("FAILED");
            log.setErrorMessage("Referenced Order #" + log.getOrderId() + " not found in database.");
            log.setUpdatedAt(LocalDateTime.now());
            return notificationLogRepository.save(log);
        }

        Order order = orderOpt.get();

        if ("SMS".equalsIgnoreCase(log.getNotificationType())) {
            if ("SIMULATED".equalsIgnoreCase(smsGatewayProvider) || (twilioAccountSid.isBlank() && msg91AuthKey.isBlank())) {
                log.setStatus("SIMULATED");
                log.setErrorMessage("Simulated mode active - SMS gateway credentials not provided.");
            } else {
                try {
                    boolean success = executeSmsDelivery(log.getRecipient(), log.getMessageContent());
                    if (success) {
                        log.setStatus("SENT");
                        log.setErrorMessage(null);
                    } else {
                        log.setStatus("FAILED");
                        log.setErrorMessage("Retry attempt failed. SMS gateway returned rejection.");
                    }
                } catch (Exception e) {
                    log.setStatus("FAILED");
                    log.setErrorMessage("Retry exception: " + e.getMessage());
                }
            }
        } else if ("EMAIL".equalsIgnoreCase(log.getNotificationType())) {
            File pdfFile = null;
            if (order.getPdfPath() != null) {
                File f = new File(order.getPdfPath());
                if (f.exists()) {
                    pdfFile = f;
                }
            }
            if (pdfFile == null) {
                try {
                    pdfFile = pdfReportService.generateOrderPdfFile(order);
                } catch (Exception ignored) {
                }
            }

            if (mailSender == null || mailPassword == null || mailPassword.isBlank()) {
                log.setStatus("PENDING");
                log.setErrorMessage("JavaMailSender credentials not set in environment (SPRING_MAIL_PASSWORD).");
            } else {
                try {
                    MimeMessage message = mailSender.createMimeMessage();
                    MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                    helper.setFrom(mailFromUsername, "MAD EATS Orders");
                    helper.setTo(log.getRecipient());
                    helper.setSubject(log.getSubject());
                    helper.setText(log.getMessageContent(), false);

                    if (pdfFile != null && pdfFile.exists()) {
                        helper.addAttachment("MAD_EATS_Order_" + order.getOrderCode() + ".pdf", pdfFile);
                    }
                    mailSender.send(message);
                    log.setStatus("SENT");
                    log.setErrorMessage(null);
                } catch (Exception e) {
                    log.setStatus("FAILED");
                    log.setErrorMessage("Retry email failed: " + e.getMessage());
                }
            }
        } else if ("WHATSAPP".equalsIgnoreCase(log.getNotificationType())) {
            sendOwnerWhatsAppNotification(order);
            return notificationLogRepository.findById(logId).orElse(log);
        }

        log.setUpdatedAt(LocalDateTime.now());
        return notificationLogRepository.save(log);
    }

    public NotificationLog markAsRead(Long logId) {
        Optional<NotificationLog> opt = notificationLogRepository.findById(logId);
        if (opt.isPresent()) {
            NotificationLog log = opt.get();
            log.setIsRead(true);
            log.setUpdatedAt(LocalDateTime.now());
            return notificationLogRepository.save(log);
        }
        return null;
    }

    public void markAllAsRead() {
        notificationLogRepository.markAllAsRead();
    }

    public long getUnreadCount() {
        return notificationLogRepository.countByIsReadFalse();
    }

    private void recordOrderNotificationLegacy(Order order) {
        try {
            OrderNotification notification = new OrderNotification();
            notification.setOrderId(order.getId());
            notification.setOwnerPhone(ownerPhone);
            notification.setOwnerEmail(ownerEmail);
            notification.setCustomerName(order.getCustomerName());
            notification.setCustomerPhone(order.getPhone());
            notification.setTotalAmount(order.getTotalAmount());
            notification.setSmsMessage("Order #" + order.getId() + " - " + order.getCustomerName() + " - Rs." + order.getTotalAmount());
            notification.setEmailSubject("NEW ORDER RECEIVED - MAD EATS - " + order.getOrderCode());
            notification.setSmsStatus("SIMULATED".equalsIgnoreCase(smsGatewayProvider) ? "SIMULATED" : "SENT");
            notification.setEmailStatus(mailPassword != null && !mailPassword.isBlank() ? "SENT" : "PENDING");
            notification.setSentAt(LocalDateTime.now());
            orderNotificationRepository.save(notification);
        } catch (Exception ignored) {
        }
    }

    public List<NotificationLog> getAllNotificationLogs() {
        return notificationLogRepository.findAllByOrderBySentAtDesc();
    }

    public List<OrderNotification> getAllLegacyNotifications() {
        return orderNotificationRepository.findAllByOrderBySentAtDesc();
    }
}
