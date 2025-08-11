import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api, resolveImageUrl } from '../utils/api'

const StoreDetail = () => {
  const { id } = useParams()
  const [store, setStore] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    (async () => {
      try{
        const s = await api.getStore(id)
        setStore(s)
      }catch(e){
        setError('Mağaza bulunamadı veya onaylı değil')
      }
    })()
  }, [id])

  const waPhone = useMemo(() => {
    const phone = (store && store.phone) ? String(store.phone) : ''
    const raw = phone.replace(/\D+/g, '')
    if (!raw) return ''
    const withCountry = raw.startsWith('994') ? `+${raw}` : `+994${raw}`
    return withCountry
  }, [store && store.phone])

  const [q, setQ] = useState('')
  const filteredProducts = useMemo(() => {
    const list = Array.isArray(store?.products) ? store.products : []
    if (!q) return list
    return list.filter(p => (p.name || '').toLowerCase().includes(q.toLowerCase()))
  }, [store?.products, q])

  if (error) return <div className="page"><div className="muted">{error}</div></div>
  if (!store) return <div className="page"><div className="muted">Yükleniyor...</div></div>

  const makeWaMsg = (p) => {
    const text = `Salam, ${store.name} mağazasından \"${p.name}\" (${p.price} AZN) məhsulunu sifariş etmək istəyirəm.`
    const enc = encodeURIComponent(text)
    const phone = waPhone.replace(/\D+/g, '')
    return `https://wa.me/${phone}?text=${enc}`
  }

  return (
    <div className="page">
      <div style={{width:"100%",height:"5vh",display:"flex",alignItems:"center",justifyContent:"center",backgroundColor:"#6366f1",color:"#ffffff",fontSize:"1rem",margin:"20px 0",borderRadius:"10px"}}>Hal-hazırda {store.name} mağazasındasınız</div>
      <div style={{textAlign:"center",fontSize:"1.2rem",margin:"20px 0"}}>
        Aşağıda {store.name} mağazasındakı məhsulları görə bilərsiniz.
      </div>
    

      <div className="toolbar">
        <h3>Mağazadakı Məhsulları</h3>
        <div className="search-input">
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#6b7280" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zM10 14a4 4 0 110-8 4 4 0 010 8z"></path></svg>
          <input placeholder="Məhsul axtar" value={q} onChange={(e)=>setQ(e.target.value)} />
        </div>
      </div>
      <div className="product-grid">
        {filteredProducts.map((p) => {
          const hasDiscount = p.discountPrice && Number(p.discountPrice) > 0
          const price = Number(p.price) || 0
          const dprice = Number(p.discountPrice) || 0
          const pct = hasDiscount && price > 0 ? Math.round((1 - dprice / price) * 100) : 0
          const addedAt = p.addedAt || p.createdAt
          const isNew = addedAt ? (Date.now() - new Date(addedAt).getTime()) < 7 * 24 * 60 * 60 * 1000 : false
          const lowStock = Number(p.stock) <= 3
          return (
            <a key={p._id || p.id} className="product-card" href={`/urun/${store.id}/${p.id}`} style={{ textDecoration: 'none' }}>
              {isNew && <span className="ribbon ribbon-new">Yeni</span>}
              {hasDiscount && pct > 0 && <span className="ribbon ribbon-discount">-{pct}%</span>}
              <div className="product-image" style={{ aspectRatio: '4 / 5' }}>
                {p.image ? (<img alt={p.name} src={resolveImageUrl(p.image)} />) : (<div className="muted" style={{fontSize:12}}>Görsel yok</div>)}
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
                {lowStock && <div className="pill pill-warning" style={{ marginTop: 8 }}>Son {p.stock} ədəd</div>}
              </div>
            </a>
          )
        })}
        {filteredProducts.length === 0 && <div className="muted">Sonuç bulunamadı.</div>}
      </div>
    </div>
  )
}

export default StoreDetail


