package com.madeats.service;

import com.madeats.dto.OrderItemRequest;
import com.madeats.dto.OrderRequest;
import com.madeats.entity.Order;
import com.madeats.entity.OrderItem;
import com.madeats.entity.User;
import com.madeats.repository.FoodItemRepository;
import com.madeats.repository.OrderRepository;
import com.madeats.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FoodItemRepository foodItemRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private PdfReportService pdfReportService;

    @Transactional
    public Order createOrder(OrderRequest request) {
        Order order = new Order();

        if (request.getUserId() != null) {
            Optional<User> userOpt = userRepository.findById(request.getUserId());
            userOpt.ifPresent(order::setUser);
        }

        order.setCustomerName(request.getCustomerName().trim());
        if (request.getCustomerEmail() != null && !request.getCustomerEmail().isBlank()) {
            order.setCustomerEmail(request.getCustomerEmail().trim());
        } else if (order.getUser() != null) {
            order.setCustomerEmail(order.getUser().getEmail());
        }
        order.setPhone(request.getPhone().trim());
        order.setDeliveryAddress(request.getDeliveryAddress().trim());

        BigDecimal calculatedSubtotal = BigDecimal.ZERO;
        for (OrderItemRequest it : request.getItems()) {
            BigDecimal itemSubtotal = it.getPrice().multiply(BigDecimal.valueOf(it.getQuantity()));
            calculatedSubtotal = calculatedSubtotal.add(itemSubtotal);
        }

        BigDecimal subtotal = request.getSubtotal() != null ? request.getSubtotal() : calculatedSubtotal;
        BigDecimal gstAmount = request.getGstAmount() != null 
                ? request.getGstAmount() 
                : subtotal.multiply(new BigDecimal("0.05")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal deliveryFee = request.getDeliveryFee() != null 
                ? request.getDeliveryFee() 
                : (subtotal.compareTo(new BigDecimal("499")) >= 0 ? BigDecimal.ZERO : new BigDecimal("35.00"));
        BigDecimal finalTotal = subtotal.add(gstAmount).add(deliveryFee).setScale(2, RoundingMode.HALF_UP);

        order.setSubtotal(subtotal);
        order.setGstAmount(gstAmount);
        order.setDeliveryFee(deliveryFee);
        order.setTotalAmount(finalTotal);
        order.setPaymentMethod("Cash on Delivery (COD)");
        order.setOrderStatus("PLACED");
        order.setOrderDate(LocalDateTime.now());

        for (OrderItemRequest itemReq : request.getItems()) {
            OrderItem orderItem = new OrderItem();
            if (itemReq.getFoodItemId() != null) {
                foodItemRepository.findById(itemReq.getFoodItemId()).ifPresent(orderItem::setFoodItem);
            }
            orderItem.setFoodName(itemReq.getFoodName());
            orderItem.setQuantity(itemReq.getQuantity());
            orderItem.setPrice(itemReq.getPrice());
            orderItem.setSubtotal(itemReq.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity())));
            order.addItem(orderItem);
        }

        Order savedOrder = orderRepository.save(order);
        if (savedOrder.getOrderCode() == null || savedOrder.getOrderCode().isBlank()) {
            savedOrder.setOrderCode("ME-" + String.format("%06d", savedOrder.getId()));
            savedOrder = orderRepository.save(savedOrder);
        }

        try {
            notificationService.dispatchAllOwnerNotifications(savedOrder);
        } catch (Exception ex) {
            System.err.println("Notification dispatch failed in OrderService: " + ex.getMessage());
        }

        return savedOrder;
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByOrderDateDesc();
    }

    public List<Order> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserIdOrderByOrderDateDesc(userId);
    }

    public List<Order> getOrdersByPhone(String phone) {
        return orderRepository.findByPhoneOrderByOrderDateDesc(phone);
    }

    public Optional<Order> getOrderById(Long orderId) {
        return orderRepository.findById(orderId);
    }

    public Optional<Order> getOrderByCode(String orderCode) {
        return orderRepository.findByOrderCode(orderCode);
    }

    public List<Order> searchOrders(String query) {
        if (query == null || query.isBlank()) {
            return getAllOrders();
        }
        String clean = query.trim();
        return orderRepository.findByOrderCodeContainingIgnoreCaseOrCustomerNameContainingIgnoreCaseOrderByOrderDateDesc(clean, clean);
    }

    @Transactional
    public Optional<Order> updateOrderStatus(Long orderId, String newStatus) {
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            order.setOrderStatus(newStatus.toUpperCase().trim());
            return Optional.of(orderRepository.save(order));
        }
        return Optional.empty();
    }

    public byte[] getOrderPdf(Long orderId) {
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isEmpty()) {
            throw new RuntimeException("Order #" + orderId + " not found.");
        }
        Order order = orderOpt.get();
        return pdfReportService.generateOrderPdfBytes(order);
    }
}
