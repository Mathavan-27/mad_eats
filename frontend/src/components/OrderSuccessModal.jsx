import React from 'react'
import { CheckCircle2, ShoppingBag, MapPin, Phone, Banknote, Calendar, Download, ArrowRight } from 'lucide-react'
import { downloadOrderReceipt } from '../utils/receiptGenerator'

export default function OrderSuccessModal({ order, onClose, onViewOrders }) {
  if (!order) return null

  const handleDownload = () => {
    if (order.id) {
      const link = document.createElement('a')
      link.href = `/api/orders/${order.id}/pdf`
      link.download = `MAD_EATS_Order_${order.orderId || order.id}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      downloadOrderReceipt(order)
    }
  }

  const orderIdText = order.orderId || `ME-${String(order.id).padStart(6, '0')}`

  return (
    <div className="modal-backdrop">
      <div className="success-modal-card">
        <div className="success-icon-wrap">
          <CheckCircle2 size={54} className="success-check-icon" />
        </div>

        <h2 className="success-title">ORDER PLACED SUCCESSFULLY!</h2>
        <p className="success-subtitle">
          Your order has been received successfully.
        </p>

        <div className="order-id-badge-container">
          <span className="order-id-label">YOUR ORDER ID</span>
          <span className="order-id-code">{orderIdText}</span>
        </div>

        <div className="cod-alert-box">
          <Banknote size={22} className="cod-alert-icon" />
          <div>
            <strong>Payment Method: CASH ON DELIVERY</strong>
            <p>Please pay ₹{order.totalAmount} in cash when your food is delivered.</p>
          </div>
        </div>

        <div className="success-details-list">
          <div className="detail-item">
            <span className="detail-label">Customer Name</span>
            <span className="detail-val">{order.customerName}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Contact Mobile</span>
            <span className="detail-val">{order.phone}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Delivery Address</span>
            <span className="detail-val">{order.deliveryAddress}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Ordered Food Items</span>
            <div className="items-mini-pills">
              {(order.items || []).map((it, idx) => (
                <span key={idx} className="item-pill">
                  {it.quantity}x {it.foodName}
                </span>
              ))}
            </div>
          </div>
          <div className="detail-item">
            <span className="detail-label">Order Status</span>
            <span className="status-badge-placed">{order.orderStatus || 'PLACED'}</span>
          </div>
        </div>

        <div className="order-financial-breakdown" style={{
          display: 'flex',
          justifyContent: 'space-between',
          background: '#f8fafc',
          padding: '0.75rem 1rem',
          borderRadius: '10px',
          fontSize: '0.86rem',
          color: '#475569',
          margin: '0.75rem 0'
        }}>
          <span>Subtotal: ₹{order.subtotal || order.totalAmount}</span>
          <span>GST (5%): ₹{order.gstAmount || 0}</span>
          <span>Delivery: {order.deliveryFee === 0 || !order.deliveryFee ? 'FREE' : `₹${order.deliveryFee}`}</span>
          <strong style={{ color: 'var(--primary)' }}>Grand Total: ₹{order.totalAmount}</strong>
        </div>

        <div className="download-receipt-container" style={{ margin: '1rem 0 0.5rem' }}>
          <button
            type="button"
            className="download-receipt-action-btn"
            onClick={handleDownload}
          >
            <Download size={18} />
            <span>Download Receipt</span>
          </button>
        </div>

        <div className="success-actions-row">
          <button className="view-orders-btn" onClick={onViewOrders}>
            <ShoppingBag size={17} />
            <span>Track My Order</span>
          </button>
          <button className="continue-browse-btn" onClick={onClose}>
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  )
}
