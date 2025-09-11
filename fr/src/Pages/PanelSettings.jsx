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
    const allowed = ['50','51','55','70','77','99', '60']
    const digits = String(val).replace(/\D/g, '')
    const rest = digits.startsWith('994') ? digits.slice(3) : digits
    if (rest.length !== 9) return false
    const op = rest.slice(0,2)
    const number = rest.slice(2)
    return allowed.includes(op) && number.length === 7
  }

  const formatAzPhone = (val) => {
    const digits = String(val).replace(/\D/g, '')
    let rest = digits
    if (rest.startsWith('994')) rest = rest.slice(3)
    else if (rest.startsWith('0')) rest = rest.slice(1)
    rest = rest.slice(0, 9)
    const op = rest.slice(0, 2)
    const p1 = rest.slice(2, 5)
    const p2 = rest.slice(5, 7)
    const p3 = rest.slice(7, 9)
    let out = '+994'
    if (op) out += ` ${op}`
    if (p1) out += ` ${p1}`
    if (p2) out += ` ${p2}`
    if (p3) out += ` ${p3}`
    return out
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!currentStore) return
    setSaving(true); setMessage(''); setError('')
    const normalized = formatAzPhone(phone)
    setPhone(normalized)
    if (!isValidAzPhone(normalized)){
      setSaving(false)
      setError('Telefon formatı geçersiz. Örn: +994 50 123 45 67')
      return
    }
    try{
      await api.updateStore(currentStore._id || currentStore.id, { phone: normalized }, token)
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
              <input type="tel" value={phone} onChange={(e)=>setPhone(formatAzPhone(e.target.value))} placeholder="Örn: +994 50 123 45 67" inputMode="tel" autoComplete="tel" />
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


