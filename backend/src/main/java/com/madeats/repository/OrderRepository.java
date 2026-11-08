package com.madeats.repository;

import com.madeats.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findAllByOrderByOrderDateDesc();
    List<Order> findByUserIdOrderByOrderDateDesc(Long userId);
    List<Order> findByPhoneOrderByOrderDateDesc(String phone);
    List<Order> findByCustomerNameContainingIgnoreCaseOrderByOrderDateDesc(String customerName);
    Optional<Order> findByOrderCode(String orderCode);
    List<Order> findByOrderCodeContainingIgnoreCaseOrCustomerNameContainingIgnoreCaseOrderByOrderDateDesc(String orderCode, String customerName);
}
