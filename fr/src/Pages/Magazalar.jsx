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
      discountPrice: p.discountPrice,
      campaigns: p.campaigns,
      addedAt: p.addedAt || p.createdAt,
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
        {filtered.map((p) => {
          const hasDiscount = p.discountPrice && Number(p.discountPrice) > 0
          const price = Number(p.price) || 0
          const dprice = Number(p.discountPrice) || 0
          const pct = hasDiscount && price > 0 ? Math.round((1 - dprice / price) * 100) : 0
          const isNew = p.addedAt ? (Date.now() - new Date(p.addedAt).getTime()) < 7 * 24 * 60 * 60 * 1000 : false
          return (
            <Link key={`${p.storeId}-${p.id}`} className="product-card" to={`/urun/${p.storeId}/${p.id}`} style={{ textDecoration: 'none' }}>
              {isNew && <span className="ribbon ribbon-new">Yeni</span>}
              {hasDiscount && pct > 0 && <span className="ribbon ribbon-discount">-{pct}%</span>}
              <div className="product-image" style={{ aspectRatio: '4 / 5' }}>
                {p.image ? (<img alt={p.name} src={resolveImageUrl(p.image)} />) : (<div className="muted" style={{fontSize:12}}>Şəkil yoxdur</div>)}
                <div className="image-cta">Ətraflı bax</div>
              </div>
              <div className="product-info">
                <div className="product-title" style={{ cursor: 'pointer' }}>{p.name}</div>
                <div className="product-price" style={{fontSize:'1.1rem'}}>
                  {hasDiscount ? (
                    <>
                      <span style={{ color: '#ef4444', textDecoration: 'line-through', marginRight: 8 }}>{p.price} AZN</span>
                      <span style={{ color: '#10B981', fontWeight: 700 }}>{p.discountPrice} AZN</span>
                    </>
                  ) : (
                    <>{p.price} AZN</>
                  )}
                </div>
                {Array.isArray(p.campaigns) && p.campaigns.length > 0 && (
                  <div className="pill-row">
                    {p.campaigns.slice(0,2).map((c) => (
                      <span key={c} className="pill pill-green">{c}</span>
                    ))}
                    {p.campaigns.length > 2 && <span className="pill">+{p.campaigns.length - 2}</span>}
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default Magazalar