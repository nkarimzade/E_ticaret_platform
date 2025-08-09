import React, { useState } from 'react'
import { api } from '../utils/api'

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
    await api.createStore(form)
    setOk(true)
  }

  if (ok) {
    return (
      <div className="page page-narrow">
        <h2>Müraciətiniz alındı ✅</h2>
        <p>İdarəçi təsdiqindən sonra mağazanız yayımlanacaq. E-poçt ilə məlumat veriləcək.</p>
        <a className="link" href="/magazalar">Təsdiqlənən mağazalara baxın</a>
      </div>
    )
  }

  return (
    <div className="page page-narrow">
      <h2>Mağaza aç</h2>
      <p>Məlumatlarınızı daxil edin; müraciət idarəçi təsdiqinə düşəcək.</p>
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>Mağaza adı</label>
          <input name="name" value={form.name} onChange={handleChange} required placeholder="Məs: Krisoft Store" />
        </div>
        <div className="form-row">
          <label>Mağaza sahibi</label>
          <input name="owner" value={form.owner} onChange={handleChange} required placeholder="Ad Soyad" />
        </div>
        <div className="form-row two">
          <div>
            <label>E-poçt</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="ornek@mail.com" />
          </div>
          <div>
            <label>Telefon</label>
            <input name="phone" value={form.phone} onChange={handleChange} required placeholder="+994 50 123 45 67" />
          </div>
        </div>
        <div className="form-row two">
          <div>
            <label>Şifrə</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} required placeholder="Minimum 6 simvol" minLength={6} />
          </div>
        </div>
        <div className="form-row">
          <label>Təsvir</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={4} placeholder="Qısa tanıtım" />
        </div>
        <button className="btn btn-primary" type="submit">Müraciəti göndər</button>
      </form>
    </div>
  )
}

export default MagazaAc


