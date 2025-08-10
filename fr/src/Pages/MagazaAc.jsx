import React, { useState } from 'react'
import { api } from '../utils/api'
import { FcApproval } from 'react-icons/fc'
import { MdContactMail } from 'react-icons/md'
import { FaSolarPanel } from 'react-icons/fa'
import { FaBirthdayCake } from 'react-icons/fa'
import Notification from '../Components/Notification'

const MagazaAc = () => {
  const [form, setForm] = useState({
    name: '',
    owner: '',
    email: '',
    phone: '',
    description: '',
    password: '',
  })
  const [ok, setOk] = useState(false)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notification, setNotification] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    // Telefonu +994 ile başlat
    if (name === 'phone') {
      let v = value.replace(/\s+/g, '')
      if (!v.startsWith('+994')) {
        v = '+994' + v.replace(/^\+?0*/, '')
      }
      return setForm((p) => ({ ...p, phone: v }))
    }
    setForm((p) => ({ ...p, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})
    
    try {
      const response = await api.createStore(form)
      if (response.ok) {
        setOk(true)
      } else {
        const errorData = await response.json()
        if (errorData.field) {
          setErrors({ [errorData.field]: errorData.message })
        } else {
          setErrors({ general: errorData.message })
        }
      }
    } catch (error) {
      setErrors({ general: 'Bağlantı xətası. Zəhmət olmasa yenidən cəhd edin.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (ok) {
    return (
      <div className="page page-narrow">
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}
        
        <div className="success-container">
          <div className="success-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="#10B981" strokeWidth="2" fill="none" />
              <path d="M9 12L11 14L15 10" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="success-title">Müraciətiniz uğurla alındı! <FaBirthdayCake />
          </h2>
          <div className="success-message">
            <p>Mağaza açma müraciətiniz sistemə qeydiyyatdan keçdi. İdarəçi komandamız müraciətinizi nəzərdən keçirəcək və ən qısa zamanda sizinlə əlaqə saxlayacaq.</p>
            <div className="next-steps">
              <h4>Növbəti addımlar:</h4>
              <ul>
                <li><FcApproval />
                  Müraciətiniz idarəçi tərəfindən yoxlanılacaq</li>
                <li><MdContactMail />
                  Təsdiq e-poçt ünvanınıza göndəriləcək</li>
                <li><FaSolarPanel /> Mağazanız aktivləşdirildikdən sonra idarəetmə panelinə daxil ola biləcəksiniz</li>
              </ul>
            </div>
            <div className="contact-info">
              <p><strong>Suallarınız varsa:</strong> <a href="mailto:support@hesen.az">support@hesen.az</a></p>
            </div>
          </div>
        </div>
      </div>
    )
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
      
      <h2>Mağaza aç</h2>
      <p>Məlumatlarınızı daxil edin; müraciət idarəçi təsdiqinə düşəcək.</p>
      <form className="form" onSubmit={handleSubmit}>
        {errors.general && (
          <div className="error-message">
            <span>⚠️ {errors.general}</span>
          </div>
        )}
        
        <div className="form-row">
          <label>Mağaza adı</label>
          <input 
            name="name" 
            value={form.name} 
            onChange={handleChange} 
            required 
            placeholder="Məs: Krisoft Store" 
            className={errors.name ? 'error' : ''}
          />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </div>
        
        <div className="form-row">
          <label>Mağaza sahibi</label>
          <input 
            name="owner" 
            value={form.owner} 
            onChange={handleChange} 
            required 
            placeholder="Ad Soyad" 
            className={errors.owner ? 'error' : ''}
          />
          {errors.owner && <span className="field-error">{errors.owner}</span>}
        </div>
        
        <div className="form-row two">
          <div>
            <label>E-poçt</label>
            <input 
              type="email" 
              name="email" 
              value={form.email} 
              onChange={handleChange} 
              required 
              placeholder="ornek@mail.com" 
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>
          <div>
            <label>Telefon</label>
            <input 
              name="phone" 
              value={form.phone} 
              onChange={handleChange} 
              required 
              placeholder="+994 50 123 45 67" 
              className={errors.phone ? 'error' : ''}
            />
            {errors.phone && <span className="field-error">{errors.phone}</span>}
          </div>
        </div>
        <div className="form-row two">
          <div>
            <label>Şifrə</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} required placeholder="Minimum 6 simvol" minLength={6} />
            <small className="muted">Şifrə ən azı 6 simvol olmalıdır.</small>
          </div>
        </div>
        <div className="form-row">
          <label>Təsvir</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={4} placeholder="Qısa tanıtım" />
        </div>
        <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Göndərilir...' : 'Müraciəti göndər'}
        </button>
      </form>
    </div>
  )
}

export default MagazaAc


