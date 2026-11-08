package com.madeats.repository;

import com.madeats.entity.FoodItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoodItemRepository extends JpaRepository<FoodItem, Long> {
    List<FoodItem> findByAvailableTrue();
    List<FoodItem> findByCategoryCategoryName(String categoryName);
}
