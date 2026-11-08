import React from 'react'
import { Award, Clock, Heart, ShieldCheck } from 'lucide-react'

export default function AboutUs({ onExploreMenu }) {
  return (
    <section className="about-us-container">
      <div className="about-hero">
        <span className="about-pill">Our Culinary Story</span>
        <h2>About MAD EATS</h2>
        <p className="about-lead">
          MAD EATS was born with a simple, uncompromising obsession: crafting insanely delicious, mouth-watering food using premium local ingredients, authentic slow-cooking techniques, and serving it fast with 100% Cash on Delivery convenience.
        </p>
      </div>

      <div className="about-grid">
        <div className="about-card">
          <div className="about-card-icon">
            <Heart size={26} />
          </div>
          <h3>Handcrafted With Passion</h3>
          <p>Every single dish from our aromatic Biriyanis to artisan sourdough Pizzas is prepared from scratch by dedicated master chefs.</p>
        </div>

        <div className="about-card">
          <div className="about-card-icon">
            <ShieldCheck size={26} />
          </div>
          <h3>100% Cash on Delivery</h3>
          <p>We respect customer peace of mind. No card details, no online payment failures. Inspect your order and pay with cash at your doorstep.</p>
        </div>

        <div className="about-card">
          <div className="about-card-icon">
            <Clock size={26} />
          </div>
          <h3>Hot &amp; Fast Delivery</h3>
          <p>Our insulated delivery pods guarantee your food arrives piping hot, crispy, and fresh within 30-40 minutes of placing your order.</p>
        </div>

        <div className="about-card">
          <div className="about-card-icon">
            <Award size={26} />
          </div>
          <h3>Uncompromised Hygiene</h3>
          <p>Strict food safety standards, temperature-controlled kitchens, and clean tamper-proof packaging ensure safe dining every time.</p>
        </div>
      </div>

      <div className="about-cta-card">
        <h3>Taste the MADness Today</h3>
        <p>Join thousands of happy foodies who order their daily meals from MAD EATS.</p>
        <button className="cta-primary-btn" onClick={onExploreMenu}>
          Explore Our Menu
        </button>
      </div>
    </section>
  )
}
