import React, { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { api } from '../utils/api'

const PanelSettings = () => {
  const { token, currentStore } = useOutletContext()
  const [phone, setPhone] = useState(currentStore?.phone || '+994')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [active, setActive] = useState(!!currentStore?.active)

  const isValidAzPhone = (val) => {
    // Kabul edilen format: +994 5xx xxx xx xx veya +9945xxxxxxxx
    const compact = val.replace(/\s|-/g, '')
    return /^\+994(50|51|55|70|77|99|10)\d{7}$/.test(compact)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!currentStore) return
    setSaving(true); setMessage(''); setError('')
    if (!isValidAzPhone(phone)){
      setSaving(false)
      setError('Telefon formatı geçersiz. Örn: +994 50xxxxxxx')
      return
    }
    try{
      await api.updateStore(currentStore._id || currentStore.id, { phone }, token)
      setMessage('Telefon numarası güncellendi')
    }catch(err){
      setError(err.message || 'Güncelleme başarısız')
    } finally { setSaving(false) }
  }

  const onToggleActive = async () => {
    if (!currentStore) return
    try{
      await api.toggleStore(currentStore._id || currentStore.id)
      setActive((a)=>!a)
    }catch(err){
      setError(err.message || 'Durum güncellenemedi')
    }
  }

  return (
    <div className="page" style={{ display: 'grid', gap: 16 }}>
      <h2>Ayarlar</h2>
      <div className="settings-grid">
        <div className="card">
          <div className="card-header"><h3 style={{margin:0}}>Mağaza Durumu</h3></div>
          <div className="card-body" style={{ display: 'grid', gap: 12 }}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}>
              <div>
                <span className={`badge ${active ? 'active' : 'inactive'}`}>{active ? 'Aktif' : 'Pasif'}</span>
              </div>
              <button type="button" className={`btn ${active ? '' : 'btn-primary'}`} onClick={onToggleActive}>
                {active ? 'Pasif Et' : 'Aktif Et'}
              </button>
            </div>
          </div>
        </div>

        <form className="card" onSubmit={onSubmit}>
          <div className="card-header"><h3 style={{margin:0}}>İletişim</h3></div>
          <div className="card-body" style={{ display: 'grid', gap: 12 }}>
            <div>
              <label>Telefon Numarası</label>
              <input type="tel" value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="Örn: +994 50 xxx xx xx" />
            </div>
            {error && <div className="error-message">{error}</div>}
            {message && <div className="muted">{message}</div>}
            <div>
              <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Kaydediliyor...' : 'Kaydet'}</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PanelSettings


