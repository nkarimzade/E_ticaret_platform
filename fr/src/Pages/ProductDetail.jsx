import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { api, resolveImageUrl } from '../utils/api'
import { FaCalendarAlt, FaUser } from 'react-icons/fa'

const ProductDetail = () => {
  const { storeId, productId } = useParams()
  const navigate = useNavigate()
  const [store, setStore] = useState(null)
  const [error, setError] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedQty, setSelectedQty] = useState(1)
  const [showImage, setShowImage] = useState(false)

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

  const availableColors = useMemo(() => {
    if (!product) return []
    if (Array.isArray(product.colors) && product.colors.length > 0) return product.colors
    if (product.color) return [product.color]
    return []
  }, [product])

  const availableSizes = useMemo(() => {
    if (!product) return []
    if (Array.isArray(product.sizes) && product.sizes.length > 0) return product.sizes
    if (product.size) return [product.size]
    return []
  }, [product])

  const waPhone = useMemo(() => {
    const phone = (store && store.phone) ? String(store.phone) : ''
    const raw = phone.replace(/\D+/g, '')
    if (!raw) return ''
    const withCountry = raw.startsWith('994') ? `+${raw}` : `+994${raw}`
    return withCountry
  }, [store && store.phone])

  const makeWaMsg = (p) => {
    const extra = [
      selectedColor ? `Rəng: ${selectedColor}` : null,
      selectedSize ? `Ölçü: ${selectedSize}` : null,
      selectedQty ? `Ədəd: ${selectedQty}` : null,
    ].filter(Boolean)
    const extraText = extra.length ? `\n${extra.join(' | ')}` : ''
    const text = `Salam, ${store.name} mağazasından \"${p.name}\" (${p.price} AZN) məhsulunu sifariş etmək istəyirəm.${extraText}`
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
          <div className="product-image" onClick={()=> product.image && setShowImage(true)} style={{ cursor: product.image ? 'zoom-in' : 'default' }}>
            {product.image ? (<img alt={product.name} src={resolveImageUrl(product.image)} />) : (<div className="muted" style={{fontSize:12}}>Şəkil yoxdur</div>)}
          </div>
          <div className="product-info" style={{textAlign:'left'}}>
            <h2 className="product-title" style={{fontSize:'1.4rem'}}>{product.name}</h2>
            <div className="product-price" style={{fontSize:'1.2rem'}}>
              {product.discountPrice && Number(product.discountPrice) > 0 ? (
                <>
                  <span style={{ color: '#ef4444', textDecoration: 'line-through', marginRight: 8 }}>{product.price} AZN</span>
                  <span style={{ color: '#10B981', fontWeight: 700 }}>{product.discountPrice} AZN</span>
                </>
              ) : (
                <>{product.price} AZN</>
              )}
            </div>
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
            {availableColors.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Rəng</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {availableColors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`btn btn-outline ${selectedColor === c ? 'active' : ''}`}
                      onClick={() => setSelectedColor((prev) => (prev === c ? '' : c))}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {availableSizes.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Ölçü</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {availableSizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`btn btn-outline ${selectedSize === s ? 'active' : ''}`}
                      onClick={() => setSelectedSize((prev) => (prev === s ? '' : s))}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Miqdar</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {Array.from({length: Math.max(1, Math.min(5, Number(product.maxQty) || 5))}, (_,i)=> i+1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`btn btn-outline ${selectedQty === n ? 'active' : ''}`}
                    onClick={() => setSelectedQty(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>Maksimum {Math.max(1, Math.min(5, Number(product.maxQty) || 5))}</div>
            </div>
            {product.description && <p className="desc" style={{marginTop:8}}>{product.description}</p>}
            {Array.isArray(product.campaigns) && product.campaigns.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Kampaniyalar</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {product.campaigns.map((c) => (
                    <span key={c} style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '4px 8px',
                      borderRadius: 999,
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16,185,129,0.3)',
                      color: '#065f46',
                      fontSize: 12,
                      fontWeight: 600,
                    }}>{c}</span>
                  ))}
                </div>
              </div>
            )}
            {/* Məhsul xüsusiyyətləri */}
            {product.attributes && (
              <div className="form-section" style={{ marginTop: 12 }}>
                <h3 style={{ margin: 0, fontSize: '1rem' }}>Məhsul xüsusiyyətləri</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
                  {[
                    'Material','Dərinin keyfiyyəti','Parça mövcud deyil','Mühit','Naxış','Parça növü','Kolleksiya','Davamlılıq detalları','Tutum','Paket tərkibi','Yaş','Mənşə'
                  ].map((key) => {
                    const val = (product.attributes && product.attributes[key]) || ''
                    const show = true // her zaman göster, yoksa '-'
                    return (
                      <div key={key} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, borderBottom: '1px dashed #e5e7eb', paddingBottom: 6 }}>
                        <div style={{ color: '#374151', fontWeight: 500 }}>{key}</div>
                        <div style={{ color: '#6b7280' }}>{val ? String(val) : '-'}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
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

      {showImage && product.image && (
        <div className="lightbox-backdrop" onClick={()=> setShowImage(false)}>
          <div className="lightbox-content" onClick={(e)=> e.stopPropagation()}>
            <button className="lightbox-close" type="button" aria-label="Close" onClick={()=> setShowImage(false)}>×</button>
            <img className="lightbox-img" alt={product.name} src={resolveImageUrl(product.image)} />
            <div className="lightbox-caption">{product.name}</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductDetail


