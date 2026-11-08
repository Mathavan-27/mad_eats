package com.madeats.controller;

import com.madeats.dto.OrderRequest;
import com.madeats.entity.NotificationLog;
import com.madeats.entity.Order;
import com.madeats.entity.OrderNotification;
import com.madeats.service.NotificationService;
import com.madeats.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private NotificationService notificationService;

    @PostMapping("/orders")
    public ResponseEntity<?> placeOrder(@Valid @RequestBody OrderRequest request) {
        try {
            Order savedOrder = orderService.createOrder(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedOrder);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "ERROR", "message", e.getMessage()));
        }
    }

    @GetMapping("/orders/my-orders")
    public ResponseEntity<List<Order>> getMyOrders(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String phone) {
        if (userId != null) {
            return ResponseEntity.ok(orderService.getOrdersByUserId(userId));
        }
        if (phone != null && !phone.isBlank()) {
            return ResponseEntity.ok(orderService.getOrdersByPhone(phone.trim()));
        }
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        return orderService.getOrderById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/orders/{id}/pdf")
    public ResponseEntity<byte[]> downloadOrderPdf(@PathVariable Long id) {
        try {
            byte[] pdfBytes = orderService.getOrderPdf(id);
            Optional<Order> orderOpt = orderService.getOrderById(id);
            String orderCode = orderOpt.map(Order::getOrderCode).orElse("ME-" + id);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "MAD_EATS_Order_" + orderCode + ".pdf");
            headers.setContentLength(pdfBytes.length);

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/owner/orders")
    public ResponseEntity<List<Order>> getOwnerOrders(@RequestParam(required = false) String search) {
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(orderService.searchOrders(search));
        }
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PutMapping("/owner/orders/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusBody) {
        String newStatus = statusBody.get("status");
        if (newStatus == null || newStatus.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Status field is required"));
        }
        Optional<Order> updated = orderService.updateOrderStatus(id, newStatus);
        if (updated.isPresent()) {
            return ResponseEntity.ok(updated.get());
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/owner/notification-logs")
    public ResponseEntity<List<NotificationLog>> getOwnerNotificationLogs() {
        return ResponseEntity.ok(notificationService.getAllNotificationLogs());
    }

    @PostMapping("/owner/notification-logs/{id}/retry")
    public ResponseEntity<?> retryNotification(@PathVariable Long id) {
        try {
            NotificationLog retried = notificationService.retryNotification(id);
            return ResponseEntity.ok(retried);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/owner/notifications/unread-count")
    public ResponseEntity<Map<String, Object>> getUnreadNotificationCount() {
        long count = notificationService.getUnreadCount();
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    @PutMapping("/owner/notifications/{id}/read")
    public ResponseEntity<?> markNotificationAsRead(@PathVariable Long id) {
        NotificationLog updated = notificationService.markAsRead(id);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/owner/notifications/read-all")
    public ResponseEntity<?> markAllNotificationsAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }

    @GetMapping("/owner/notifications")
    public ResponseEntity<List<OrderNotification>> getOwnerNotifications() {
        return ResponseEntity.ok(notificationService.getAllLegacyNotifications());
    }
}
