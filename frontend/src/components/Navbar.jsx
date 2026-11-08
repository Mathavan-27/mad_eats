import React from 'react'
import { ShoppingBag, User, ShieldCheck, LogOut, Flame, Sparkles } from 'lucide-react'

export default function Navbar({
  activeTab,
  setActiveTab,
  cartCount,
  setIsCartOpen,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenOwner
}) {
  return (
    <header className="navbar-wrapper">
      <div className="top-announcement-bar">
        <div className="announcement-content">
          <Sparkles size={14} className="banner-sparkle" />
          <span><strong>CASH ON DELIVERY (COD) ONLY</strong> • Free Express Delivery On All Orders Above ₹499</span>
          <span className="banner-badge">HOT &amp; FRESH</span>
        </div>
      </div>

      <nav className="navbar-sticky">
        <div className="navbar-inner">
          <div className="nav-left" onClick={() => setActiveTab('home')}>
            <div className="brand-logo-container">
              <div className="logo-box">
                <Flame size={24} className="logo-flame-icon" />
              </div>
              <div className="brand-glow"></div>
            </div>
            <div className="logo-text">
              <span className="logo-title">MAD EATS</span>
              <span className="logo-tag">GOURMET KITCHEN &bull; COD ONLY</span>
            </div>
          </div>

          <ul className="nav-links">
            <li>
              <button
                className={`nav-link-btn ${activeTab === 'home' ? 'active' : ''}`}
                onClick={() => setActiveTab('home')}
              >
                Home
              </button>
            </li>
            <li>
              <button
                className={`nav-link-btn ${activeTab === 'menu' ? 'active' : ''}`}
                onClick={() => setActiveTab('menu')}
              >
                Our Menu
              </button>
            </li>
            <li>
              <button
                className={`nav-link-btn ${activeTab === 'about' ? 'active' : ''}`}
                onClick={() => setActiveTab('about')}
              >
                About Us
              </button>
            </li>
            <li>
              <button
                className={`nav-link-btn ${activeTab === 'contact' ? 'active' : ''}`}
                onClick={() => setActiveTab('contact')}
              >
                Contact
              </button>
            </li>
            {currentUser && (
              <li>
                <button
                  className={`nav-link-btn ${activeTab === 'orders' ? 'active' : ''}`}
                  onClick={() => setActiveTab('orders')}
                >
                  My Orders
                </button>
              </li>
            )}
          </ul>

          <div className="nav-right">
            <button
              className="cart-toggle-btn"
              onClick={() => setIsCartOpen(true)}
              aria-label="View Cart"
            >
              <div className="cart-icon-wrapper">
                <ShoppingBag size={20} />
                {cartCount > 0 && <span className="cart-badge-pulse">{cartCount}</span>}
              </div>
              <span className="cart-text">Cart</span>
            </button>

            {currentUser ? (
              <div className="user-profile-menu">
                <span className="user-greeting">
                  <User size={16} />
                  <span>{currentUser.fullName || currentUser.email}</span>
                </span>
                <button className="logout-btn" onClick={onLogout} title="Log Out">
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button className="login-nav-btn" onClick={onOpenAuth}>
                <User size={16} />
                <span>Sign In</span>
              </button>
            )}

            <button
              className="owner-nav-btn"
              onClick={onOpenOwner}
              title="Owner &amp; Admin Dashboard"
            >
              <ShieldCheck size={16} />
              <span>Owner Portal</span>
            </button>
          </div>
        </div>
      </nav>
    </header>
  )
}
