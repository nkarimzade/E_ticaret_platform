import React, { useState } from 'react'
import { api } from '../utils/api'
import { saveAuthToken } from '../utils/auth'
import { Link, useNavigate } from 'react-router-dom'
import Notification from '../Components/Notification'

const UserRegister = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notification, setNotification] = useState(null)

  // Telefon numarası formatı
  const formatPhoneNumber = (value) => {
    // Sadece rakamları al
    const numbers = value.replace(/\D/g, '')
    
    // Eğer +994 ile başlıyorsa, onu koru
    if (numbers.startsWith('994')) {
      const remaining = numbers.substring(3)
      if (remaining.length <= 10) {
        return `+994 ${remaining.slice(0, 2)} ${remaining.slice(2, 5)} ${remaining.slice(5, 7)} ${remaining.slice(7, 10)}`.trim()
      }
    }
    
    // Eğer 994 ile başlıyorsa, + ekle
    if (numbers.startsWith('994')) {
      const remaining = numbers.substring(3)
      if (remaining.length <= 10) {
        return `+994 ${remaining.slice(0, 2)} ${remaining.slice(2, 5)} ${remaining.slice(5, 7)} ${remaining.slice(7, 10)}`.trim()
      }
    }
    
    // Eğer 0 ile başlıyorsa, 994 ile değiştir
    if (numbers.startsWith('0')) {
      const remaining = numbers.substring(1)
      if (remaining.length <= 10) {
        return `+994 ${remaining.slice(0, 2)} ${remaining.slice(2, 5)} ${remaining.slice(5, 7)} ${remaining.slice(7, 10)}`.trim()
      }
    }
    
    // Diğer durumlar için
    if (numbers.length <= 10) {
      return `+994 ${numbers.slice(0, 2)} ${numbers.slice(2, 5)} ${numbers.slice(5, 7)} ${numbers.slice(7, 10)}`.trim()
    }
    
    return value
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name === 'phone') {
      // Telefon numarası için özel format
      const formatted = formatPhoneNumber(value)
      setForm((p) => ({ ...p, [name]: formatted }))
    } else {
      setForm((p) => ({ ...p, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})
    
    try {
      const response = await api.registerUser(form)
      
      // Kalıcı oturum için token'ı kaydet
      saveAuthToken(response.token, 'customer', response.user)
      
      setNotification({ message: 'Qeydiyyat uğurla tamamlandı!', type: 'success' })
      setTimeout(() => {
        window.location.href = '/' // Ana sayfaya yönlendir
      }, 1000)
    } catch (error) {
      console.error('API Error:', error)
      if (error.message && error.message.includes('409')) {
        try {
          const errorData = JSON.parse(error.message)
          if (errorData.field) {
            setErrors({ [errorData.field]: errorData.message })
          } else {
            setErrors({ general: errorData.message })
          }
        } catch {
          setErrors({ general: 'Bu e-poçt artıq istifadə olunub.' })
        }
      } else {
        setErrors({ general: 'Bağlantı xətası. Zəhmət olmasa yenidən cəhd edin.' })
      }
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
          <h2>İstifadəçi Qeydiyyatı</h2>
        </div>
        <div className="card-body">
          <form className="form" onSubmit={handleSubmit}>
            <div className="form-row">
              <label>Ad Soyad *</label>
              <input
                type="text"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="Adınızı və soyadınızı daxil edin"
              />
              {errors.name && <div className="error">{errors.name}</div>}
            </div>

            <div className="form-row">
              <label>E-poçt *</label>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="E-poçt ünvanınızı daxil edin"
              />
              {errors.email && <div className="error">{errors.email}</div>}
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
                minLength="6"
              />
              {errors.password && <div className="error">{errors.password}</div>}
            </div>

            <div className="form-row">
              <label>Telefon</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+994 00 123 45 67"
                maxLength="17"
              />
              {errors.phone && <div className="error">{errors.phone}</div>}
            </div>

            {errors.general && <div className="error">{errors.general}</div>}

            <button 
              className="btn btn-primary" 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Qeydiyyat olunur...' : 'Qeydiyyat ol'}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <p>Artıq hesabınız var? <Link style={{color: 'blue',textDecoration: 'underline'}} to="/giris">Daxil olun</Link></p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserRegister
