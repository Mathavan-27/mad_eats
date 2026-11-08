package com.madeats.service;

import com.madeats.entity.Category;
import com.madeats.entity.FoodItem;
import com.madeats.repository.CategoryRepository;
import com.madeats.repository.FoodItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class FoodService {

    @Autowired
    private FoodItemRepository foodItemRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    public List<FoodItem> getAllFoodItems() {
        return foodItemRepository.findAll();
    }

    public Optional<FoodItem> getFoodItemById(Long id) {
        return foodItemRepository.findById(id);
    }

    @Transactional 
    public FoodItem createFoodItem(FoodItem foodItem, String categoryName) {
        if (categoryName != null && !categoryName.isBlank()) {
            Optional<Category> catOpt = categoryRepository.findByCategoryNameIgnoreCase(categoryName.trim());
            if (catOpt.isPresent()) {
                foodItem.setCategory(catOpt.get());
            } else {
                Category newCat = new Category();
                newCat.setCategoryName(categoryName.trim());
                newCat.setDescription(categoryName.trim() + " dishes");
                Category savedCat = categoryRepository.save(newCat);
                foodItem.setCategory(savedCat);
            }
        }
        return foodItemRepository.save(foodItem);
    }

    @Transactional
    public Optional<FoodItem> updateFoodItem(Long id, FoodItem updatedItem, String categoryName) {
        return foodItemRepository.findById(id).map(existing -> {
            if (updatedItem.getFoodName() != null) {
                existing.setFoodName(updatedItem.getFoodName());
            }
            if (updatedItem.getDescription() != null) {
                existing.setDescription(updatedItem.getDescription());
            }
            if (updatedItem.getPrice() != null) {
                existing.setPrice(updatedItem.getPrice());
            }
            if (updatedItem.getImageUrl() != null) {
                existing.setImageUrl(updatedItem.getImageUrl());
            }
            if (updatedItem.getAvailable() != null) {
                existing.setAvailable(updatedItem.getAvailable());
            }
            if (categoryName != null && !categoryName.isBlank()) {
                Optional<Category> catOpt = categoryRepository.findByCategoryNameIgnoreCase(categoryName.trim());
                if (catOpt.isPresent()) {
                    existing.setCategory(catOpt.get());
                }
            }
            return foodItemRepository.save(existing);
        });
    }

    @Transactional
    public boolean deleteFoodItem(Long id) {
        if (foodItemRepository.existsById(id)) {
            foodItemRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
