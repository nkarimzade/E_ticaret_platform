import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { api, resolveImageUrl } from '../utils/api'
import { FaCalendarAlt, FaUser } from 'react-icons/fa'

const ProductDetail = () => {
  const { storeId, productId } = useParams()
  const navigate = useNavigate()
  const [store, setStore] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    (async () => {
      try{
        const s = await api.getStore(storeId)
        setStore(s)
      }catch(e){
        setError('Mağaza tapılmadı və ya aktiv deyil')
      }
    })()
  }, [storeId])

  const product = useMemo(() => {
    return (store?.products || []).find(p => (p._id || p.id) === productId)
  }, [store, productId])

  const waPhone = useMemo(() => {
    const phone = (store && store.phone) ? String(store.phone) : ''
    const raw = phone.replace(/\D+/g, '')
    if (!raw) return ''
    const withCountry = raw.startsWith('994') ? `+${raw}` : `+994${raw}`
    return withCountry
  }, [store && store.phone])

  const makeWaMsg = (p) => {
    const text = `Salam, ${store.name} mağazasından \"${p.name}\" (${p.price} AZN) məhsulunu sifariş etmək istəyirəm.`
    const enc = encodeURIComponent(text)
    const phone = waPhone.replace(/\D+/g, '')
    return `https://wa.me/${phone}?text=${enc}`
  }

  // Mağaza sahibinin baş harfini al
  const getOwnerInitial = (ownerName) => {
    if (!ownerName) return '?'
    return ownerName.charAt(0).toUpperCase()
  }

  // Ürünün eklenme tarihini formatla
  const formatAddedDate = (dateString) => {
    if (!dateString) return 'Bilinməyən tarix'
    
    // Normal tarih ise
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Bilinməyən tarix'
    
    // Geçerli tarih kontrolü (2000'den önceki tarihler geçersiz)
    if (date.getFullYear() < 2000) {
      return 'Bilinməyən tarix'
    }
    
    // Bugün mü kontrol et
    const today = new Date()
    const isToday = date.toDateString() === today.toDateString()
    
    if (isToday) {
      return `Bu gün ${date.toLocaleTimeString('az-AZ', {
        hour: '2-digit',
        minute: '2-digit'
      })}`
    }
    
    // Dün mü kontrol et
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const isYesterday = date.toDateString() === yesterday.toDateString()
    
    if (isYesterday) {
      return `Dünən ${date.toLocaleTimeString('az-AZ', {
        hour: '2-digit',
        minute: '2-digit'
      })}`
    }
    
    // Diğer tarihler için tam format
    return date.toLocaleDateString('az-AZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (error) return <div className="page"><div className="muted">{error}</div></div>
  if (!store) return <div className="page"><div className="muted">Yüklənir...</div></div>
  if (!product) return <div className="page"><div className="muted">Məhsul tapılmadı.</div></div>

  return (
    <div className="page">
      <div className="card">
        <div className="card-body product-detail-grid">
          <div className="product-image">
            {product.image ? (<img alt={product.name} src={resolveImageUrl(product.image)} />) : (<div className="muted" style={{fontSize:12}}>Şəkil yoxdur</div>)}
          </div>
          <div className="product-info" style={{textAlign:'left'}}>
            <h2 className="product-title" style={{fontSize:'1.4rem'}}>{product.name}</h2>
            <div className="product-price" style={{fontSize:'1.2rem'}}>{product.price} AZN</div>
            <br />
            {/* Mağaza sahibi bilgisi */}
            <div className="product-owner-info">
              <div className="product-owner-avatar">
                {getOwnerInitial(store.owner)}
              </div>
              <div>
                <div style={{fontWeight: '600', color: '#374151'}}>{store.owner}</div>
                <div style={{fontSize: '0.8rem', color: '#6b7280'}}>Mağaza sahibi</div>
              </div>
            </div>
            <br />
            {/* Ürün eklenme tarihi */}
            <div className="product-meta-row">
              <FaCalendarAlt style={{marginRight: '8px', color: '#10B981'}} />
              <span className="product-added-date">
                Əlavə edildi: {formatAddedDate(product.addedAt || product.createdAt)}
              </span>
            </div>

            <div className="product-meta">Stok: {product.stock}</div>
            {product.color && <div className="product-meta">Rəng: {product.color}</div>}
            {product.size && <div className="product-meta">Ölçü: {product.size}</div>}
            {product.description && <p className="desc" style={{marginTop:8}}>{product.description}</p>}
            <div className="product-detail-actions">
              <a className="btn btn-primary" href={makeWaMsg(product)} target="_blank" rel="noreferrer">
                Ödəniş üçün Kliklə
              </a>
              <div className="secondary-actions">
                <Link className="btn btn-outline" to={`/magaza/${store._id || store.id}`}>
                  Mağazaya keç
                </Link>
                <button className="btn" onClick={() => navigate(-1)}>
                  Geri
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

   
    </div>
  )
}

export default ProductDetail


