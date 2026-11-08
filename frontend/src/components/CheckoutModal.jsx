import React, { useState } from 'react'
import { X, MapPin, Phone, User, Mail, Banknote, ShieldCheck, ArrowRight } from 'lucide-react'

export default function CheckoutModal({
  isOpen,
  onClose,
  cartItems,
  currentUser,
  onPlaceOrder
}) {
  if (!isOpen) return null

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const gstAmount = Math.round(subtotal * 0.05 * 100) / 100
  const deliveryFee = subtotal >= 499 || subtotal === 0 ? 0 : 35
  const total = Math.round((subtotal + gstAmount + deliveryFee) * 100) / 100

  const [customerName, setCustomerName] = useState(currentUser?.fullName || '')
  const [email, setEmail] = useState(currentUser?.email || '')
  const [phone, setPhone] = useState(currentUser?.phone || '')
  const [address, setAddress] = useState('')
  const [instructions, setInstructions] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!customerName.trim()) {
      setError('Please enter your full name')
      return
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }
    if (!phone.trim() || phone.trim().length < 10) {
      setError('Please provide a valid 10-digit mobile phone number')
      return
    }
    if (!address.trim() || address.trim().length < 8) {
      setError('Please enter your complete delivery address')
      return
    }

    setError('')
    setIsSubmitting(true)

    const orderPayload = {
      userId: currentUser?.id || null,
      customerName: customerName.trim(),
      customerEmail: email.trim(),
      phone: phone.trim(),
      deliveryAddress: address.trim() + (instructions ? ` (Note: ${instructions})` : ''),
      subtotal: subtotal,
      gstAmount: gstAmount,
      deliveryFee: deliveryFee,
      totalAmount: total,
      paymentMethod: 'Cash on Delivery (COD)',
      items: cartItems.map(item => ({
        foodItemId: item.id,
        foodName: item.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity
      }))
    }

    onPlaceOrder(orderPayload, () => setIsSubmitting(false))
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="checkout-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Complete Your Order</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="checkout-form">
          {error && <div className="form-error-banner">{error}</div>}

          <div className="checkout-grid">
            <div className="checkout-fields">
              <h3 className="section-subtitle">1. Delivery Information</h3>

              <div className="input-group">
                <label>
                  <User size={15} />
                  <span>Full Name</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Karthik Raja"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label>
                  <Mail size={15} />
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  placeholder="e.g. karthik@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label>
                  <Phone size={15} />
                  <span>Mobile Phone Number</span>
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label>
                  <MapPin size={15} />
                  <span>Delivery Address</span>
                </label>
                <textarea
                  rows="3"
                  placeholder="Flat/House No., Street, Landmark, Area, City & Pincode"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label>
                  <span>Special Cooking or Delivery Instructions (Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Extra spicy, don't ring bell"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                />
              </div>

              <h3 className="section-subtitle" style={{ marginTop: '1.5rem' }}>
                2. Payment Method
              </h3>
              <div className="cod-selection-card">
                <div className="cod-radio-row">
                  <input type="radio" checked readOnly id="cod-radio" />
                  <label htmlFor="cod-radio" className="cod-radio-label">
                    <Banknote size={22} className="cod-cash-icon" />
                    <div>
                      <strong>Cash on Delivery (COD)</strong>
                      <p>Pay with cash when your food is delivered.</p>
                    </div>
                  </label>
                </div>
                <div className="cod-security-note">
                  <ShieldCheck size={16} />
                  <span>No card or online payment required. Pay safely at your door.</span>
                </div>
              </div>
            </div>

            <div className="checkout-order-summary">
              <h3 className="section-subtitle">Order Summary</h3>
              <div className="mini-order-list">
                {cartItems.map((item) => (
                  <div key={item.id} className="mini-order-row">
                    <div className="mini-item-title">
                      <strong>{item.quantity}x</strong>
                      <span>{item.name}</span>
                    </div>
                    <span className="mini-item-price">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="checkout-calculation">
                <div className="calc-row">
                  <span>Food Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="calc-row">
                  <span>Restaurant GST (5%)</span>
                  <span>₹{gstAmount}</span>
                </div>
                <div className="calc-row">
                  <span>Delivery Fee</span>
                  <span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
                </div>
                <div className="calc-row total-calc-row">
                  <strong>Total Amount (COD)</strong>
                  <strong>₹{total}</strong>
                </div>
              </div>

              <button
                type="submit"
                className="confirm-order-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  'Saving in Database...'
                ) : (
                  <>
                    <span>Confirm Order (COD: ₹{total})</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
