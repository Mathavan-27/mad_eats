import React, { useState } from 'react'
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react'

export default function ContactUs() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim() || !message.trim()) return
    setSubmitted(true)
    setTimeout(() => {
      setName('')
      setEmail('')
      setMessage('')
      setSubmitted(false)
    }, 4000)
  }

  return (
    <section className="contact-us-container">
      <div className="contact-header">
        <span className="about-pill">Get In Touch</span>
        <h2>Contact MAD EATS</h2>
        <p>Have questions about catering, your order, or feedback? We are here to help!</p>
      </div>

      <div className="contact-layout">
        <div className="contact-info-panel">
          <div className="contact-info-card">
            <div className="contact-icon-wrap">
              <MapPin size={22} />
            </div>
            <div>
              <strong>Restaurant Address</strong>
              <p>42 Food Street, Gourmet Hub, Opp. Central Park, City Center - 600001</p>
            </div>
          </div>

          <div className="contact-info-card">
            <div className="contact-icon-wrap">
              <Phone size={22} />
            </div>
            <div>
              <strong>Phone &amp; Order Helpline</strong>
              <p>+91 98765 43210 / 044 2845 9999</p>
            </div>
          </div>

          <div className="contact-info-card">
            <div className="contact-icon-wrap">
              <Mail size={22} />
            </div>
            <div>
              <strong>Email Support</strong>
              <p>support@madeats.com / mathavanpalanisamy9@gmail.com</p>
            </div>
          </div>

          <div className="contact-info-card">
            <div className="contact-icon-wrap">
              <Clock size={22} />
            </div>
            <div>
              <strong>Kitchen Operating Hours</strong>
              <p>Monday - Sunday: 10:00 AM – 11:30 PM (All 7 Days)</p>
            </div>
          </div>
        </div>

        <div className="contact-form-panel">
          <h3>Send Us a Message</h3>
          {submitted ? (
            <div className="contact-success-msg">
              <CheckCircle2 size={32} />
              <h4>Thank you, {name || 'Foodie'}!</h4>
              <p>Your message has been sent. Our team will get back to you shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="input-group">
                <label>Your Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ananya"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. ananya@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label>Message / Order Feedback</label>
                <textarea
                  rows="4"
                  placeholder="Tell us what you loved or how we can serve you better..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="contact-submit-btn">
                <span>Send Message</span>
                <Send size={16} />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
