import React, { useEffect, useState } from 'react'
import { api } from '../utils/api'
import Notification from '../Components/Notification'

const ProductAdd = () => {
  const [token] = useState(localStorage.getItem('store_token') || '')
  const [me, setMe] = useState(null)
  const [product, setProduct] = useState({ name: '', price: '', stock: '', color: '', size: '', description: '', file: null })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    (async () => {
      try {
        if (!token) return
        const mine = await api.meStore(token)
        setMe(mine)
      } catch (e) {
        setError('Daxil olmaq lazımdır')
      }
    })()
  }, [token])

  const submit = async (e) => {
    e.preventDefault()
    if (!token || !me) { setError('Daxil olmaq lazımdır'); return }
    setSaving(true); setError('')
    try {
      const formData = new FormData()
      formData.append('name', product.name)
      formData.append('price', String(product.price))
      formData.append('stock', String(product.stock))
      if (product.color) formData.append('color', product.color)
      if (product.size) formData.append('size', product.size)
      if (product.description) formData.append('description', product.description)
      if (product.file) formData.append('image', product.file)
      await api.addProduct(me._id || me.id, formData, token)
      setProduct({ name: '', price: '', stock: '', color: '', size: '', description: '', file: null })
      setNotification({ message: 'Məhsul uğurla əlavə edildi!', type: 'success' })
    } catch (e) {
      setNotification({ message: 'Əlavə etmə uğursuz oldu. Zəhmət olmasa yenidən cəhd edin.', type: 'error' })
    } finally { setSaving(false) }
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
      
      <h2>Məhsul əlavə et</h2>
      {!token && <div className="muted">Zəhmət olmasa əvvəlcə daxil olun.</div>}
      {error && <div className="muted">{error}</div>}
      <form className="form" onSubmit={submit}>
        <div className="form-row">
          <label>Məhsul adı</label>
          <input required value={product.name} onChange={(e)=> setProduct({ ...product, name: e.target.value })} />
        </div>
        <div className="form-row two">
          <div>
            <label>Qiymət</label>
            <input type="number" step="0.01" required value={product.price} onChange={(e)=> setProduct({ ...product, price: e.target.value })} />
          </div>
          <div>
            <label>Stok</label>
            <input type="number" required value={product.stock} onChange={(e)=> setProduct({ ...product, stock: e.target.value })} />
          </div>
        </div>
        <div className="form-row two">
          <div>
            <label>Rəng</label>
            <input value={product.color} onChange={(e)=> setProduct({ ...product, color: e.target.value })} placeholder="Məs: qara" />
          </div>
          <div>
            <label>Ölçü</label>
            <input value={product.size} onChange={(e)=> setProduct({ ...product, size: e.target.value })} placeholder="XS, S, M, L, XL" />
          </div>
        </div>
        <div className="form-row">
          <label>Təsvir</label>
          <textarea rows={4} value={product.description} onChange={(e)=> setProduct({ ...product, description: e.target.value })} />
        </div>
        <div className="form-row">
          <label>
            <input type="checkbox" checked={product.visible} onChange={(e)=> setProduct({ ...product, visible: e.target.checked })} />
            <span style={{ marginLeft: 8 }}>Mağazada göstər</span>
          </label>
        </div>
        <div className="form-row">
          <label>Şəkil (tək fayl)</label>
          <input type="file" accept="image/*" onChange={(e)=> setProduct({ ...product, file: e.target.files?.[0] || null })} />
        </div>
        <button className="btn btn-primary" type="submit" disabled={saving || !token}>{saving ? 'Yüklənir...' : 'Əlavə et'}</button>
      </form>
    </div>
  )
}

export default ProductAdd


