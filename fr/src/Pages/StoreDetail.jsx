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
        {filteredProducts.map((p) => (
          <div key={p._id || p.id} className="product-card">
            <div className="product-image">
              {p.image ? (<img alt={p.name} src={resolveImageUrl(p.image)} />) : (<div className="muted" style={{fontSize:12}}>Görsel yok</div>)}
            </div>
            <div className="product-info">
              <div className="product-title">{p.name}</div>
              <div className="product-price">{p.price} AZN</div>
              <div className="product-meta">Stok: {p.stock}</div>
              <div className="product-detail-actions">
                <a 
                  className="product-detail-link"
                  href={`/urun/${store.id}/${p.id}`}
                >
                  Məhsul Haqqında Ətraflı
                </a>
                <br />
                <a className="btn btn-primary" href={makeWaMsg(p)} target="_blank" rel="noreferrer">
                  Ödəniş üçün Kliklə
                </a>
              </div>
            </div>
          </div>
        ))}
        {filteredProducts.length === 0 && <div className="muted">Sonuç bulunamadı.</div>}
      </div>
    </div>
  )
}

export default StoreDetail


