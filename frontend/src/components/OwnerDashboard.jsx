import React, { useState, useEffect } from 'react'
import {
  ShoppingBag,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  Users,
  Utensils,
  ArrowLeft,
  DollarSign,
  Download,
  Eye,
  Phone,
  Mail,
  MapPin,
  Calendar,
  BellRing,
  X,
  FileText,
  ShieldCheck,
  Search,
  RefreshCw,
  AlertTriangle,
  Check,
  CheckCheck,
  MessageSquare
} from 'lucide-react'
import { downloadOrderReceipt } from '../utils/receiptGenerator'

export default function OwnerDashboard({
  orders,
  onUpdateOrderStatus,
  foodItems,
  onAddFood,
  onDeleteFood,
  onToggleFoodAvailability,
  onClose
}) {
  const [activeTab, setActiveTab] = useState('orders')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [orderSearchQuery, setOrderSearchQuery] = useState('')
  const [customerSearchQuery, setCustomerSearchQuery] = useState('')
  const [notificationTypeFilter, setNotificationTypeFilter] = useState('ALL')

  const [liveOrders, setLiveOrders] = useState(orders || [])
  const [liveCustomers, setLiveCustomers] = useState([])
  const [notificationLogs, setNotificationLogs] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [retryingLogId, setRetryingLogId] = useState(null)
  const [retryFeedback, setRetryFeedback] = useState('')

  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null)
  const [selectedCustomerProfile, setSelectedCustomerProfile] = useState(null)

  const [newFoodName, setNewFoodName] = useState('')
  const [newFoodCategory, setNewFoodCategory] = useState('Main Course')
  const [newFoodPrice, setNewFoodPrice] = useState('')
  const [newFoodDesc, setNewFoodDesc] = useState('')
  const [newFoodImg, setNewFoodImg] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

  const fetchLiveOrders = async () => {
    try {
      const res = await fetch('/api/owner/orders')
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) {
          const mapped = data.map((o) => ({
            id: o.id,
            userId: o.user?.id || null,
            customerEmail: o.customerEmail || o.user?.email || null,
            orderId: o.orderCode || `ME-${String(o.id).padStart(6, '0')}`,
            customerName: o.customerName,
            phone: o.phone,
            deliveryAddress: o.deliveryAddress,
            orderDate: new Date(o.orderDate || Date.now()).toLocaleString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            rawOrderDate: o.orderDate,
            subtotal: Number(o.subtotal || 0),
            gstAmount: Number(o.gstAmount || 0),
            deliveryFee: Number(o.deliveryFee || 0),
            totalAmount: Number(o.totalAmount || 0),
            paymentMethod: o.paymentMethod || 'Cash on Delivery (COD)',
            orderStatus: o.orderStatus || 'PLACED',
            items: (o.items || []).map((it) => ({
              foodItemId: it.foodItem?.id || it.id,
              foodName: it.foodName,
              quantity: it.quantity,
              price: Number(it.price || 0),
              subtotal: Number(it.subtotal || 0)
            }))
          }))
          setLiveOrders(mapped)
        }
      }
    } catch (e) {}
  }

  const fetchLiveCustomers = async () => {
    try {
      const res = await fetch('/api/owner/customers')
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) {
          setLiveCustomers(data)
        }
      }
    } catch (e) {}
  }

  const fetchLiveNotifications = async () => {
    try {
      const res = await fetch('/api/owner/notification-logs')
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) {
          setNotificationLogs(data)
          const unread = data.filter((n) => n.isRead === false).length
          setUnreadCount(unread)
          return
        }
      }
      const legacyRes = await fetch('/api/owner/notifications')
      if (legacyRes.ok) {
        const leg = await legacyRes.json()
        if (Array.isArray(leg)) {
          setNotificationLogs(leg.map((l) => ({
            id: l.id,
            orderId: l.orderId,
            notificationType: 'SMS',
            recipient: l.ownerPhone || '9363114514',
            subject: l.emailSubject || 'MAD EATS - NEW ORDER RECEIVED!',
            messageContent: l.smsMessage,
            status: l.smsStatus || 'SIMULATED',
            errorMessage: null,
            retryCount: 0,
            isRead: false,
            sentAt: l.sentAt
          })))
        }
      }
    } catch (e) {}
  }

  useEffect(() => {
    fetchLiveOrders()
    fetchLiveCustomers()
    fetchLiveNotifications()

    const interval = setInterval(() => {
      fetchLiveOrders()
      fetchLiveNotifications()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (orders && orders.length > 0) {
      setLiveOrders(orders)
    }
  }, [orders])

  const totalOrders = liveOrders.length
  const pendingOrdersCount = liveOrders.filter(
    (o) => o.orderStatus === 'PLACED' || o.orderStatus === 'CONFIRMED' || o.orderStatus === 'PREPARING' || o.orderStatus === 'OUT FOR DELIVERY'
  ).length
  const completedOrdersCount = liveOrders.filter((o) => o.orderStatus === 'DELIVERED').length
  const cancelledOrdersCount = liveOrders.filter((o) => o.orderStatus === 'CANCELLED').length
  const totalSales = liveOrders
    .filter((o) => o.orderStatus !== 'CANCELLED')
    .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0)

  const distinctCustomerCount = Math.max(
    liveCustomers.length,
    new Set(liveOrders.map((o) => o.phone)).size
  )

  const filteredOrders = liveOrders.filter((order) => {
    const matchesStatus = filterStatus === 'ALL' || order.orderStatus === filterStatus
    if (!orderSearchQuery.trim()) return matchesStatus

    const q = orderSearchQuery.toLowerCase().trim()
    const matchesQuery =
      (order.orderId && order.orderId.toLowerCase().includes(q)) ||
      (order.customerName && order.customerName.toLowerCase().includes(q)) ||
      (order.phone && order.phone.includes(q)) ||
      (order.customerEmail && order.customerEmail.toLowerCase().includes(q))

    return matchesStatus && matchesQuery
  })

  const customerRecords = React.useMemo(() => {
    const map = new Map()

    liveCustomers.forEach((c) => {
      map.set(c.phone, {
        id: c.id,
        fullName: c.fullName,
        email: c.email,
        phone: c.phone,
        role: c.role || 'CUSTOMER',
        registeredAt: c.createdAt,
        orders: []
      })
    })

    liveOrders.forEach((o) => {
      const key = o.phone || (o.userId ? `USER-${o.userId}` : `ORD-${o.id}`)
      if (!map.has(key)) {
        map.set(key, {
          id: o.userId || o.id,
          fullName: o.customerName,
          email: o.customerEmail || 'Not Provided',
          phone: o.phone,
          role: 'CUSTOMER',
          registeredAt: o.orderDate,
          orders: []
        })
      }
      const existing = map.get(key)
      if (existing) {
        if (!existing.email || existing.email === 'Not Provided') {
          if (o.customerEmail) existing.email = o.customerEmail
        }
        existing.orders.push(o)
      }
    })

    const list = Array.from(map.values()).map((cust) => {
      cust.orders.sort((a, b) => (b.id || 0) - (a.id || 0))
      const latestOrder = cust.orders[0] || null
      const totalSpend = cust.orders
        .filter((o) => o.orderStatus !== 'CANCELLED')
        .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0)

      let latestItemsSummary = 'None'
      let latestTotalQuantity = 0
      if (latestOrder && latestOrder.items) {
        latestItemsSummary = latestOrder.items.map((it) => `${it.quantity}x ${it.foodName}`).join(', ')
        latestTotalQuantity = latestOrder.items.reduce((s, it) => s + (it.quantity || 1), 0)
      }

      return {
        ...cust,
        latestOrder,
        latestItemsSummary,
        latestTotalQuantity,
        totalSpend
      }
    })

    return list
  }, [liveCustomers, liveOrders])

  const filteredCustomerRecords = customerRecords.filter((cust) => {
    if (!customerSearchQuery.trim()) return true
    const q = customerSearchQuery.toLowerCase().trim()
    return (
      (cust.fullName && cust.fullName.toLowerCase().includes(q)) ||
      (cust.phone && cust.phone.includes(q)) ||
      (cust.email && cust.email.toLowerCase().includes(q)) ||
      (cust.latestOrder?.orderId && cust.latestOrder.orderId.toLowerCase().includes(q))
    )
  })

  const filteredNotifications = notificationLogs.filter((n) => {
    if (notificationTypeFilter === 'ALL') return true
    if (notificationTypeFilter === 'SMS') return (n.notificationType || '').toUpperCase() === 'SMS'
    if (notificationTypeFilter === 'EMAIL') return (n.notificationType || '').toUpperCase() === 'EMAIL'
    if (notificationTypeFilter === 'WHATSAPP') return (n.notificationType || '').toUpperCase() === 'WHATSAPP'
    if (notificationTypeFilter === 'FAILED') return (n.status || '').toUpperCase() === 'FAILED'
    if (notificationTypeFilter === 'SIMULATED') return (n.status || '').toUpperCase() === 'SIMULATED'
    if (notificationTypeFilter === 'UNREAD') return n.isRead === false
    return true
  })

  const handleStatusUpdate = async (orderId, newStatus) => {
    setLiveOrders((prev) =>
      prev.map((o) =>
        o.orderId === orderId || o.id === orderId ? { ...o, orderStatus: newStatus } : o
      )
    )
    if (selectedOrderDetails && (selectedOrderDetails.orderId === orderId || selectedOrderDetails.id === orderId)) {
      setSelectedOrderDetails((prev) => ({ ...prev, orderStatus: newStatus }))
    }
    onUpdateOrderStatus(orderId, newStatus)

    try {
      const numericId =
        typeof orderId === 'number'
          ? orderId
          : parseInt(String(orderId).replace(/\D/g, ''), 10)
      if (numericId) {
        await fetch(`/api/owner/orders/${numericId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        })
      }
    } catch (e) {}
  }

  const handleRetryNotification = async (logId) => {
    setRetryingLogId(logId)
    setRetryFeedback('')
    try {
      const res = await fetch(`/api/owner/notification-logs/${logId}/retry`, {
        method: 'POST'
      })
      if (res.ok) {
        const updated = await res.json()
        setNotificationLogs((prev) =>
          prev.map((item) => (item.id === logId ? updated : item))
        )
        setRetryFeedback(`Alert #${logId} retried successfully!`)
      } else {
        const err = await res.json()
        setRetryFeedback(`Retry failed: ${err.error || 'Server error'}`)
      }
    } catch (e) {
      setRetryFeedback(`Retry failed: ${e.message}`)
    } finally {
      setRetryingLogId(null)
      setTimeout(() => setRetryFeedback(''), 4000)
    }
  }

  const handleMarkAsRead = async (logId) => {
    try {
      const res = await fetch(`/api/owner/notifications/${logId}/read`, {
        method: 'PUT'
      })
      if (res.ok) {
        setNotificationLogs((prev) =>
          prev.map((n) => (n.id === logId ? { ...n, isRead: true } : n))
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch (e) {}
  }

  const handleMarkAllAsRead = async () => {
    try {
      const res = await fetch('/api/owner/notifications/read-all', {
        method: 'PUT'
      })
      if (res.ok) {
        setNotificationLogs((prev) =>
          prev.map((n) => ({ ...n, isRead: true }))
        )
        setUnreadCount(0)
      }
    } catch (e) {}
  }

  const handleDownloadPdf = (order) => {
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

  const handleCreateFood = async (e) => {
    e.preventDefault()
    if (!newFoodName.trim() || !newFoodPrice) return

    const newFood = {
      id: Date.now(),
      name: newFoodName.trim(),
      category: newFoodCategory,
      price: parseFloat(newFoodPrice),
      description: newFoodDesc.trim() || 'Delicious freshly prepared specialty from MAD EATS.',
      available: true,
      image: newFoodImg.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
    }

    try {
      const res = await fetch('/api/owner/foods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          foodName: newFood.name,
          categoryName: newFood.category,
          price: newFood.price,
          description: newFood.description,
          imageUrl: newFood.image,
          available: true
        })
      })
      if (res.ok) {
        const saved = await res.json()
        newFood.id = saved.id
      }
    } catch (err) {}

    onAddFood(newFood)
    setNewFoodName('')
    setNewFoodPrice('')
    setNewFoodDesc('')
    setNewFoodImg('')
    setShowAddModal(false)
  }

  const handleDeleteFoodItem = async (foodId) => {
    try {
      await fetch(`/api/owner/foods/${foodId}`, { method: 'DELETE' })
    } catch (e) {}
    onDeleteFood(foodId)
  }

  const handleToggleAvail = async (foodId) => {
    const food = foodItems.find((f) => f.id === foodId)
    if (food) {
      try {
        await fetch(`/api/owner/foods/${foodId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ available: !food.available })
        })
      } catch (e) {}
    }
    onToggleFoodAvailability(foodId)
  }

  const unreadAlerts = notificationLogs.filter((n) => n.isRead === false)

  return (
    <div className="owner-dashboard-container">
      <header className="owner-header">
        <div className="owner-brand-info">
          <button className="back-to-store-btn" onClick={onClose}>
            <ArrowLeft size={16} />
            <span>Back to Store Website</span>
          </button>
          <div className="owner-title-badge">
            <h1>MAD EATS – Restaurant Owner Portal</h1>
            <span className="owner-tag">Signed in as mathavanpalanisamy9@gmail.com</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div className="owner-top-sms-badge">
            <BellRing size={16} />
            <span>Owner Mobile: <strong>+91 9363114514</strong></span>
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              className="table-action-icon-btn"
              style={{
                background: '#e11d48',
                color: '#fff',
                borderColor: '#e11d48',
                fontWeight: '700',
                padding: '0.5rem 0.85rem'
              }}
              onClick={() => setActiveTab('notifications')}
            >
              <BellRing size={14} />
              <span>{unreadCount} Unread Alert{unreadCount > 1 ? 's' : ''}</span>
            </button>
          )}
        </div>
      </header>

      <section className="metrics-row">
        <div className="metric-card">
          <div className="metric-icon-box sales-icon">
            <DollarSign size={24} />
          </div>
          <div className="metric-text-content">
            <span className="metric-label">Total Sales (COD)</span>
            <strong className="metric-value">₹{totalSales.toFixed(2)}</strong>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box total-icon">
            <ShoppingBag size={24} />
          </div>
          <div className="metric-text-content">
            <span className="metric-label">Total Orders</span>
            <strong className="metric-value">{totalOrders}</strong>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box cust-icon" style={{ background: '#e0e7ff', color: '#4338ca' }}>
            <Users size={24} />
          </div>
          <div className="metric-text-content">
            <span className="metric-label">Total Customers</span>
            <strong className="metric-value">{distinctCustomerCount}</strong>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box prep-icon">
            <Clock size={24} />
          </div>
          <div className="metric-text-content">
            <span className="metric-label">Pending Orders</span>
            <strong className="metric-value">{pendingOrdersCount}</strong>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box deliv-icon">
            <CheckCircle size={24} />
          </div>
          <div className="metric-text-content">
            <span className="metric-label">Completed Orders</span>
            <strong className="metric-value">{completedOrdersCount}</strong>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box cancel-icon">
            <XCircle size={24} />
          </div>
          <div className="metric-text-content">
            <span className="metric-label">Cancelled Orders</span>
            <strong className="metric-value">{cancelledOrdersCount}</strong>
          </div>
        </div>
      </section>

      {unreadAlerts.length > 0 && (
        <section className="new-order-alerts-container" style={{
          background: 'linear-gradient(135deg, #fff1f2 0%, #ffffff 100%)',
          border: '2px solid #fecdd3',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          margin: '1rem 0 1.5rem',
          boxShadow: '0 4px 16px rgba(225, 29, 72, 0.08)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                background: '#e11d48',
                color: '#fff',
                padding: '0.45rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <BellRing size={20} className="spin-icon-slow" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#9f1239', fontWeight: '800' }}>
                  New Order Alert ({unreadAlerts.length})
                </h3>
                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  Fresh food orders received requiring owner attention
                </span>
              </div>
            </div>

            <button
              type="button"
              className="table-action-icon-btn"
              style={{
                background: '#fff',
                border: '1px solid #cbd5e1',
                padding: '0.45rem 0.85rem',
                fontSize: '0.82rem',
                fontWeight: '600'
              }}
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck size={15} style={{ color: '#15803d' }} />
              <span>Mark All as Read</span>
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1rem'
          }}>
            {unreadAlerts.map((log) => {
              const matchedOrder = liveOrders.find((o) => o.id === log.orderId || o.orderId === `ME-${String(log.orderId).padStart(6, '0')}`)
              const orderCode = matchedOrder ? matchedOrder.orderId : `ME-${String(log.orderId).padStart(6, '0')}`
              const customerName = matchedOrder ? matchedOrder.customerName : 'Customer'
              const phone = matchedOrder ? matchedOrder.phone : log.recipient
              const itemsCount = matchedOrder ? (matchedOrder.items || []).reduce((s, it) => s + (it.quantity || 1), 0) : 1
              const itemsSummary = matchedOrder ? (matchedOrder.items || []).map((it) => `${it.quantity}x ${it.foodName}`).join(', ') : 'Order Items'
              const totalAmount = matchedOrder ? matchedOrder.totalAmount : 'COD'
              const orderTime = matchedOrder ? matchedOrder.orderDate : (log.sentAt ? new Date(log.sentAt).toLocaleString('en-IN') : 'Just now')

              return (
                <div
                  key={log.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #fca5a5',
                    borderRadius: '12px',
                    padding: '1rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{
                        background: '#ffe4e6',
                        color: '#e11d48',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: '800'
                      }}>
                        {orderCode}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{orderTime}</span>
                    </div>

                    <div style={{ marginBottom: '0.5rem' }}>
                      <strong style={{ fontSize: '0.98rem', color: '#0f172a' }}>{customerName}</strong>
                      <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#475569' }}>
                        Phone: <a href={`tel:${phone}`} style={{ color: '#e11d48', fontWeight: '600' }}>{phone}</a>
                      </p>
                    </div>

                    <div style={{
                      background: '#f8fafc',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      color: '#334155',
                      marginBottom: '0.75rem',
                      lineHeight: '1.4'
                    }}>
                      <div style={{ fontWeight: '700', marginBottom: '2px' }}>Ordered Items ({itemsCount}):</div>
                      <div>{itemsSummary}</div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.86rem', marginBottom: '0.75rem' }}>
                      <span style={{ color: '#64748b' }}>Total Amount:</span>
                      <strong style={{ color: '#e11d48', fontSize: '1.05rem' }}>₹{totalAmount}</strong>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: '700', marginBottom: '0.75rem' }}>
                      Payment Method: CASH ON DELIVERY
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                    <button
                      type="button"
                      className="table-action-icon-btn"
                      style={{
                        flex: 1,
                        background: '#e11d48',
                        color: '#fff',
                        borderColor: '#e11d48',
                        justifyContent: 'center',
                        padding: '0.45rem'
                      }}
                      onClick={() => {
                        if (matchedOrder) {
                          setSelectedOrderDetails(matchedOrder)
                        } else {
                          fetch(`/api/orders/${log.orderId}`)
                            .then((r) => r.json())
                            .then((o) => setSelectedOrderDetails(o))
                            .catch(() => {})
                        }
                      }}
                    >
                      <Eye size={14} />
                      <span>View Order</span>
                    </button>

                    <button
                      type="button"
                      className="table-action-icon-btn"
                      style={{
                        background: '#f1f5f9',
                        color: '#475569',
                        borderColor: '#cbd5e1',
                        padding: '0.45rem 0.75rem'
                      }}
                      onClick={() => handleMarkAsRead(log.id)}
                      title="Mark as Read"
                    >
                      <Check size={14} />
                      <span>Mark Read</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      <div className="owner-nav-tabs">
        <button
          className={`owner-tab-item ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <ShoppingBag size={18} />
          <span>Order Management ({liveOrders.length})</span>
        </button>
        <button
          className={`owner-tab-item ${activeTab === 'customers' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('customers')
            fetchLiveCustomers()
            fetchLiveOrders()
          }}
        >
          <Users size={18} />
          <span>Customer Details ({customerRecords.length})</span>
        </button>
        <button
          className={`owner-tab-item ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('notifications')
            fetchLiveNotifications()
          }}
        >
          <BellRing size={18} />
          <span>Notification Management ({notificationLogs.length})</span>
          {unreadCount > 0 && (
            <span style={{
              background: '#e11d48',
              color: '#fff',
              fontSize: '0.7rem',
              fontWeight: '800',
              padding: '2px 7px',
              borderRadius: '9999px',
              marginLeft: '4px'
            }}>
              {unreadCount}
            </span>
          )}
        </button>
        <button
          className={`owner-tab-item ${activeTab === 'foods' ? 'active' : ''}`}
          onClick={() => setActiveTab('foods')}
        >
          <Utensils size={18} />
          <span>Food Menu Management ({foodItems.length})</span>
        </button>
      </div>

      {activeTab === 'orders' && (
        <div className="management-card">
          <div className="management-header-row">
            <div>
              <h2>Customer Food Orders</h2>
              <p>View complete customer details, update order status, search by Order ID or Name, and download confirmation reports.</p>
            </div>
            <div className="order-management-controls" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div className="search-input-box" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Search order ID, customer name, phone..."
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  className="owner-search-field"
                  style={{ paddingLeft: '32px', height: '38px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="ALL">All Statuses ({totalOrders})</option>
                <option value="PLACED">PLACED</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="PREPARING">PREPARING</option>
                <option value="OUT FOR DELIVERY">OUT FOR DELIVERY</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>

              <button
                type="button"
                className="table-action-icon-btn"
                style={{ padding: '0.5rem 0.85rem', background: '#f1f5f9', border: '1px solid #cbd5e1' }}
                onClick={fetchLiveOrders}
              >
                <RefreshCw size={14} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer Info</th>
                  <th>Delivery Address</th>
                  <th>Ordered Items</th>
                  <th>Total Amount</th>
                  <th>Payment</th>
                  <th>Order Status</th>
                  <th>Date &amp; Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="empty-table-cell">
                      No orders found matching the filter or search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.orderId || order.id}>
                      <td>
                        <strong className="order-id-cell">{order.orderId}</strong>
                      </td>
                      <td>
                        <div className="cust-cell-block">
                          <strong className="cust-name-line">{order.customerName}</strong>
                          <span className="cust-phone-line">
                            <Phone size={12} />
                            {order.phone}
                          </span>
                          {order.customerEmail && order.customerEmail !== 'Not Provided' && (
                            <span className="cust-email-line">
                              <Mail size={12} />
                              {order.customerEmail}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="address-cell">
                        <div className="address-snippet" title={order.deliveryAddress}>
                          <MapPin size={13} style={{ flexShrink: 0, marginTop: '2px', color: '#64748b' }} />
                          <span>{order.deliveryAddress}</span>
                        </div>
                      </td>
                      <td>
                        <div className="items-list-compact">
                          {(order.items || []).map((it, idx) => (
                            <div key={idx} className="item-line-compact">
                              <span className="item-qty">{it.quantity}x</span>
                              <span className="item-name">{it.foodName}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td>
                        <strong className="order-total-cell">₹{order.totalAmount}</strong>
                      </td>
                      <td>
                        <span className="payment-cod-pill">COD</span>
                      </td>
                      <td>
                        <select
                          value={order.orderStatus}
                          onChange={(e) => handleStatusUpdate(order.id || order.orderId, e.target.value)}
                          className={`status-select status-${(order.orderStatus || 'placed').toLowerCase().replace(/ /g, '-')}`}
                        >
                          <option value="PLACED">PLACED</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="PREPARING">PREPARING</option>
                          <option value="OUT FOR DELIVERY">OUT FOR DELIVERY</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                      <td className="date-time-cell">
                        <div className="date-time-block">
                          <Calendar size={12} />
                          <span>{order.orderDate}</span>
                        </div>
                      </td>
                      <td>
                        <div className="table-actions-row">
                          <button
                            type="button"
                            className="table-action-icon-btn view-btn"
                            onClick={() => setSelectedOrderDetails(order)}
                            title="View complete customer & order details"
                          >
                            <Eye size={14} />
                            <span>View</span>
                          </button>
                          <button
                            type="button"
                            className="table-action-icon-btn download-btn"
                            onClick={() => handleDownloadPdf(order)}
                            title="Download PDF order confirmation report"
                          >
                            <Download size={14} />
                            <span>PDF</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'customers' && (
        <div className="management-card">
          <div className="management-header-row">
            <div>
              <h2>Registered Customers &amp; Ordering Profiles</h2>
              <p>Actual customer information retrieved directly from MySQL. View full contact details, delivery addresses, and past order history.</p>
            </div>
            <div className="order-management-controls" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div className="search-input-box" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Search customer by name, phone, email..."
                  value={customerSearchQuery}
                  onChange={(e) => setCustomerSearchQuery(e.target.value)}
                  className="owner-search-field"
                  style={{ paddingLeft: '32px', height: '38px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>
              <button
                type="button"
                className="table-action-icon-btn"
                style={{ padding: '0.5rem 0.85rem', background: '#f1f5f9', border: '1px solid #cbd5e1' }}
                onClick={() => {
                  fetchLiveCustomers()
                  fetchLiveOrders()
                }}
              >
                <RefreshCw size={14} />
                <span>Refresh Customers</span>
              </button>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer ID</th>
                  <th>Customer Name</th>
                  <th>Mobile Number</th>
                  <th>Email Address</th>
                  <th>Delivery Address</th>
                  <th>Latest Order ID</th>
                  <th>Ordered Food Items</th>
                  <th>Quantity</th>
                  <th>Total Amount</th>
                  <th>Order Date &amp; Time</th>
                  <th>Order Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomerRecords.length === 0 ? (
                  <tr>
                    <td colSpan="12" className="empty-table-cell">
                      No customer records found matching query.
                    </td>
                  </tr>
                ) : (
                  filteredCustomerRecords.map((cust) => {
                    const latest = cust.latestOrder
                    return (
                      <tr key={cust.phone || cust.id}>
                        <td>
                          <strong style={{ color: '#4338ca', fontWeight: '800' }}>CUST-{cust.id}</strong>
                        </td>
                        <td>
                          <strong style={{ color: '#0f172a' }}>{cust.fullName}</strong>
                        </td>
                        <td>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                            <Phone size={12} color="#16a34a" />
                            <strong>{cust.phone}</strong>
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.82rem', color: '#475569' }}>{cust.email || '—'}</span>
                        </td>
                        <td className="address-cell">
                          <span className="address-snippet" title={latest?.deliveryAddress || 'N/A'}>
                            {latest?.deliveryAddress || 'Address on file'}
                          </span>
                        </td>
                        <td>
                          {latest ? (
                            <strong style={{ color: 'var(--primary)', fontSize: '0.85rem' }}>{latest.orderId}</strong>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>None</span>
                          )}
                        </td>
                        <td style={{ maxWidth: '200px' }}>
                          <span style={{ fontSize: '0.8rem', color: '#334155' }}>
                            {cust.latestItemsSummary}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: '700' }}>
                          {cust.latestTotalQuantity || 0}
                        </td>
                        <td>
                          {latest ? (
                            <strong style={{ color: '#0f172a' }}>₹{latest.totalAmount}</strong>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>₹0</span>
                          )}
                        </td>
                        <td className="date-time-cell">
                          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                            {latest?.orderDate || 'N/A'}
                          </span>
                        </td>
                        <td>
                          {latest ? (
                            <span className={`status-badge-inline status-${(latest.orderStatus || 'placed').toLowerCase().replace(/ /g, '-')}`}>
                              {latest.orderStatus}
                            </span>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>Registered</span>
                          )}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="table-action-icon-btn view-btn"
                            onClick={() => setSelectedCustomerProfile({ cust, orders: cust.orders, totalSpend: cust.totalSpend })}
                            title="View customer order history and profile"
                          >
                            <Eye size={13} />
                            <span>Profile</span>
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="management-card">
          <div className="management-header-row">
            <div>
              <h2>Owner Notification Management</h2>
              <p>
                Owner Mobile: <strong>+91 9363114514</strong> | Owner Email: <strong>mathavanpalanisamy9@gmail.com</strong>.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <select
                value={notificationTypeFilter}
                onChange={(e) => setNotificationTypeFilter(e.target.value)}
                className="filter-select"
              >
                <option value="ALL">All Notifications ({notificationLogs.length})</option>
                <option value="UNREAD">Unread Only ({unreadCount})</option>
                <option value="SMS">SMS Alerts Only</option>
                <option value="EMAIL">Email Alerts Only</option>
                <option value="WHATSAPP">WhatsApp Alerts Only</option>
                <option value="SIMULATED">Simulated Only</option>
                <option value="FAILED">Failed Alerts Only</option>
              </select>

              {unreadCount > 0 && (
                <button
                  type="button"
                  className="table-action-icon-btn"
                  style={{ padding: '0.5rem 0.85rem', background: '#dcfce7', border: '1px solid #bbf7d0', color: '#166534', fontWeight: '700' }}
                  onClick={handleMarkAllAsRead}
                >
                  <CheckCheck size={14} />
                  <span>Mark All Read</span>
                </button>
              )}

              <button
                type="button"
                className="table-action-icon-btn"
                style={{ padding: '0.5rem 0.85rem', background: '#f1f5f9', border: '1px solid #cbd5e1' }}
                onClick={fetchLiveNotifications}
              >
                <RefreshCw size={14} />
                <span>Refresh Logs</span>
              </button>
            </div>
          </div>

          {retryFeedback && (
            <div style={{
              margin: '0.75rem 0',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              background: retryFeedback.includes('successfully') ? '#dcfce7' : '#fee2e2',
              color: retryFeedback.includes('successfully') ? '#166534' : '#991b1b',
              fontWeight: '600',
              fontSize: '0.88rem'
            }}>
              {retryFeedback}
            </div>
          )}

          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Log ID</th>
                  <th>Order ID</th>
                  <th>Type</th>
                  <th>Recipient</th>
                  <th>Subject / Header</th>
                  <th>Dispatched Message Content</th>
                  <th>Delivery Status</th>
                  <th>Gateway Notes / Error</th>
                  <th>Retries</th>
                  <th>Read?</th>
                  <th>Timestamp</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredNotifications.length === 0 ? (
                  <tr>
                    <td colSpan="12" className="empty-table-cell">
                      No notification logs found matching filter.
                    </td>
                  </tr>
                ) : (
                  filteredNotifications.map((log) => {
                    let badgeClass = 'status-cancelled'
                    let badgeLabel = log.status

                    if (log.status === 'SENT' || log.status === 'DELIVERED') {
                      badgeClass = 'status-delivered'
                      badgeLabel = 'SENT'
                    } else if (log.status === 'SIMULATED') {
                      badgeClass = 'status-preparing'
                      badgeLabel = 'SIMULATED'
                    } else if (log.status === 'PENDING') {
                      badgeClass = 'status-placed'
                      badgeLabel = 'PENDING'
                    }

                    return (
                      <tr key={log.id} style={{ background: log.isRead === false ? '#fff9f9' : 'inherit' }}>
                        <td>LOG-{log.id}</td>
                        <td>
                          <strong style={{ color: 'var(--primary)' }}>ME-{String(log.orderId).padStart(6, '0')}</strong>
                        </td>
                        <td>
                          <span style={{
                            display: 'inline-block',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: '800',
                            background: log.notificationType === 'SMS' ? '#dbeafe' : log.notificationType === 'EMAIL' ? '#fef3c7' : '#dcfce7',
                            color: log.notificationType === 'SMS' ? '#1e40af' : log.notificationType === 'EMAIL' ? '#92400e' : '#166534'
                          }}>
                            {log.notificationType}
                          </span>
                        </td>
                        <td>
                          <strong style={{ color: log.notificationType === 'SMS' ? '#15803d' : '#0369a1', fontSize: '0.85rem' }}>
                            {log.recipient}
                          </strong>
                        </td>
                        <td style={{ maxWidth: '170px', fontSize: '0.8rem', color: '#334155' }}>
                          {log.subject || 'MAD EATS Alert'}
                        </td>
                        <td style={{ maxWidth: '280px', fontSize: '0.78rem', lineHeight: '1.4', whiteSpace: 'pre-wrap' }}>
                          {log.messageContent}
                        </td>
                        <td>
                          <span className={`status-badge-inline ${badgeClass}`}>
                            {badgeLabel}
                          </span>
                        </td>
                        <td style={{ maxWidth: '180px', fontSize: '0.75rem', color: log.status === 'FAILED' ? '#b91c1c' : '#64748b' }}>
                          {log.errorMessage || '—'}
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: '700' }}>
                          {log.retryCount || 0}
                        </td>
                        <td>
                          {log.isRead === false ? (
                            <span style={{ background: '#fee2e2', color: '#b91c1c', fontSize: '0.7rem', fontWeight: '800', padding: '2px 6px', borderRadius: '4px' }}>
                              UNREAD
                            </span>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Read</span>
                          )}
                        </td>
                        <td style={{ fontSize: '0.76rem', color: '#64748b' }}>
                          {log.sentAt ? new Date(log.sentAt).toLocaleString('en-IN') : 'Recent'}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {log.isRead === false && (
                              <button
                                type="button"
                                className="table-action-icon-btn"
                                style={{ background: '#f1f5f9', color: '#334155', padding: '0.35rem 0.55rem' }}
                                onClick={() => handleMarkAsRead(log.id)}
                                title="Mark as Read"
                              >
                                <Check size={12} />
                              </button>
                            )}
                            <button
                              type="button"
                              className="table-action-icon-btn"
                              style={{
                                background: log.status === 'FAILED' ? '#fee2e2' : '#f1f5f9',
                                color: log.status === 'FAILED' ? '#b91c1c' : '#334155',
                                borderColor: log.status === 'FAILED' ? '#fca5a5' : '#cbd5e1',
                                padding: '0.35rem 0.55rem'
                              }}
                              disabled={retryingLogId === log.id}
                              onClick={() => handleRetryNotification(log.id)}
                              title="Retry notification"
                            >
                              <RefreshCw size={12} className={retryingLogId === log.id ? 'spin-icon' : ''} />
                              <span>{retryingLogId === log.id ? '...' : 'Retry'}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'foods' && (
        <div className="management-card">
          <div className="management-header-row">
            <div>
              <h2>Menu Food Items</h2>
              <p>Add new dishes, update pricing, and toggle instant availability in MySQL.</p>
            </div>
            <button className="add-dish-btn" onClick={() => setShowAddModal(true)}>
              <Plus size={16} />
              <span>Add New Food Item</span>
            </button>
          </div>

          {showAddModal && (
            <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
              <div className="add-food-card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>Add New Food Item</h3>
                  <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>
                    ✕
                  </button>
                </div>
                <form onSubmit={handleCreateFood} className="add-food-form">
                  <div className="input-group">
                    <label>Food Item Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Crispy Dragon Chicken"
                      value={newFoodName}
                      onChange={(e) => setNewFoodName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-row-2">
                    <div className="input-group">
                      <label>Category</label>
                      <select
                        value={newFoodCategory}
                        onChange={(e) => setNewFoodCategory(e.target.value)}
                      >
                        <option value="Breakfast">Breakfast</option>
                        <option value="Starters">Starters</option>
                        <option value="Main Course">Main Course</option>
                        <option value="Biriyani">Biriyani</option>
                        <option value="Burgers">Burgers</option>
                        <option value="Pizza">Pizza</option>
                        <option value="Beverages">Beverages</option>
                        <option value="Desserts">Desserts</option>
                      </select>
                    </div>
                    <div className="input-group">
                      <label>Price (₹)</label>
                      <input
                        type="number"
                        placeholder="e.g. 280"
                        value={newFoodPrice}
                        onChange={(e) => setNewFoodPrice(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="input-group">
                    <label>Description</label>
                    <textarea
                      rows="2"
                      placeholder="Short description of ingredients and flavors"
                      value={newFoodDesc}
                      onChange={(e) => setNewFoodDesc(e.target.value)}
                    />
                  </div>
                  <div className="input-group">
                    <label>Image URL (Optional)</label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={newFoodImg}
                      onChange={(e) => setNewFoodImg(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="save-food-btn">
                    Save to Menu
                  </button>
                </form>
              </div>
            </div>
          )}

          <div className="food-grid-admin">
            {foodItems.map((food) => (
              <div key={food.id} className="admin-food-item-card">
                <img src={food.image} alt={food.name} className="admin-food-img" />
                <div className="admin-food-body">
                  <div className="admin-food-title-row">
                    <h4>{food.name}</h4>
                    <span className="admin-food-price">₹{food.price}</span>
                  </div>
                  <span className="admin-food-category">{food.category}</span>
                  <p className="admin-food-desc">{food.description}</p>

                  <div className="admin-food-controls">
                    <button
                      className={`avail-toggle-btn ${food.available ? 'in' : 'out'}`}
                      onClick={() => handleToggleAvail(food.id)}
                    >
                      {food.available ? '● In Stock' : '○ Out of Stock'}
                    </button>
                    <button
                      className="delete-food-btn"
                      onClick={() => handleDeleteFoodItem(food.id)}
                      title="Delete food item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedOrderDetails && (
        <div className="modal-backdrop" onClick={() => setSelectedOrderDetails(null)}>
          <div className="details-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Customer &amp; Order Details</h2>
                <span className="details-order-tag">{selectedOrderDetails.orderId || `ME-${selectedOrderDetails.id}`}</span>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedOrderDetails(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="details-modal-body">
              <div className="details-customer-card">
                <h3>Customer Information</h3>
                <div className="details-grid-2">
                  <div className="detail-field">
                    <span className="field-label">Customer Name</span>
                    <strong className="field-val">{selectedOrderDetails.customerName}</strong>
                  </div>
                  <div className="detail-field">
                    <span className="field-label">Mobile Number</span>
                    <strong className="field-val">
                      <a href={`tel:${selectedOrderDetails.phone}`} style={{ color: 'var(--primary)' }}>
                        {selectedOrderDetails.phone}
                      </a>
                    </strong>
                  </div>
                  <div className="detail-field">
                    <span className="field-label">Email Address</span>
                    <p className="field-val">{selectedOrderDetails.customerEmail || 'Not Provided'}</p>
                  </div>
                  <div className="detail-field">
                    <span className="field-label">Delivery Address</span>
                    <p className="field-val">{selectedOrderDetails.deliveryAddress}</p>
                  </div>
                  <div className="detail-field">
                    <span className="field-label">Order Date &amp; Time</span>
                    <p className="field-val">{selectedOrderDetails.orderDate}</p>
                  </div>
                  <div className="detail-field">
                    <span className="field-label">Payment Method</span>
                    <p className="field-val" style={{ color: '#15803d', fontWeight: '700' }}>Cash on Delivery (COD)</p>
                  </div>
                </div>
              </div>

              <div className="details-items-card">
                <h3>Ordered Food Items</h3>
                <table className="mini-details-table">
                  <thead>
                    <tr>
                      <th>Item Name</th>
                      <th>Qty</th>
                      <th>Unit Price</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedOrderDetails.items || []).map((it, idx) => (
                      <tr key={idx}>
                        <td><strong>{it.foodName}</strong></td>
                        <td>{it.quantity}</td>
                        <td>₹{it.price}</td>
                        <td>₹{it.subtotal || it.price * it.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="details-calc-box">
                <div className="calc-item">
                  <span>Food Subtotal</span>
                  <strong>₹{selectedOrderDetails.subtotal || selectedOrderDetails.totalAmount}</strong>
                </div>
                <div className="calc-item">
                  <span>Restaurant GST (5%)</span>
                  <strong>₹{selectedOrderDetails.gstAmount || 0}</strong>
                </div>
                <div className="calc-item">
                  <span>Delivery Fee</span>
                  <strong>{selectedOrderDetails.deliveryFee === 0 ? 'FREE' : `₹${selectedOrderDetails.deliveryFee || 0}`}</strong>
                </div>
                <div className="calc-item calc-total">
                  <span>Total Amount (COD)</span>
                  <strong style={{ color: 'var(--primary)', fontSize: '1.25rem' }}>₹{selectedOrderDetails.totalAmount}</strong>
                </div>
              </div>

              <div className="details-modal-actions">
                <div className="status-update-action">
                  <label>Update Order Status:</label>
                  <select
                    value={selectedOrderDetails.orderStatus}
                    onChange={(e) => handleStatusUpdate(selectedOrderDetails.id || selectedOrderDetails.orderId, e.target.value)}
                    className="status-dropdown-large"
                  >
                    <option value="PLACED">PLACED</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="PREPARING">PREPARING</option>
                    <option value="OUT FOR DELIVERY">OUT FOR DELIVERY</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                <button
                  type="button"
                  className="download-report-btn-modal"
                  onClick={() => handleDownloadPdf(selectedOrderDetails)}
                >
                  <Download size={16} />
                  <span>Download Confirmation Report (PDF)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedCustomerProfile && (
        <div className="modal-backdrop" onClick={() => setSelectedCustomerProfile(null)}>
          <div className="details-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Customer Profile &amp; Order History</h2>
                <span className="details-order-tag">Customer CUST-{selectedCustomerProfile.cust.id}</span>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedCustomerProfile(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="details-modal-body">
              <div className="details-customer-card">
                <h3>Customer Contact &amp; Summary</h3>
                <div className="details-grid-2">
                  <div className="detail-field">
                    <span className="field-label">Customer ID</span>
                    <strong className="field-val">CUST-{selectedCustomerProfile.cust.id}</strong>
                  </div>
                  <div className="detail-field">
                    <span className="field-label">Full Name</span>
                    <strong className="field-val">{selectedCustomerProfile.cust.fullName}</strong>
                  </div>
                  <div className="detail-field">
                    <span className="field-label">Mobile Number</span>
                    <strong className="field-val">
                      <a href={`tel:${selectedCustomerProfile.cust.phone}`} style={{ color: 'var(--primary)' }}>
                        {selectedCustomerProfile.cust.phone}
                      </a>
                    </strong>
                  </div>
                  <div className="detail-field">
                    <span className="field-label">Email Address</span>
                    <strong className="field-val">{selectedCustomerProfile.cust.email}</strong>
                  </div>
                  <div className="detail-field">
                    <span className="field-label">Total Orders Placed</span>
                    <strong className="field-val">{selectedCustomerProfile.orders.length} orders</strong>
                  </div>
                  <div className="detail-field">
                    <span className="field-label">Total Lifetime Spend (COD)</span>
                    <strong className="field-val" style={{ color: 'var(--primary)' }}>
                      ₹{selectedCustomerProfile.totalSpend.toFixed(2)}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="details-items-card">
                <h3>Previous Orders for this Customer</h3>
                {selectedCustomerProfile.orders.length === 0 ? (
                  <p style={{ padding: '1rem', color: '#64748b' }}>No orders placed by this customer yet.</p>
                ) : (
                  <div className="customer-orders-accordion">
                    {selectedCustomerProfile.orders.map((o) => (
                      <div key={o.orderId || o.id} style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '1rem',
                        marginBottom: '1rem',
                        background: '#f8fafc'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div>
                            <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{o.orderId || `ME-${o.id}`}</strong>
                            <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: '0.75rem' }}>{o.orderDate}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span className={`status-badge-inline status-${(o.orderStatus || 'placed').toLowerCase().replace(/ /g, '-')}`}>
                              {o.orderStatus}
                            </span>
                            <button
                              type="button"
                              className="table-action-icon-btn download-btn"
                              onClick={() => handleDownloadPdf(o)}
                            >
                              <Download size={13} />
                              <span>PDF Report</span>
                            </button>
                          </div>
                        </div>

                        <div style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '0.5rem' }}>
                          <strong>Delivery Address:</strong> {o.deliveryAddress}
                        </div>

                        <table className="mini-details-table" style={{ background: '#fff' }}>
                          <thead>
                            <tr>
                              <th>Ordered Food Item</th>
                              <th>Qty</th>
                              <th>Price</th>
                              <th>Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(o.items || []).map((it, idx) => (
                              <tr key={idx}>
                                <td>{it.foodName}</td>
                                <td>{it.quantity}</td>
                                <td>₹{it.price}</td>
                                <td>₹{it.subtotal || it.price * it.quantity}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1.25rem', marginTop: '0.5rem', fontSize: '0.88rem' }}>
                          <span>Subtotal: ₹{o.subtotal || o.totalAmount}</span>
                          <span>GST: ₹{o.gstAmount || 0}</span>
                          <strong style={{ color: 'var(--primary)' }}>Total: ₹{o.totalAmount} (COD)</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
