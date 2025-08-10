import React, { useEffect, useMemo, useState } from 'react'
import { api, resolveImageUrl } from '../utils/api'
import { Link } from 'react-router-dom'

const Magazalar = () => {
  const [approved, setApproved] = useState([])
  const [q, setQ] = useState('')
  useEffect(() => { (async () => setApproved(await api.listApprovedStores()))() }, [])
  const products = useMemo(() => {
    return approved.flatMap(s => (s.products || []).map(p => ({
      storeId: s._id || s.id,
      storeName: s.name,
      storeOwner: s.owner,
      id: p._id || p.id,
      name: p.name,
      price: p.price,
      stock: p.stock,
      image: p.image,
    })))
  }, [approved])
  const filtered = useMemo(() => products.filter(p => (p.name||'').toLowerCase().includes(q.toLowerCase()) || (p.storeName||'').toLowerCase().includes(q.toLowerCase())), [products, q])

  return (
    <div className="page">
      <div className="store-list-header">
        <h2>Məhsullar</h2>
        <div className="search-input">
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#6b7280" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zM10 14a4 4 0 110-8 4 4 0 010 8z"></path></svg>
          <input placeholder="Məhsul və ya mağaza axtar" value={q} onChange={(e)=>setQ(e.target.value)} />
        </div>
      </div>

      <div className="product-grid">
        {filtered.length === 0 && <div className="muted">Məhsul tapılmadı.</div>}
        {filtered.map((p) => (
          <div key={`${p.storeId}-${p.id}`} className="product-card">
            <div className="product-image">
              {p.image ? (<img alt={p.name} src={resolveImageUrl(p.image)} />) : (<div className="muted" style={{fontSize:12}}>Şəkil yoxdur</div>)}
            </div>
            <div className="product-info">
              <div className="product-title">{p.name}</div>
              <div className="product-price">{p.price} AZN</div>
              <div className="product-meta">Mağaza: {p.storeName}</div>
              <div className="card-actions" style={{flexDirection:'column',alignItems:'stretch',marginTop:8}}>
                <Link className="btn btn-primary" style={{width:'100%'}} to={`/urun/${p.storeId}/${p.id}`}>Məhsul detalları</Link>
                <Link className="btn btn-outline" style={{width:'100%'}} to={`/magaza/${p.storeId}`}>Mağazaya keç</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Magazalar