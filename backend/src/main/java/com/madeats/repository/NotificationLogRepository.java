package com.madeats.repository;

import com.madeats.entity.NotificationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationLogRepository extends JpaRepository<NotificationLog, Long> {

    List<NotificationLog> findAllByOrderBySentAtDesc();

    List<NotificationLog> findByOrderId(Long orderId);

    Optional<NotificationLog> findFirstByOrderIdAndNotificationType(Long orderId, String notificationType);

    long countByIsReadFalse();

    @Modifying
    @Transactional
    @Query("UPDATE NotificationLog n SET n.isRead = true WHERE n.isRead = false")
    void markAllAsRead();
}
