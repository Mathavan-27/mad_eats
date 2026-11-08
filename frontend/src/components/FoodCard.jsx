import React from 'react'
import { Plus, Minus, Star, Flame } from 'lucide-react'

export default function FoodCard({ food, cartQty, onAddToCart, onUpdateQty }) {
  return (
    <div className={`food-card ${!food.available ? 'food-card-unavailable' : ''}`}>
      <div className="food-img-container">
        <img src={food.image} alt={food.name} className="food-img" loading="lazy" />
        <div className="card-top-badges">
          <div className="category-pill-glass">{food.category}</div>
          {food.bestseller && (
            <div className="bestseller-badge">
              <Flame size={12} />
              <span>Bestseller</span>
            </div>
          )}
        </div>

        <div className="card-rating-float">
          <Star size={13} fill="#f59e0b" color="#f59e0b" />
          <span>{food.rating || '4.8'}</span>
        </div>

        {!food.available && (
          <div className="out-of-stock-overlay">
            <span>Sold Out Today</span>
          </div>
        )}
      </div>

      <div className="food-details">
        <div className="food-header">
          <div className="food-title-group">
            <span className={`veg-indicator ${food.isVeg ? 'veg' : 'non-veg'}`}>
              <span className="veg-dot"></span>
            </span>
            <h3 className="food-name">{food.name}</h3>
          </div>
          <div className="food-price-wrap">
            <span className="currency-symbol">₹</span>
            <span className="food-price">{food.price}</span>
          </div>
        </div>

        <p className="food-desc">{food.description}</p>

        <div className="food-card-footer">
          <div className="food-footer-left">
            <span className={`stock-status ${food.available ? 'in-stock' : 'out-stock'}`}>
              {food.available ? '● Fresh & Ready' : '○ Unavailable'}
            </span>
            <span className="cod-label-mini">COD</span>
          </div>

          {food.available ? (
            cartQty > 0 ? (
              <div className="card-qty-stepper">
                <button
                  className="stepper-btn"
                  onClick={() => onUpdateQty(food.id, cartQty - 1)}
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="stepper-count">{cartQty}</span>
                <button
                  className="stepper-btn"
                  onClick={() => onUpdateQty(food.id, cartQty + 1)}
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>
            ) : (
              <button
                className="add-to-cart-btn"
                onClick={() => onAddToCart(food)}
              >
                <Plus size={16} />
                <span>Add</span>
              </button>
            )
          ) : (
            <button className="add-to-cart-btn disabled" disabled>
              Sold Out
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
