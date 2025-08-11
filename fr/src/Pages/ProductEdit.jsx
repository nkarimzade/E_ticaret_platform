import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api, resolveImageUrl } from '../utils/api'
import Notification from '../Components/Notification'

const ProductEdit = () => {
  const { storeId, productId } = useParams()
  const navigate = useNavigate()
  const [token] = useState(localStorage.getItem('store_token') || '')
  const [store, setStore] = useState(null)
  const [saving, setSaving] = useState(false)
  const [notification, setNotification] = useState(null)
  const [price, setPrice] = useState('')
  const [discountPrice, setDiscountPrice] = useState('')
  const [stock, setStock] = useState('')
  const [maxQty, setMaxQty] = useState(5)

  useEffect(() => {
    (async () => {
      const s = await api.getStore(storeId)
      setStore(s)
    })()
  }, [storeId])

  const product = useMemo(() => {
    return (store?.products || []).find(p => (p._id || p.id) === productId)
  }, [store, productId])

  useEffect(() => {
    if (product) {
      setPrice(product.price || '')
      setDiscountPrice(product.discountPrice || '')
      setStock(product.stock || '')
      setMaxQty(product.maxQty || 5)
    }
  }, [product])

  const save = async (e) => {
    e.preventDefault()
    if (!token) { setNotification({ message: 'Daxil olmaq lazımdır', type: 'error' }); return }
    setSaving(true)
    try {
      await api.updateProduct(storeId, productId, {
        price: Number(price),
        discountPrice: discountPrice === '' ? undefined : Number(discountPrice),
        stock: Number(stock),
        maxQty: Number(maxQty)
      }, token)
      setNotification({ message: 'Məhsul uğurla yeniləndi!', type: 'success' })
    } catch (e) {
      setNotification({ message: 'Yeniləmə uğursuz oldu', type: 'error' })
    } finally { setSaving(false) }
  }

  if (!store) return <div className="page"><div className="muted">Yüklənir...</div></div>
  if (!product) return <div className="page"><div className="muted">Məhsul tapılmadı.</div></div>

  return (
    <div className="page page-narrow">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      <h2>Məhsulu yenilə</h2>
      <div className="product-add-card">
        <form className="form" onSubmit={save}>
          <div className="form-row two">
            <div>
              <label>Məhsul</label>
              <input value={product.name} disabled />
            </div>
            <div>
              <label>Şəkil</label>
              {product.image ? <img alt={product.name} src={resolveImageUrl(product.image)} style={{height:56,borderRadius:8}} /> : <div className="muted">Şəkil yoxdur</div>}
            </div>
          </div>
          <div className="form-row two">
            <div>
              <label>Qiymət</label>
              <input type="number" step="0.01" value={price} onChange={(e)=> setPrice(e.target.value)} />
            </div>
            <div>
              <label>Endirimli qiymət</label>
              <input type="number" step="0.01" value={discountPrice} onChange={(e)=> setDiscountPrice(e.target.value)} placeholder="(opsional)" />
            </div>
          </div>
          <div className="form-row two">
            <div>
              <label>Stok</label>
              <input type="number" value={stock} onChange={(e)=> setStock(e.target.value)} />
            </div>
            <div>
              <label>Maks. miqdar (1-5)</label>
              <input type="number" min={1} max={5} value={maxQty} onChange={(e)=> setMaxQty(Math.max(1, Math.min(5, Number(e.target.value)||1)))} />
            </div>
          </div>
          <div className="form-footer">
            <div />
            <div className="form-actions">
              <button className="btn" type="button" onClick={()=> navigate(-1)}>Geri</button>
              <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Yüklənir...' : 'Yenilə'}</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProductEdit


