package com.madeats.dto;

import java.math.BigDecimal;

public class OrderItemRequest {

    private Long foodItemId;
    private String foodName;
    private Integer quantity;
    private BigDecimal price;
    private BigDecimal subtotal;

    public OrderItemRequest() {
    }

    public OrderItemRequest(Long foodItemId, String foodName, Integer quantity, BigDecimal price, BigDecimal subtotal) {
        this.foodItemId = foodItemId;
        this.foodName = foodName;
        this.quantity = quantity;
        this.price = price;
        this.subtotal = subtotal;
    }

    public Long getFoodItemId() {
        return foodItemId;
    }

    public void setFoodItemId(Long foodItemId) {
        this.foodItemId = foodItemId;
    }

    public String getFoodName() {
        return foodName;
    }

    public void setFoodName(String foodName) {
        this.foodName = foodName;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }
}
