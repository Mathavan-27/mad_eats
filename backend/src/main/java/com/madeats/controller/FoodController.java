package com.madeats.controller;

import com.madeats.entity.FoodItem;
import com.madeats.service.FoodService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"}, allowCredentials = "true")
public class FoodController {

    @Autowired
    private FoodService foodService;

    @GetMapping("/foods")
    public ResponseEntity<List<FoodItem>> getAllFoods() {
        return ResponseEntity.ok(foodService.getAllFoodItems());
    }

    @GetMapping("/foods/{id}")
    public ResponseEntity<FoodItem> getFoodById(@PathVariable Long id) {
        return foodService.getFoodItemById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/owner/foods")
    public ResponseEntity<?> addFood(@RequestBody Map<String, Object> payload) {
        try {
            FoodItem food = new FoodItem();
            food.setFoodName((String) payload.get("foodName"));
            food.setDescription((String) payload.get("description"));
            Object priceObj = payload.get("price");
            if (priceObj != null) {
                food.setPrice(new java.math.BigDecimal(priceObj.toString()));
            }
            food.setImageUrl((String) payload.get("imageUrl"));
            Object availObj = payload.get("available");
            food.setAvailable(availObj == null || Boolean.parseBoolean(availObj.toString()));

            String categoryName = (String) payload.get("categoryName");
            FoodItem saved = foodService.createFoodItem(food, categoryName);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/owner/foods/{id}")
    public ResponseEntity<?> updateFood(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        FoodItem food = new FoodItem();
        if (payload.containsKey("foodName")) {
            food.setFoodName((String) payload.get("foodName"));
        }
        if (payload.containsKey("description")) {
            food.setDescription((String) payload.get("description"));
        }
        if (payload.containsKey("price")) {
            food.setPrice(new java.math.BigDecimal(payload.get("price").toString()));
        }
        if (payload.containsKey("imageUrl")) {
            food.setImageUrl((String) payload.get("imageUrl"));
        }
        if (payload.containsKey("available")) {
            food.setAvailable(Boolean.parseBoolean(payload.get("available").toString()));
        }
        String categoryName = (String) payload.get("categoryName");

        return foodService.updateFoodItem(id, food, categoryName)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/owner/foods/{id}")
    public ResponseEntity<?> deleteFood(@PathVariable Long id) {
        if (foodService.deleteFoodItem(id)) {
            return ResponseEntity.ok(Map.of("message", "Food item deleted successfully"));
        }
        return ResponseEntity.notFound().build();
    }
}
