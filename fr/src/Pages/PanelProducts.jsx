import React, { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { api, resolveImageUrl } from '../utils/api'

const ProductRow = ({ product, storeId, token, onUpdated, onDeleted }) => {
  const [price, setPrice] = useState(product.price)
  const [stock, setStock] = useState(product.stock)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      await api.updateProduct(storeId, product._id || product.id, { price: Number(price), stock: Number(stock) }, token)
      onUpdated?.()
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!window.confirm('Bu ürünü silmek istediğinize emin misiniz?')) return
    try {
      await api.deleteProduct(storeId, product._id || product.id, token)
      onDeleted?.()
    } catch (e) {}
  }

  return (
    <div className="card">
      <div className="card-body product-row-grid">
        <div>
          {product.image && <img className="product-row-thumb" alt={product.name} src={resolveImageUrl(product.image)} />}
        </div>
        <div className="product-row-fields">
          <div>
            <label>Ürün</label>
            <input value={product.name} disabled />
          </div>
          <div>
            <label>Fiyat</label>
            <input type="number" value={price} onChange={(e)=>setPrice(e.target.value)} />
          </div>
          <div>
            <label>Stok</label>
            <input type="number" value={stock} onChange={(e)=>setStock(e.target.value)} />
          </div>
        </div>
        <div className="product-row-actions">
          <div style={{display:'flex',gap:8}}>
            <a className="btn" href={`/urun-duzenle/${storeId}/${product._id || product.id}`}>Detay</a>
            <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Kaydediliyor...' : 'Kaydet'}</button>
          </div>
          <button className="btn btn-danger" onClick={remove}>Sil</button>
        </div>
      </div>
    </div>
  )
}

const PanelProducts = () => {
  const { token, currentStore } = useOutletContext()
  const [version, setVersion] = useState(0)
  const storeId = currentStore?._id || currentStore?.id
  const products = useMemo(() => (currentStore?.products || []), [currentStore, version])

  return (
    <div className="page" style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2>Ürünler</h2>
        <a className="btn btn-primary" href="/urun-ekle">Yeni Ürün</a>
      </div>
      <div className="cards">
        {products.length === 0 && <div className="muted">Henüz ürün yok.</div>}
        {products.map((p) => (
          <ProductRow
            key={p._id || p.id}
            product={p}
            storeId={storeId}
            token={token}
            onUpdated={() => setVersion((v) => v + 1)}
            onDeleted={() => window.location.reload()}
          />
        ))}
      </div>
    </div>
  )
}

export default PanelProducts


