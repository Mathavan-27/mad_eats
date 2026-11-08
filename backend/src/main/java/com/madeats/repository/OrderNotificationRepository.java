package com.madeats.repository;

import com.madeats.entity.OrderNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderNotificationRepository extends JpaRepository<OrderNotification, Long> {
    List<OrderNotification> findAllByOrderBySentAtDesc();
    List<OrderNotification> findByOrderId(Long orderId);
}
