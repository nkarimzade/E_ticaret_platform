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
  const [selectedStars, setSelectedStars] = useState(0)
  const [commentText, setCommentText] = useState('')
  const [comments, setComments] = useState([])
  const [loadingComments, setLoadingComments] = useState(false)

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

  // Yorumları yükle
  useEffect(() => {
    if (productId) {
      setLoadingComments(true)
      api.getComments(productId)
        .then(commentsData => {
          setComments(commentsData)
        })
        .catch(error => {
          console.error('Yorumlar yüklenemedi:', error)
        })
        .finally(() => {
          setLoadingComments(false)
        })
    }
  }, [productId])

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
    const baseUrl = window.location.origin
    const productLink = `${baseUrl}/urun/${storeId}/${productId}`
    const text = `Salam, ${store.name} mağazasından \"${p.name}\" (${p.price} AZN) məhsulunu sifariş etmək istəyirəm.${extraText}\n\nMəhsul linki: ${productLink}`
    const enc = encodeURIComponent(text)
    const phone = waPhone.replace(/\D+/g, '')
    return `https://wa.me/${phone}?text=${enc}`
  }

  // Mağaza sahibinin baş harfini al
  const getOwnerInitial = (ownerName) => {
    if (!ownerName) return '?'
    return ownerName.charAt(0).toUpperCase()
  }

  // Yorum gönderme fonksiyonu
  const handleSubmitComment = async () => {
    if (selectedStars === 0 || !commentText.trim()) return
    
    try {
      const commentData = {
        productId,
        storeId,
        userName: 'Anonim İstifadəçi', // Gerçek uygulamada giriş yapmış kullanıcı adı
        stars: selectedStars,
        comment: commentText.trim()
      }
      
      const newComment = await api.createComment(commentData)
      
      // Yorumları güncelle
      setComments(prev => [newComment, ...prev])
      
      // Formu temizle
      setSelectedStars(0)
      setCommentText('')
      
      // Başarı mesajı göster
      alert('Rəyiniz uğurla göndərildi!')
    } catch (error) {
      console.error('Yorum gönderilemedi:', error)
      alert('Yorum gönderilirken hata oluştu. Lütfen tekrar deneyin.')
    }
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
          <div className="product-image" onClick={()=> product.image && setShowImage(true)} style={{ cursor: product.image ? 'zoom-in' : 'default', position: 'relative' }}>
            {product.image ? (<img alt={product.name} src={resolveImageUrl(product.image)} />) : (<div className="muted" style={{fontSize:12}}>Şəkil yoxdur</div>)}
            
            {/* Kampanyalar görselin üstünde */}
            {Array.isArray(product.campaigns) && product.campaigns.length > 0 && (
              <div style={{ 
                position: 'absolute', 
                top: 12, 
                left: 12, 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 6,
                zIndex: 10
              }}>
                {product.campaigns.map((c) => (
                  <span key={c} style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '4px 8px',
                    borderRadius: 999,
                    background: 'rgba(16, 185, 129, 0.9)',
                    border: '1px solid rgba(16,185,129,0.3)',
                    color: 'white',
                    fontSize: 11,
                    fontWeight: 600,
                    backdropFilter: 'blur(4px)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>{c}</span>
                ))}
              </div>
            )}
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
            <Link to={`/magaza/${store._id || store.id}`} style={{ textDecoration: 'none' }}>
              <div className="product-owner-info" style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}>
                <div className="product-owner-avatar">
                  {getOwnerInitial(store.owner)}
                </div>
                <div>
                  <div style={{fontWeight: '600', color: '#374151'}}>{store.owner}</div>
                  <div style={{fontSize: '0.8rem', color: '#6b7280'}}>Mağaza sahibi</div>
                </div>
              </div>
            </Link>
            <br />
            {/* Ürün eklenme tarihi */}
            <div className="product-meta-row">
              <FaCalendarAlt style={{marginRight: '8px', color: '#10B981'}} />
              <span className="product-added-date">
                Əlavə edildi: {formatAddedDate(product.addedAt || product.createdAt)}
              </span>
            </div>



            {product.description && <p className="desc" style={{marginTop:8}}>{product.description}</p>}

            {/* Məhsul xüsusiyyətləri */}
            {product.attributes && (
              <div style={{ marginTop: 12 }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, marginBottom: 10 }}>Məhsul xüsusiyyətləri</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    'Material','Dərinin keyfiyyəti','Parça mövcud deyil','Mühit','Naxış','Parça növü','Kolleksiya','Davamlılıq detalları','Tutum','Paket tərkibi','Yaş','Mənşə'
                  ].map((key) => {
                    const val = (product.attributes && product.attributes[key]) || ''
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



            {/* Yorum yazma bölümü */}
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #e5e7eb' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>Rəy yazın</h3>
              
              {/* Yıldız değerlendirmesi */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 500, marginBottom: 8, color: '#374151' }}>Qiymətləndirmə</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSelectedStars(star)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '24px',
                        color: selectedStars >= star ? '#fbbf24' : '#d1d5db',
                        transition: 'color 0.2s ease'
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: 4 }}>
                  {selectedStars === 0 && 'Qiymətləndirmə seçin'}
                  {selectedStars === 1 && 'Çox pis'}
                  {selectedStars === 2 && 'Pis'}
                  {selectedStars === 3 && 'Orta'}
                  {selectedStars === 4 && 'Yaxşı'}
                  {selectedStars === 5 && 'Əla'}
                </div>
              </div>

              {/* Yorum yazma alanı */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: 8, color: '#374151' }}>
                  Rəyiniz
                </label>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Məhsul haqqında rəyinizi yazın..."
                  style={{
                    width: '100%',
                    minHeight: '100px',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Gönder butonu */}
              <button
                onClick={handleSubmitComment}
                disabled={selectedStars === 0 || !commentText.trim()}
                style={{
                  background: selectedStars === 0 || !commentText.trim() ? '#d1d5db' : '#6366f1',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: selectedStars === 0 || !commentText.trim() ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
              >
                Rəy göndər
              </button>
            </div>

            {/* Mevcut yorumlar */}
            {loadingComments ? (
              <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
                <div style={{ color: '#6b7280' }}>Yorumlar yükleniyor...</div>
              </div>
            ) : comments.length > 0 ? (
              <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
                    Müştəri rəyləri ({comments.length})
                  </h3>
                  <Link 
                    to={`/urun-yorumlari/${productId}`}
                    style={{
                      background: '#6366f1',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                      fontWeight: '500'
                    }}
                  >
                    Bütün rəyləri gör
                  </Link>
                </div>
                
                {/* Sadece ilk yorumu göster */}
                <div style={{
                  padding: '16px',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ fontWeight: 600, color: '#374151' }}>{comments[0].userName}</div>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                      {new Date(comments[0].createdAt).toLocaleDateString('az-AZ', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: 2, marginBottom: 8 }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        style={{
                          fontSize: '16px',
                          color: comments[0].stars >= star ? '#fbbf24' : '#d1d5db'
                        }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  
                  <div style={{ color: '#4b5563', lineHeight: 1.5 }}>
                    {comments[0].comment}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
                <div style={{ color: '#6b7280' }}>İlk rəyi siz yazın!</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Seçim seçenekleri kutusu */}
      <div className="product-options-card">
        <h3 style={{ margin: 0, marginBottom: 16, fontSize: '1.1rem', fontWeight: 600 }}>Məhsul seçimləri</h3>
        
        {availableColors.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Rəng</div>
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
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Ölçü</div>
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
        
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Miqdar</div>
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
        
        {/* Ödeme butonu */}
        <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #e5e7eb' }}>
          <a className="btn btn-primary" href={makeWaMsg(product)} target="_blank" rel="noreferrer" style={{ width: '100%', textAlign: 'center' }}>
            Ödəniş üçün Kliklə
          </a>
        </div>
      </div>

      {/* Kargo bilgisi kutusu */}
      <div className="delivery-info-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ 
            width: 40, 
            height: 40, 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, #10B981, #059669)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'white',
            fontSize: '18px',
            fontWeight: 'bold'
          }}>
            🚚
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#1f2937', marginBottom: 4 }}>Təxmini çatdırılma</div>
            <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
              {(() => {
                const today = new Date()
                const minDate = new Date(today)
                minDate.setDate(today.getDate() + 3)
                const maxDate = new Date(today)
                maxDate.setDate(today.getDate() + 5)
                
                const formatDate = (date) => {
                  const day = date.getDate().toString().padStart(2, '0')
                  const month = (date.getMonth() + 1).toString().padStart(2, '0')
                  const year = date.getFullYear()
                  return `${day}.${month}.${year}`
                }
                
                return `${formatDate(minDate)} ilə ${formatDate(maxDate)} arasında`
              })()}
            </div>
          </div>
        </div>
      </div>
 <br /><br /><br />
      {/* Ölçü Tablosu */}
      <div className="size-chart-card">
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, marginBottom: 20 }}>Ölçü Cədvəli</h3>
        
        {/* Kadınlar için ölçü tablosu */}
        <div style={{ marginBottom: 24 }}>
          <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, marginBottom: 12, color: '#6366f1' }}>Qadınlar üçün</h4>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse', 
              fontSize: '0.85rem',
              background: '#fff',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <thead>
                <tr style={{ background: '#f3f4f6' }}>
                  <th style={{ padding: '10px 8px', border: '1px solid #e5e7eb', fontWeight: 600, color: '#374151' }}>Ölçü</th>
                  <th style={{ padding: '10px 8px', border: '1px solid #e5e7eb', fontWeight: 600, color: '#374151' }}>Bust (cm)</th>
                  <th style={{ padding: '10px 8px', border: '1px solid #e5e7eb', fontWeight: 600, color: '#374151' }}>Bel (cm)</th>
                  <th style={{ padding: '10px 8px', border: '1px solid #e5e7eb', fontWeight: 600, color: '#374151' }}>Kalça (cm)</th>
                  <th style={{ padding: '10px 8px', border: '1px solid #e5e7eb', fontWeight: 600, color: '#374151' }}>Boy (cm)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { size: 'XS', bust: '78-82', waist: '60-64', hip: '84-88', height: '155-160' },
                  { size: 'S', bust: '82-86', waist: '64-68', hip: '88-92', height: '160-165' },
                  { size: 'M', bust: '86-90', waist: '68-72', hip: '92-96', height: '165-170' },
                  { size: 'L', bust: '90-94', waist: '72-76', hip: '96-100', height: '170-175' },
                  { size: 'XL', bust: '94-98', waist: '76-80', hip: '100-104', height: '175-180' },
                  { size: 'XXL', bust: '98-102', waist: '80-84', hip: '104-108', height: '180-185' }
                ].map((row, index) => (
                  <tr key={row.size} style={{ background: index % 2 === 0 ? '#fff' : '#f9fafb' }}>
                    <td style={{ padding: '8px', border: '1px solid #e5e7eb', fontWeight: 600, color: '#6366f1', textAlign: 'center' }}>{row.size}</td>
                    <td style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>{row.bust}</td>
                    <td style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>{row.waist}</td>
                    <td style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>{row.hip}</td>
                    <td style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>{row.height}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Erkekler için ölçü tablosu */}
        <div style={{ marginBottom: 16 }}>
          <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, marginBottom: 12, color: '#6366f1' }}>Kişilər üçün</h4>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse', 
              fontSize: '0.85rem',
              background: '#fff',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <thead>
                <tr style={{ background: '#f3f4f6' }}>
                  <th style={{ padding: '10px 8px', border: '1px solid #e5e7eb', fontWeight: 600, color: '#374151' }}>Ölçü</th>
                  <th style={{ padding: '10px 8px', border: '1px solid #e5e7eb', fontWeight: 600, color: '#374151' }}>Sinə (cm)</th>
                  <th style={{ padding: '10px 8px', border: '1px solid #e5e7eb', fontWeight: 600, color: '#374151' }}>Bel (cm)</th>
                  <th style={{ padding: '10px 8px', border: '1px solid #e5e7eb', fontWeight: 600, color: '#374151' }}>Kalça (cm)</th>
                  <th style={{ padding: '10px 8px', border: '1px solid #e5e7eb', fontWeight: 600, color: '#374151' }}>Boy (cm)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { size: 'XS', chest: '88-92', waist: '70-74', hip: '90-94', height: '165-170' },
                  { size: 'S', chest: '92-96', waist: '74-78', hip: '94-98', height: '170-175' },
                  { size: 'M', chest: '96-100', waist: '78-82', hip: '98-102', height: '175-180' },
                  { size: 'L', chest: '100-104', waist: '82-86', hip: '102-106', height: '180-185' },
                  { size: 'XL', chest: '104-108', waist: '86-90', hip: '106-110', height: '185-190' },
                  { size: 'XXL', chest: '108-112', waist: '90-94', hip: '110-114', height: '190-195' }
                ].map((row, index) => (
                  <tr key={row.size} style={{ background: index % 2 === 0 ? '#fff' : '#f9fafb' }}>
                    <td style={{ padding: '8px', border: '1px solid #e5e7eb', fontWeight: 600, color: '#6366f1', textAlign: 'center' }}>{row.size}</td>
                    <td style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>{row.chest}</td>
                    <td style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>{row.waist}</td>
                    <td style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>{row.hip}</td>
                    <td style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>{row.height}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ölçü alma rehberi */}
        <div style={{ 
          marginTop: 16, 
          padding: '12px 16px', 
          background: '#f0f9ff', 
          border: '1px solid #bae6fd', 
          borderRadius: '8px',
          fontSize: '0.85rem'
        }}>
          <div style={{ fontWeight: 600, color: '#0369a1', marginBottom: 4 }}>📏 Ölçü alma təlimatı:</div>
          <div style={{ color: '#0c4a6e', lineHeight: 1.4 }}>
            • <strong>Sinə/Bust:</strong> Ən geniş hissəni ölçün<br/>
            • <strong>Bel:</strong> Göbəyin ətrafını ölçün<br/>
            • <strong>Kalça:</strong> Ən geniş hissəni ölçün<br/>
            • <strong>Boy:</strong> Başdan ayağa qədər ölçün
          </div>
        </div>
      </div>

      {/* Dikkatinizi çekebilecek ürünler */}
      <div className="related-products-section">
        <h3 style={{ 
          margin: '40px 0 20px 0', 
          fontSize: '1.3rem', 
          fontWeight: 600, 
          color: '#1f2937',
          textAlign: 'center'
        }}>
          Dikkatinizi çekebilecek ürünler
        </h3>
        
        <div className="related-products-grid">
          {(() => {
            // Mevcut ürünü hariç tut, rastgele 5 ürün seç
            const allProducts = store.products || []
            const currentProductId = product._id || product.id
            const otherProducts = allProducts.filter(p => (p._id || p.id) !== currentProductId)
            
            // Rastgele karıştır ve ilk 5'ini al
            const shuffled = otherProducts.sort(() => 0.5 - Math.random())
            const selectedProducts = shuffled.slice(0, 5)
            
            return selectedProducts.map((relatedProduct) => (
              <div key={relatedProduct._id || relatedProduct.id} className="related-product-card">
                <div className="related-product-image" onClick={() => navigate(`/urun/${storeId}/${relatedProduct._id || relatedProduct.id}`)}>
                  {relatedProduct.image ? (
                    <img 
                      alt={relatedProduct.name} 
                      src={resolveImageUrl(relatedProduct.image)} 
                      style={{ cursor: 'pointer' }}
                    />
                  ) : (
                    <div className="no-image">Şəkil yoxdur</div>
                  )}
                  
                  {/* Kampanyalar */}
                  {Array.isArray(relatedProduct.campaigns) && relatedProduct.campaigns.length > 0 && (
                    <div className="related-product-campaigns">
                      {relatedProduct.campaigns.slice(0, 2).map((campaign) => (
                        <span key={campaign} className="campaign-badge">
                          {campaign}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="related-product-info">
                  <h4 className="related-product-title" onClick={() => navigate(`/urun/${storeId}/${relatedProduct._id || relatedProduct.id}`)}>
                    {relatedProduct.name}
                  </h4>
                  
                  <div className="related-product-price">
                    {relatedProduct.discountPrice && Number(relatedProduct.discountPrice) > 0 ? (
                      <>
                        <span className="original-price">{relatedProduct.price} AZN</span>
                        <span className="discount-price">{relatedProduct.discountPrice} AZN</span>
                      </>
                    ) : (
                      <span className="current-price">{relatedProduct.price} AZN</span>
                    )}
                  </div>
                  
                  <div className="related-product-meta">
                    <span className="product-category">
                      {relatedProduct.category === 'kadin' ? 'Qadın' : 'Kişi'} • {relatedProduct.productCategory}
                    </span>
                  </div>
                </div>
              </div>
            ))
          })()}
        </div>
        
        {/* Daha fazla ürün görme butonu */}
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <Link 
            to={`/magaza/${storeId}`}
            style={{
              display: 'inline-block',
              background: '#6366f1',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.background = '#5855eb'}
            onMouseLeave={(e) => e.target.style.background = '#6366f1'}
          >
            Mağazada daha çox məhsul gör
          </Link>
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


