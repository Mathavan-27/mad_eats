import React from 'react'
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react'

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQty,
  onRemoveItem,
  onProceedCheckout
}) {
  if (!isOpen) return null

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const deliveryFee = subtotal > 499 || subtotal === 0 ? 0 : 35
  const total = subtotal + deliveryFee

  return (
    <div className="cart-backdrop" onClick={onClose}>
      <div className="cart-panel" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <div className="cart-title-row">
            <ShoppingBag size={22} className="cart-icon-title" />
            <h2>Your Shopping Cart</h2>
            <span className="cart-item-count">({cartItems.length} items)</span>
          </div>
          <button className="close-cart-btn" onClick={onClose} aria-label="Close Cart">
            <X size={20} />
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="cart-empty-state">
            <div className="empty-cart-circle">
              <ShoppingBag size={48} />
            </div>
            <h3>Your cart is empty</h3>
            <p>Looks like you haven't added anything delicious yet.</p>
            <button className="browse-menu-btn" onClick={onClose}>
              Browse Food Menu
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items-list">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item-row">
                  <img src={item.image} alt={item.name} className="cart-item-thumb" />
                  <div className="cart-item-info">
                    <h4 className="cart-item-name">{item.name}</h4>
                    <span className="cart-item-unit-price">₹{item.price} each</span>
                    <div className="cart-item-qty-row">
                      <div className="cart-stepper">
                        <button
                          className="stepper-sub-btn"
                          onClick={() => onUpdateQty(item.id, item.quantity - 1)}
                        >
                          <Minus size={13} />
                        </button>
                        <span className="stepper-val">{item.quantity}</span>
                        <button
                          className="stepper-sub-btn"
                          onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                      <button
                        className="item-remove-btn"
                        onClick={() => onRemoveItem(item.id)}
                        title="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="cart-item-subtotal">
                    ₹{item.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary-section">
              <div className="cod-notice-banner">
                <span className="cod-pill">COD ONLY</span>
                <span>Payment is made in Cash upon delivery.</span>
              </div>

              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="summary-row">
                <span>Delivery Charge</span>
                <span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
              </div>
              <div className="summary-row total-row">
                <strong>Final Total</strong>
                <strong>₹{total}</strong>
              </div>

              <button
                className="checkout-proceed-btn"
                onClick={onProceedCheckout}
              >
                <span>Proceed to Checkout (₹{total})</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
