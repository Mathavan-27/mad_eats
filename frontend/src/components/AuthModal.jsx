import React, { useState } from 'react'
import { X, User, Mail, Phone, Lock, ShieldCheck, ArrowRight, AlertCircle, UserPlus } from 'lucide-react'

export default function AuthModal({
  isOpen,
  onClose,
  initialTab = 'login',
  onLoginSuccess,
  onOpenOwnerDashboard
}) {
  if (!isOpen) return null

  const [authMode, setAuthMode] = useState(initialTab)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showNotRegisteredPopup, setShowNotRegisteredPopup] = useState(false)
  const [unregisteredEmail, setUnregisteredEmail] = useState('')

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!fullName.trim()) {
      setError('Please provide your full name')
      return
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address')
      return
    }
    if (!phone.trim() || phone.length < 10) {
      setError('Please provide a valid 10-digit phone number')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          password: password
        })
      })

      const data = await response.json()

      if (response.ok && data.status === 'SUCCESS') {
        onLoginSuccess(data.user)
        onClose()
      } else {
        setError(data.message || 'Registration failed. Please try again.')
      }
    } catch (err) {
      setError('Failed to connect to the backend server. Please verify Spring Boot is running.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCustomerLogin = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      setError('Please enter your email and password')
      return
    }

    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password
        })
      })

      const data = await response.json()

      if (response.status === 404 || data.status === 'USER_NOT_FOUND') {
        setUnregisteredEmail(email.trim().toLowerCase())
        setShowNotRegisteredPopup(true)
        setIsLoading(false)
        return
      }

      if (response.status === 401 || data.status === 'INVALID_PASSWORD') {
        setError('Incorrect password. Please verify and try again.')
        setIsLoading(false)
        return
      }

      if (response.ok && data.status === 'SUCCESS') {
        onLoginSuccess(data.user)
        onClose()
      } else {
        setError(data.message || 'Login failed. Please try again.')
      }
    } catch (err) {
      setError('Unable to reach server. Please ensure the backend is running on port 8080.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOwnerLogin = async (e) => {
    e.preventDefault()
    if (email.trim().toLowerCase() !== 'mathavanpalanisamy9@gmail.com') {
      setError('Access Denied: Only mathavanpalanisamy9@gmail.com has owner permissions.')
      return
    }
    if (!password) {
      setError('Please enter the owner password')
      return
    }

    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password
        })
      })

      const data = await response.json()

      if (response.ok && data.status === 'SUCCESS') {
        if (data.user.role === 'OWNER') {
          onLoginSuccess(data.user)
          onClose()
          onOpenOwnerDashboard()
        } else {
          setError('Access Denied: This account does not possess OWNER privileges.')
        }
      } else {
        setError(data.message || 'Invalid owner credentials.')
      }
    } catch (err) {
      setError('Backend connection error. Please verify Spring Boot.')
    } finally {
      setIsLoading(false)
    }
  }

  const switchToRegisterFromPopup = () => {
    setShowNotRegisteredPopup(false)
    setAuthMode('register')
    setEmail(unregisteredEmail)
    setError('')
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
        {showNotRegisteredPopup && (
          <div className="not-registered-overlay">
            <div className="not-registered-popup-content">
              <div className="popup-icon-warning">
                <AlertCircle size={48} />
              </div>
              <h3>Account Not Found!</h3>
              <p>
                The email <strong>{unregisteredEmail}</strong> is not registered in our database.
              </p>
              <p className="popup-subtext">
                Please register your details first so you can log in, place food orders, and track your deliveries.
              </p>

              <div className="popup-action-buttons">
                <button
                  type="button"
                  className="popup-register-btn"
                  onClick={switchToRegisterFromPopup}
                >
                  <UserPlus size={18} />
                  <span>Register Your Details Now</span>
                </button>
                <button
                  type="button"
                  className="popup-cancel-btn"
                  onClick={() => setShowNotRegisteredPopup(false)}
                >
                  Try Another Email
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="modal-header">
          <h2>
            {authMode === 'register'
              ? 'Create Customer Account'
              : authMode === 'owner'
              ? 'Owner Portal Login'
              : 'Customer Login'}
          </h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab-btn ${authMode === 'login' ? 'active' : ''}`}
            onClick={() => {
              setAuthMode('login')
              setError('')
            }}
          >
            Customer Login
          </button>
          <button
            className={`auth-tab-btn ${authMode === 'register' ? 'active' : ''}`}
            onClick={() => {
              setAuthMode('register')
              setError('')
            }}
          >
            Register
          </button>
          <button
            className={`auth-tab-btn ${authMode === 'owner' ? 'active' : ''}`}
            onClick={() => {
              setAuthMode('owner')
              setEmail('mathavanpalanisamy9@gmail.com')
              setError('')
            }}
          >
            <ShieldCheck size={14} />
            <span>Owner Portal</span>
          </button>
        </div>

        {error && <div className="form-error-banner">{error}</div>}

        {authMode === 'login' && (
          <form onSubmit={handleCustomerLogin} className="auth-form">
            <div className="input-group">
              <label>
                <Mail size={15} />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                placeholder="youremail@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label>
                <Lock size={15} />
                <span>Password</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="auth-submit-btn" disabled={isLoading}>
              <span>{isLoading ? 'Verifying with Database...' : 'Sign In'}</span>
              <ArrowRight size={17} />
            </button>

            <p className="auth-switch-text">
              Don't have an account yet?{' '}
              <button
                type="button"
                className="link-btn"
                onClick={() => {
                  setAuthMode('register')
                  setError('')
                }}
              >
                Register now
              </button>
            </p>
          </form>
        )}

        {authMode === 'register' && (
          <form onSubmit={handleRegister} className="auth-form">
            <div className="input-group">
              <label>
                <User size={15} />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Karthik Raja"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
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
                placeholder="youremail@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label>
                <Phone size={15} />
                <span>Mobile Phone</span>
              </label>
              <input
                type="tel"
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label>
                <Lock size={15} />
                <span>Password</span>
              </label>
              <input
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label>
                <Lock size={15} />
                <span>Confirm Password</span>
              </label>
              <input
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="auth-submit-btn" disabled={isLoading}>
              <span>{isLoading ? 'Saving in MySQL Database...' : 'Register Account'}</span>
              <ArrowRight size={17} />
            </button>

            <p className="auth-switch-text">
              Already registered?{' '}
              <button
                type="button"
                className="link-btn"
                onClick={() => {
                  setAuthMode('login')
                  setError('')
                }}
              >
                Sign In
              </button>
            </p>
          </form>
        )}

        {authMode === 'owner' && (
          <form onSubmit={handleOwnerLogin} className="auth-form">
            <div className="owner-login-badge">
              <ShieldCheck size={20} className="owner-badge-icon" />
              <div>
                <strong>Restaurant Owner Dashboard Access</strong>
                <p>Restricted to authorized restaurant owner</p>
              </div>
            </div>

            <div className="input-group">
              <label>
                <Mail size={15} />
                <span>Owner Email</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label>
                <Lock size={15} />
                <span>Owner Password</span>
              </label>
              <input
                type="password"
                placeholder="Enter owner password (e.g. owner123)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="auth-submit-btn owner-submit-btn"
              disabled={isLoading}
            >
              <ShieldCheck size={18} />
              <span>{isLoading ? 'Authenticating...' : 'Enter Owner Dashboard'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
