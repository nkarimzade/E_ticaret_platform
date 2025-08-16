import React, { useState } from 'react'
import { api } from '../utils/api'
import { Link, useNavigate } from 'react-router-dom'
import Notification from '../Components/Notification'

const UserLogin = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notification, setNotification] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    
    try {
      const response = await api.loginUser(form.email, form.password)
      localStorage.setItem('user_token', response.token)
      setNotification({ message: 'Uğurla daxil oldunuz!', type: 'success' })
      setTimeout(() => {
        window.location.href = '/' // Ana sayfaya yönlendir
      }, 1000)
    } catch (error) {
      console.error('API Error:', error)
      setError('Yanlış e-poçt və ya şifrə')
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
          <h2>İstifadəçi Girişi</h2>
        </div>
        <div className="card-body">
          <form className="form" onSubmit={handleSubmit}>
            <div className="form-row">
              <label>E-poçt</label>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="E-poçt ünvanınızı daxil edin"
              />
            </div>

            <div className="form-row">
              <label>Şifrə</label>
              <input
                type="password"
                name="password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="Şifrənizi daxil edin"
              />
            </div>

            {error && <div className="error">{error}</div>}

            <button 
              className="btn btn-primary" 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Daxil olunur...' : 'Daxil ol'}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <p>Hesabınız yoxdur? <Link style={{color: 'blue',textDecoration: 'underline'}} to="/kayit">Qeydiyyatdan Keçin</Link></p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserLogin
