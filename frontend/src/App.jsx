import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import FoodCard from './components/FoodCard'
import CartDrawer from './components/CartDrawer'
import CheckoutModal from './components/CheckoutModal'
import OrderSuccessModal from './components/OrderSuccessModal'
import MyOrders from './components/MyOrders'
import AuthModal from './components/AuthModal'
import OwnerDashboard from './components/OwnerDashboard'
import AboutUs from './components/AboutUs'
import ContactUs from './components/ContactUs'
import { INITIAL_FOOD_ITEMS, INITIAL_CATEGORIES } from './data/foodData'
import { Search, Utensils, Sparkles, Flame, ShieldCheck, Clock, Award, HeartHandshake } from 'lucide-react'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [isOwnerPortal, setIsOwnerPortal] = useState(false)
  const [foodItems, setFoodItems] = useState(() => {
    const saved = localStorage.getItem('madeats_foods_v2')
    return saved ? JSON.parse(saved) : INITIAL_FOOD_ITEMS
  })
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('madeats_cart')
    return saved ? JSON.parse(saved) : []
  })
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('madeats_orders')
    return saved ? JSON.parse(saved) : [
      {
        orderId: 'ME-849201',
        customerName: 'Rahul Sharma',
        phone: '9876543210',
        deliveryAddress: 'Flat 4B, Emerald Heights, MG Road, City Center',
        orderDate: '07 Nov 2026, 10:15 AM',
        totalAmount: 560,
        paymentMethod: 'Cash on Delivery (COD)',
        orderStatus: 'PREPARING',
        items: [
          { foodItemId: 5, foodName: 'Royal Hyderabadi Dum Biriyani', quantity: 1, price: 320, subtotal: 320 },
          { foodItemId: 9, foodName: 'MAD Smash Bacon Cheese Burger', quantity: 1, price: 240, subtotal: 240 }
        ]
      }
    ]
  })
  const [currentPlacedOrder, setCurrentPlacedOrder] = useState(null)

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('madeats_user')
    return saved ? JSON.parse(saved) : null
  })
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authInitialTab, setAuthInitialTab] = useState('login')

  useEffect(() => {
    localStorage.setItem('madeats_cart', JSON.stringify(cartItems))
  }, [cartItems])

  useEffect(() => {
    localStorage.setItem('madeats_orders', JSON.stringify(orders))
  }, [orders])

  useEffect(() => {
    localStorage.setItem('madeats_foods_v2', JSON.stringify(foodItems))
  }, [foodItems])

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('madeats_user', JSON.stringify(currentUser))
    } else {
      localStorage.removeItem('madeats_user')
    }
  }, [currentUser])

  useEffect(() => {
    fetch('/api/foods')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mappedFoods = data.map((f) => ({
            id: f.id,
            name: f.foodName,
            category: f.category?.categoryName || 'Main Course',
            description: f.description,
            price: Number(f.price),
            available: f.available,
            image: f.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
            isVeg: !['Chicken', 'Mutton', 'Bacon', 'Beef', 'Pepperoni'].some((nonveg) =>
              (f.foodName + ' ' + (f.description || '')).includes(nonveg)
            ),
            rating: 4.8,
            reviews: '500+',
            bestseller: f.price > 200
          }))
          setFoodItems(mappedFoods)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const fetchLiveOrders = async () => {
      try {
        let url = '/api/orders/my-orders'
        if (currentUser?.id) {
          url += `?userId=${currentUser.id}`
        } else if (currentUser?.phone) {
          url += `?phone=${encodeURIComponent(currentUser.phone)}`
        }
        const res = await fetch(url)
        if (res.ok) {
          const list = await res.json()
          if (Array.isArray(list) && list.length > 0) {
            const mapped = list.map((o) => ({
              id: o.id,
              orderId: `ME-${String(o.id).padStart(6, '0')}`,
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
            setOrders(mapped)
          }
        }
      } catch (err) {}
    }
    fetchLiveOrders()
  }, [currentUser])

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  const handleAddToCart = (food) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === food.id)
      if (existing) {
        return prev.map((item) =>
          item.id === food.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { ...food, quantity: 1 }]
    })
  }

  const handleUpdateCartQty = (foodId, newQty) => {
    if (newQty <= 0) {
      handleRemoveCartItem(foodId)
      return
    }
    setCartItems((prev) =>
      prev.map((item) => (item.id === foodId ? { ...item, quantity: newQty } : item))
    )
  }

  const handleRemoveCartItem = (foodId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== foodId))
  }

  const handleProceedCheckout = () => {
    setIsCartOpen(false)
    if (!currentUser) {
      setAuthInitialTab('login')
      setIsAuthModalOpen(true)
      return
    }
    setIsCheckoutOpen(true)
  }

  const handlePlaceOrder = async (orderData) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id || null,
          customerName: orderData.customerName,
          customerEmail: orderData.customerEmail,
          phone: orderData.phone,
          deliveryAddress: orderData.deliveryAddress,
          subtotal: orderData.subtotal,
          gstAmount: orderData.gstAmount,
          deliveryFee: orderData.deliveryFee,
          totalAmount: orderData.totalAmount,
          paymentMethod: 'Cash on Delivery (COD)',
          items: orderData.items.map((it) => ({
            foodItemId: it.foodItemId || null,
            foodName: it.foodName,
            quantity: it.quantity,
            price: it.price,
            subtotal: it.subtotal
          }))
        })
      })

      if (response.ok) {
        const saved = await response.json()
        const newOrder = {
          id: saved.id,
          orderId: saved.orderCode || `ME-${String(saved.id).padStart(6, '0')}`,
          customerName: saved.customerName,
          customerEmail: saved.customerEmail || orderData.customerEmail,
          phone: saved.phone,
          deliveryAddress: saved.deliveryAddress,
          orderDate: new Date(saved.orderDate || Date.now()).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          subtotal: Number(saved.subtotal || orderData.subtotal),
          gstAmount: Number(saved.gstAmount || orderData.gstAmount),
          deliveryFee: Number(saved.deliveryFee || orderData.deliveryFee),
          totalAmount: Number(saved.totalAmount || orderData.totalAmount),
          paymentMethod: saved.paymentMethod || 'Cash on Delivery (COD)',
          orderStatus: saved.orderStatus || 'PLACED',
          items: (saved.items || []).map((it) => ({
            foodItemId: it.foodItem?.id || it.id,
            foodName: it.foodName,
            quantity: it.quantity,
            price: Number(it.price || 0),
            subtotal: Number(it.subtotal || 0)
          }))
        }

        if (saved.id) {
          try {
            const link = document.createElement('a')
            link.href = `/api/orders/${saved.id}/pdf`
            link.download = `MAD_EATS_Order_${newOrder.orderId}.pdf`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
          } catch (e) {}
        }

        setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)])
        setCartItems([])
        setIsCheckoutOpen(false)
        setCurrentPlacedOrder(newOrder)
        return
      }
    } catch (err) {}

    const randomSuffix = Math.floor(100000 + Math.random() * 900000)
    const fallbackOrder = {
      ...orderData,
      orderId: `ME-${randomSuffix}`,
      orderDate: new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      orderStatus: 'PLACED'
    }

    setOrders((prev) => [fallbackOrder, ...prev])
    setCartItems([])
    setIsCheckoutOpen(false)
    setCurrentPlacedOrder(fallbackOrder)
  }

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.orderId === orderId || o.id === orderId ? { ...o, orderStatus: newStatus } : o
      )
    )

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
    } catch (err) {}
  }

  const handleAddFood = (newFood) => {
    setFoodItems((prev) => [newFood, ...prev])
  }

  const handleDeleteFood = (foodId) => {
    setFoodItems((prev) => prev.filter((f) => f.id !== foodId))
  }

  const handleToggleFoodAvailability = (foodId) => {
    setFoodItems((prev) =>
      prev.map((f) => (f.id === foodId ? { ...f, available: !f.available } : f))
    )
  }

  const filteredFoodItems = foodItems.filter((food) => {
    const matchesCategory =
      selectedCategory === 'All' || food.category === selectedCategory
    const matchesSearch =
      food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      food.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  if (isOwnerPortal) {
    return (
      <OwnerDashboard
        orders={orders}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        foodItems={foodItems}
        onAddFood={handleAddFood}
        onDeleteFood={handleDeleteFood}
        onToggleFoodAvailability={handleToggleFoodAvailability}
        onClose={() => setIsOwnerPortal(false)}
      />
    )
  }

  return (
    <div className="restaurant-app">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cartCount}
        setIsCartOpen={setIsCartOpen}
        currentUser={currentUser}
        onOpenAuth={() => {
          setAuthInitialTab('login')
          setIsAuthModalOpen(true)
        }}
        onLogout={() => setCurrentUser(null)}
        onOpenOwner={() => {
          if (currentUser?.role === 'OWNER') {
            setIsOwnerPortal(true)
          } else {
            setAuthInitialTab('owner')
            setIsAuthModalOpen(true)
          }
        }}
      />

      <main className="content-container">
        {activeTab === 'home' && (
          <>
            <Hero onExploreMenu={() => setActiveTab('menu')} />

            <section className="category-strip-section">
              <div className="category-strip-inner">
                <span className="strip-label">BROWSE BY CRAVING:</span>
                <div className="strip-chips">
                  {INITIAL_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      className={`strip-chip-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedCategory(cat.id)
                        setActiveTab('menu')
                      }}
                    >
                      <span className="strip-icon">{cat.icon}</span>
                      <span className="strip-name">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="featured-menu-section">
              <div className="section-title-wrap">
                <div className="bestseller-lead-badge">
                  <Flame size={14} />
                  <span>CHEF'S TOP RECOMMENDATIONS</span>
                </div>
                <h2 className="section-title">Popular Cravings at MAD EATS</h2>
                <p className="section-desc">
                  Freshly cooked with authentic fire spices, served steaming hot to your doorstep with 100% Cash on Delivery.
                </p>
              </div>

              <div className="food-grid">
                {foodItems.slice(0, 8).map((food) => {
                  const cartItem = cartItems.find((ci) => ci.id === food.id)
                  return (
                    <FoodCard
                      key={food.id}
                      food={food}
                      cartQty={cartItem ? cartItem.quantity : 0}
                      onAddToCart={handleAddToCart}
                      onUpdateQty={handleUpdateCartQty}
                    />
                  )
                })}
              </div>

              <div className="view-full-menu-cta">
                <button
                  className="cta-primary-btn"
                  onClick={() => setActiveTab('menu')}
                >
                  Explore All Dishes ({foodItems.length})
                </button>
              </div>
            </section>

            <section className="why-mad-section">
              <div className="why-mad-inner">
                <div className="why-mad-header">
                  <span className="section-pill">THE MAD EATS PROMISE</span>
                  <h2>Why Foodies Love Ordering From Us</h2>
                  <p>We believe in high-heat gourmet flavors, reliable delivery, and simple Cash on Delivery.</p>
                </div>

                <div className="why-mad-grid">
                  <div className="why-card">
                    <div className="why-icon-wrap icon-cod">
                      <ShieldCheck size={28} />
                    </div>
                    <h3>100% Cash on Delivery (COD)</h3>
                    <p>No card payments, zero transaction failures. Inspect your order and pay with cash at your doorstep.</p>
                  </div>

                  <div className="why-card">
                    <div className="why-icon-wrap icon-hot">
                      <Clock size={28} />
                    </div>
                    <h3>Piping Hot 30-Min Delivery</h3>
                    <p>Our thermo-insulated bags ensure your Biriyanis, Burgers, and Pizzas stay sizzling hot till the last bite.</p>
                  </div>

                  <div className="why-card">
                    <div className="why-icon-wrap icon-chef">
                      <Award size={28} />
                    </div>
                    <h3>Master Chef Quality</h3>
                    <p>Every single recipe is handcrafted from fresh farm produce, pure ghee, and unadulterated spices daily.</p>
                  </div>

                  <div className="why-card">
                    <div className="why-icon-wrap icon-heart">
                      <HeartHandshake size={28} />
                    </div>
                    <h3>Transparent Pricing</h3>
                    <p>Honest restaurant portions, zero hidden surge pricing, and free delivery on all orders over ₹499.</p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {activeTab === 'menu' && (
          <section className="menu-page-section">
            <div className="menu-header">
              <div className="bestseller-lead-badge">
                <Utensils size={14} />
                <span>GOURMET DINING CATALOG</span>
              </div>
              <h1>Our Delicious Food Menu</h1>
              <p>Explore handcrafted culinary delights across 8 authentic categories.</p>

              <div className="search-and-filter-bar">
                <div className="search-box">
                  <Search size={18} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search by food name, biriyani, paneer 65, burger, pizza, gulab jamun..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      className="clear-search-btn"
                      onClick={() => setSearchQuery('')}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              <div className="category-chips-scroll">
                {INITIAL_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    className={`cat-chip ${selectedCategory === cat.id ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="menu-results-count">
              <span>Showing <strong>{filteredFoodItems.length} dishes</strong> in {selectedCategory === 'All' ? 'All Categories' : selectedCategory}</span>
            </div>

            {filteredFoodItems.length === 0 ? (
              <div className="no-food-found">
                <Utensils size={48} />
                <h3>No dishes found matching "{searchQuery}"</h3>
                <p>Try searching with another food item or select a different category.</p>
                <button
                  className="browse-menu-btn"
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('All')
                  }}
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="food-grid">
                {filteredFoodItems.map((food) => {
                  const cartItem = cartItems.find((ci) => ci.id === food.id)
                  return (
                    <FoodCard
                      key={food.id}
                      food={food}
                      cartQty={cartItem ? cartItem.quantity : 0}
                      onAddToCart={handleAddToCart}
                      onUpdateQty={handleUpdateCartQty}
                    />
                  )
                })}
              </div>
            )}
          </section>
        )}

        {activeTab === 'about' && (
          <AboutUs onExploreMenu={() => setActiveTab('menu')} />
        )}

        {activeTab === 'contact' && <ContactUs />}

        {activeTab === 'orders' && (
          <MyOrders
            orders={orders}
            onExploreMenu={() => setActiveTab('menu')}
          />
        )}
      </main>

      <footer className="restaurant-footer">
        <div className="footer-inner">
          <div className="footer-col brand-col">
            <div className="footer-logo">
              <span className="logo-title">MAD EATS</span>
            </div>
            <p>
              Premium online food ordering with traditional human-crafted cooking. Fresh ingredients, honest pricing, and 100% Cash on Delivery convenience.
            </p>
            <span className="footer-tagline">Pay with cash when your food is delivered.</span>
          </div>

          <div className="footer-col">
            <h4>Quick Navigation</h4>
            <ul>
              <li><button onClick={() => setActiveTab('home')}>Home</button></li>
              <li><button onClick={() => setActiveTab('menu')}>Explore Menu</button></li>
              <li><button onClick={() => setActiveTab('about')}>About Us</button></li>
              <li><button onClick={() => setActiveTab('contact')}>Contact Us</button></li>
              <li><button onClick={() => setActiveTab('orders')}>My Orders</button></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Top Categories</h4>
            <ul>
              <li><button onClick={() => { setActiveTab('menu'); setSelectedCategory('Biriyani'); }}>Hyderabadi Biriyani</button></li>
              <li><button onClick={() => { setActiveTab('menu'); setSelectedCategory('Burgers'); }}>Smash Burgers</button></li>
              <li><button onClick={() => { setActiveTab('menu'); setSelectedCategory('Pizza'); }}>Artisan Pizza</button></li>
              <li><button onClick={() => { setActiveTab('menu'); setSelectedCategory('Starters'); }}>Crispy Starters &amp; Paneer 65</button></li>
              <li><button onClick={() => { setActiveTab('menu'); setSelectedCategory('Desserts'); }}>Royal Gulab Jamun &amp; Desserts</button></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Owner &amp; Admin</h4>
            <p>Authorized restaurant administration dashboard.</p>
            <button
              className="footer-owner-link"
              onClick={() => {
                setAuthInitialTab('owner')
                setIsAuthModalOpen(true)
              }}
            >
              Owner Portal Login
            </button>
            <p className="owner-cred-hint">mathavanpalanisamy9@gmail.com</p>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <p>MAD EATS &copy; {new Date().getFullYear()} – All Rights Reserved. Only Cash on Delivery (COD) accepted.</p>
        </div>
      </footer>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onProceedCheckout={handleProceedCheckout}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        currentUser={currentUser}
        onPlaceOrder={handlePlaceOrder}
      />

      <OrderSuccessModal
        order={currentPlacedOrder}
        onClose={() => setCurrentPlacedOrder(null)}
        onViewOrders={() => {
          setCurrentPlacedOrder(null)
          setActiveTab('orders')
        }}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        initialTab={authInitialTab}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(user) => setCurrentUser(user)}
        onOpenOwnerDashboard={() => setIsOwnerPortal(true)}
      />
    </div>
  )
}

export default App
