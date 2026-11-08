import React from 'react'
import { Package, Calendar, MapPin, Banknote, ShoppingBag, Download } from 'lucide-react'
import { downloadOrderReceipt } from '../utils/receiptGenerator'

export default function MyOrders({ orders, onExploreMenu }) {
  const getStatusClass = (status) => {
    switch (status) {
      case 'PLACED':
        return 'status-placed'
      case 'CONFIRMED':
        return 'status-confirmed'
      case 'PREPARING':
        return 'status-preparing'
      case 'OUT FOR DELIVERY':
        return 'status-out'
      case 'DELIVERED':
        return 'status-delivered'
      case 'CANCELLED':
        return 'status-cancelled'
      default:
        return 'status-default'
    }
  }

  const handleDownload = (order) => {
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

  if (!orders || orders.length === 0) {
    return (
      <div className="orders-empty-state">
        <div className="empty-box-icon">
          <Package size={52} />
        </div>
        <h2>No Orders Placed Yet</h2>
        <p>You haven't ordered anything delicious from MAD EATS yet.</p>
        <button className="browse-menu-btn" onClick={onExploreMenu}>
          Explore Menu &amp; Order Now
        </button>
      </div>
    )
  }

  return (
    <div className="my-orders-view">
      <div className="orders-header">
        <h2>My Orders ({orders.length})</h2>
        <p>Track your past and active food deliveries from MAD EATS.</p>
      </div>

      <div className="orders-list">
        {orders.map((order) => (
          <div key={order.orderId || order.id} className="order-history-card">
            <div className="order-card-top">
              <div className="order-id-group">
                <span className="order-tag-label">ORDER ID</span>
                <span className="order-tag-num">{order.orderId || `ME-${order.id}`}</span>
              </div>
              <span className={`status-pill ${getStatusClass(order.orderStatus)}`}>
                {order.orderStatus}
              </span>
            </div>

            <div className="order-meta-info">
              <div className="meta-info-item">
                <Calendar size={15} />
                <span>{order.orderDate}</span>
              </div>
              <div className="meta-info-item">
                <MapPin size={15} />
                <span>{order.deliveryAddress}</span>
              </div>
              <div className="meta-info-item">
                <Banknote size={15} />
                <span>Payment: Cash on Delivery (COD)</span>
              </div>
            </div>

            <div className="order-items-table">
              <span className="items-table-heading">Items Ordered:</span>
              <div className="items-table-grid">
                {(order.items || []).map((it, idx) => (
                  <div key={idx} className="order-item-record">
                    <span className="item-record-name">
                      <strong>{it.quantity}x</strong> {it.foodName}
                    </span>
                    <span className="item-record-price">₹{it.subtotal || it.price * it.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-financial-breakdown" style={{
              display: 'flex',
              justifyContent: 'space-between',
              background: '#f8fafc',
              padding: '0.65rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              color: '#475569',
              margin: '0.75rem 0'
            }}>
              <span>Subtotal: ₹{order.subtotal || order.totalAmount}</span>
              <span>GST (5%): ₹{order.gstAmount || 0}</span>
              <span>Delivery: {order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee || 0}`}</span>
            </div>

            <div className="order-card-bottom">
              <div className="delivery-person-note">
                <span className="cod-badge-small">COD</span>
                <span>Pay cash to the delivery partner</span>
                <button
                  type="button"
                  className="receipt-download-link"
                  onClick={() => handleDownload(order)}
                >
                  <Download size={13} />
                  <span>Download Report (PDF)</span>
                </button>
              </div>
              <div className="total-due-box">
                <span className="total-due-label">Total Amount</span>
                <span className="total-due-amount">₹{order.totalAmount}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
