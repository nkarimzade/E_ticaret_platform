import React, { useState } from 'react'
import { api } from '../utils/api'
import { Link, useNavigate } from 'react-router-dom'
import { saveAuthToken } from '../utils/auth'
import Notification from '../Components/Notification'

const StoreLogin = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    email: '',
    password: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notification, setNotification] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const response = await api.login(form.email, form.password)
      // Hem eski sistemi hem de yeni auth sistemini kullan
      localStorage.setItem('store_token', response.token)
      // Auth sistemine de kaydet (1 haftalık)
      saveAuthToken(response.token, 'store', response.store || response)
      setNotification({ message: 'Mağaza girişi uğurla tamamlandı!', type: 'success' })
      setTimeout(() => {
        navigate('/panel')
      }, 1500)
    } catch (error) {
      console.error('Store login error:', error)
      setNotification({ 
        message: error.message || 'Giriş xətası. Zəhmət olmasa yenidən cəhd edin.', 
        type: 'error' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="page page-narrow">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      
      <div className="card">
        <div className="card-header">
          <h2>Mağaza Girişi</h2>
        </div>
        <div className="card-body">
          <form className="form" onSubmit={handleSubmit}>
            <div className="form-row">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="Email adresinizi daxil edin"
              />
            </div>

            <div className="form-row">
              <label>Şifrə *</label>
              <input
                type="password"
                name="password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="Şifrənizi daxil edin"
              />
            </div>

            <button 
              className="btn btn-primary" 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Giriş edilir...' : 'Giriş et'}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <Link to="/magaza-ac" className="btn btn-outline">
              Mağaza Aç
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StoreLogin
