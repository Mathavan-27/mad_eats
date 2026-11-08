import React from 'react'
import { ArrowRight, Sparkles, Clock, ShieldCheck, Flame, Star, Award } from 'lucide-react'

export default function Hero({ onExploreMenu }) {
  return (
    <section className="hero-section">
      <div className="hero-backdrop-glow"></div>
      <div className="hero-grid">
        <div className="hero-content">
          <div className="hero-pill-badge">
            <span className="live-dot"></span>
            <Flame size={15} className="hero-flame-icon" />
            <span>KITCHEN IS FIRING UP ORDERS NOW</span>
          </div>

          <h1 className="hero-heading">
            Where Pure Madness Meets <span className="highlight-gradient">Gourmet Flavor.</span>
          </h1>

          <p className="hero-subtext">
            Authentic slow-dum Biriyanis, stone-baked artisan Pizzas, crispy Smash Burgers, and sizzling Starters handcrafted by master chefs. Zero online payment worries — <strong>100% Cash on Delivery (COD)</strong> at your doorstep.
          </p>

          <div className="hero-cta-wrapper">
            <button className="cta-primary-btn" onClick={onExploreMenu}>
              <span>Order Food Now</span>
              <ArrowRight size={18} />
            </button>

            <div className="cod-trust-banner">
              <div className="cod-coin-icon">💵</div>
              <div className="cod-trust-text">
                <strong>Pay with Cash on Delivery (COD)</strong>
                <span>Pay only when hot food arrives at your door.</span>
              </div>
            </div>
          </div>

          <div className="hero-stats-row">
            <div className="stat-card">
              <div className="stat-rating-stars">
                <Star size={15} fill="#f59e0b" color="#f59e0b" />
                <Star size={15} fill="#f59e0b" color="#f59e0b" />
                <Star size={15} fill="#f59e0b" color="#f59e0b" />
                <Star size={15} fill="#f59e0b" color="#f59e0b" />
                <Star size={15} fill="#f59e0b" color="#f59e0b" />
              </div>
              <span className="stat-num">4.9 / 5.0</span>
              <span className="stat-label">From 3,200+ Foodies</span>
            </div>

            <div className="stat-card">
              <Clock size={20} className="stat-icon-clock" />
              <span className="stat-num">30 Mins</span>
              <span className="stat-label">Average Delivery Time</span>
            </div>

            <div className="stat-card">
              <Award size={20} className="stat-icon-chef" />
              <span className="stat-num">100% Fresh</span>
              <span className="stat-label">Cooked to Order</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-visual-card">
            <div className="visual-image-box">
              <img
                src="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=900&q=85"
                alt="Royal Hyderabadi Biriyani"
                className="hero-main-img"
              />
              <div className="visual-gradient-overlay"></div>
            </div>

            <div className="floating-specialty-card">
              <div className="specialty-badge">
                <Flame size={13} />
                <span>#1 BESTSELLER</span>
              </div>
              <h3>Royal Hyderabadi Dum Biriyani</h3>
              <p>Slow-cooked with pure saffron, marinated chicken &amp; aged basmati.</p>
              <div className="specialty-bottom">
                <span className="specialty-price">₹320</span>
                <span className="specialty-cod-tag">Cash on Delivery</span>
              </div>
            </div>

            <div className="floating-badge-hot">
              <Sparkles size={16} />
              <span>Free Delivery &gt; ₹499</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
