import React, { useState } from 'react'
import { api } from '../utils/api'
import { Link, useNavigate } from 'react-router-dom'
import Notification from '../Components/Notification'

const AdminLogin = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    username: '',
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
      const response = await api.adminLogin(form.username, form.password)
      localStorage.setItem('admin_token', response.token)
      setNotification({ message: 'Admin girişi uğurla tamamlandı!', type: 'success' })
      setTimeout(() => {
        navigate('/admin')
      }, 1500)
    } catch (error) {
      console.error('Admin login error:', error)
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
          <h2>Admin Girişi</h2>
        </div>
        <div className="card-body">
          <form className="form" onSubmit={handleSubmit}>
            <div className="form-row">
              <label>İstifadəçi Adı *</label>
              <input
                type="text"
                name="username"
                required
                value={form.username}
                onChange={handleChange}
                placeholder="İstifadəçi adınızı daxil edin"
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

          
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
