import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { api, resolveImageUrl } from '../utils/api'
import { getAuthToken, getUserType } from '../utils/auth'
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
  const [addingToCart, setAddingToCart] = useState(false)
  const [cartNotification, setCartNotification] = useState(null)
  const userToken = getAuthToken()
  const userType = getUserType()
  const isNormalUser = !!userToken && userType !== 'store'

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
    const baseUrl = window.location.origin
    const productLink = `${baseUrl}/urun/${storeId}/${productId}`
    
    // Ürün detayları
    const productDetails = [
      `📦 Məhsul: ${p.name}`,
      `💰 Qiymət: ${p.price} ₼`,
      selectedQty ? `📊 Miqdar: ${selectedQty} ədəd` : null,
      selectedColor ? `🎨 Rəng: ${selectedColor}` : null,
      selectedSize ? `📏 Ölçü: ${selectedSize}` : null,
    ].filter(Boolean).join('\n')
    
    const message = `Salam! ${store.name} mağazasından sifariş etmək istəyirəm.

🛒 Məhsul detalları:
${productDetails}

🔗 Məhsul linki: ${productLink}

📞 Əlaqə üçün bu mesajı göndərdim.
⏰ Tezliklə cavab gözləyirəm.

Təşəkkürlər! 🙏`
    
    const enc = encodeURIComponent(message)
    const phone = waPhone.replace(/\D+/g, '')
    return `https://wa.me/${phone}?text=${enc}`
  }

  // Mağaza sahibinin baş harfini al
  const getOwnerInitial = (ownerName) => {
    if (!ownerName) return '?'
    return ownerName.charAt(0).toUpperCase()
  }

  // Sepete ekleme fonksiyonu
  const handleAddToCart = async () => {
    if (!userToken) {
      setCartNotification({ message: 'Sepete eklemek için giriş yapmalısınız', type: 'error' })
      setTimeout(() => setCartNotification(null), 3000)
      return
    }

    if (!product) return

    setAddingToCart(true)
    try {
      await api.addToCart(productId, storeId, selectedQty, userToken)
      setCartNotification({ message: 'Ürün sepete eklendi!', type: 'success' })
      
      // Navbar'daki sepet sayısını güncelle
      window.dispatchEvent(new Event('cartUpdated'))
      
      setTimeout(() => {
        setCartNotification(null)
      }, 3000)
    } catch (error) {
      console.error('Sepete ekleme hatası:', error)
      setCartNotification({ message: 'Sepete eklenirken hata oluştu', type: 'error' })
      setTimeout(() => setCartNotification(null), 3000)
    } finally {
      setAddingToCart(false)
    }
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
      {cartNotification && (
        <div 
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: 1000,
            background: cartNotification.type === 'success' ? '#10B981' : '#EF4444',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          {cartNotification.message}
        </div>
      )}
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
              {product.discountPrice && Number(product.discountPrice) > 0 && Number(product.discountPrice) < Number(product.price) ? (
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

            {/* Kategori Detayları */}
            {product.categoryDetails && (
              <div style={{ marginTop: 12 }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, marginBottom: 10 }}>Məhsul detalları</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {Object.entries(product.categoryDetails).map(([key, value]) => {
                    // Sadece değeri olan özellikleri göster
                    if (!value || String(value).trim() === '') return null
                    
                    // Anahtar adlarını Azerbaycan diline çevir
                    const keyTranslations = {
                      // Giyim
                      material: 'Material',
                      fabric: 'Kumaş',
                      style: 'Stil',
                      season: 'Mövsüm',
                      fit: 'Uyğunluq',
                      pattern: 'Naxış',
                      sleeve: 'Qol',
                      neckline: 'Boyun',
                      length: 'Uzunluq',
                      care: 'Qulluq',
                      
                      // Parfum
                      volume: 'Həcm (ml)',
                      concentration: 'Konsentrasiya',
                      brand: 'Marka',
                      origin: 'Mənşə',
                      family: 'Ailə',
                      notes: 'Notlar',
                      longevity: 'Davamlılıq',
                      sillage: 'Yayılma',
                      occasion: 'Məqsəd',
                      gender: 'Cinsiyyət',
                      
                      // Ayakkabı
                      soleType: 'Daban növü',
                      heelHeight: 'Daban hündürlüyü',
                      closure: 'Bağlama növü',
                      comfort: 'Rahatlıq',
                      
                      // Aksesuar
                      size: 'Ölçü',
                      type: 'Növ',
                      color: 'Rəng',
                      quality: 'Keyfiyyət',
                      
                      // Makyaj
                      shade: 'Çal',
                      finish: 'Bitirmə',
                      coverage: 'Örtmə',
                      skinType: 'Dəri tipi',
                      ingredients: 'Tərkibi',
                      crueltyFree: 'Heyvan testi',
                      expiryDate: 'Bitmə tarixi',
                      
                      // Elektronik
                      model: 'Model',
                      warranty: 'Zəmanət',
                      power: 'Güc',
                      connectivity: 'Qoşulma',
                      features: 'Xüsusiyyətlər',
                      compatibility: 'Uyğunluq',
                      battery: 'Batareya',
                      dimensions: 'Ölçülər',
                      weight: 'Çəki'
                    }
                    
                    const translatedKey = keyTranslations[key] || key
                    
                    return (
                      <div key={key} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, borderBottom: '1px dashed #e5e7eb', paddingBottom: 6 }}>
                        <div style={{ color: '#374151', fontWeight: 500 }}>{translatedKey}</div>
                        <div style={{ color: '#6b7280' }}>{String(value)}</div>
                      </div>
                    )
                  }).filter(Boolean)}
                </div>
              </div>
            )}

            {/* Eski Məhsul xüsusiyyətləri (geriye uyumluluk için) */}
            {product.attributes && !product.categoryDetails && (
              <div style={{ marginTop: 12 }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, marginBottom: 10 }}>Məhsul xüsusiyyətləri</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    'Material','Dərinin keyfiyyəti','Parça mövcud deyil','Mühit','Naxış','Parça növü','Kolleksiya','Davamlılıq detalları','Tutum','Paket tərkibi','Yaş','Mənşə'
                  ].map((key) => {
                    const val = (product.attributes && product.attributes[key]) || ''
                    // Sadece değeri olan özellikleri göster
                    if (!val || val.trim() === '') return null
                    return (
                      <div key={key} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, borderBottom: '1px dashed #e5e7eb', paddingBottom: 6 }}>
                        <div style={{ color: '#374151', fontWeight: 500 }}>{key}</div>
                        <div style={{ color: '#6b7280' }}>{String(val)}</div>
                      </div>
                    )
                  }).filter(Boolean)}
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
              {availableColors.map((c) => {
                // Renk adından hex koduna çevirme fonksiyonu
                const getColorHex = (colorName) => {
                  const colorMap = {
                    // Temel renkler
                    'qırmızı': '#ff0000',
                    'qirmizi': '#ff0000',
                    'red': '#ff0000',
                    'mavi': '#0000ff',
                    'blue': '#0000ff',
                    'yaşıl': '#00ff00',
                    'yasil': '#00ff00',
                    'green': '#00ff00',
                    'sarı': '#ffff00',
                    'sari': '#ffff00',
                    'yellow': '#ffff00',
                    'qara': '#000000',
                    'black': '#000000',
                    'ağ': '#ffffff',
                    'ag': '#ffffff',
                    'white': '#ffffff',
                    
                    // Ek renkler
                    'bənövşəyi': '#800080',
                    'benovsəyi': '#800080',
                    'purple': '#800080',
                    'narıncı': '#ffa500',
                    'narinci': '#ffa500',
                    'orange': '#ffa500',
                    'çəhrayı': '#ffc0cb',
                    'çehrayi': '#ffc0cb',
                    'pink': '#ffc0cb',
                    'göy': '#87ceeb',
                    'goy': '#87ceeb',
                    'cyan': '#87ceeb',
                    'boz': '#808080',
                    'gray': '#808080',
                    'gri': '#808080',
                    'qəhvəyi': '#8b4513',
                    'qehveyi': '#8b4513',
                    'brown': '#8b4513',
                    'qızılı': '#ffd700',
                    'qizili': '#ffd700',
                    'gold': '#ffd700',
                    'gümüş': '#c0c0c0',
                    'gumus': '#c0c0c0',
                    'silver': '#c0c0c0',
                    
                    // Tünd tonlar
                    'tünd mavi': '#000080',
                    'tund mavi': '#000080',
                    'navy': '#000080',
                    'tünd yaşıl': '#006400',
                    'tund yasil': '#006400',
                    'dark green': '#006400',
                    'tünd qırmızı': '#8b0000',
                    'tund qirmizi': '#8b0000',
                    'dark red': '#8b0000',
                    'tünd bənövşəyi': '#4b0082',
                    'tund benovsəyi': '#4b0082',
                    'dark purple': '#4b0082',
                    'tünd qəhvəyi': '#654321',
                    'tund qehveyi': '#654321',
                    'dark brown': '#654321',
                    
                    // Açıq tonlar
                    'açıq mavi': '#add8e6',
                    'aciq mavi': '#add8e6',
                    'light blue': '#add8e6',
                    'açıq yaşıl': '#90ee90',
                    'aciq yasil': '#90ee90',
                    'light green': '#90ee90',
                    'açıq qırmızı': '#ffcccb',
                    'aciq qirmizi': '#ffcccb',
                    'light red': '#ffcccb',
                    'açıq sarı': '#ffffe0',
                    'aciq sari': '#ffffe0',
                    'light yellow': '#ffffe0',
                    'açıq çəhrayı': '#ffb6c1',
                    'aciq çehrayi': '#ffb6c1',
                    'light pink': '#ffb6c1',
                    'açıq bənövşəyi': '#e6e6fa',
                    'aciq benovsəyi': '#e6e6fa',
                    'light purple': '#e6e6fa',
                    
                    // Özel renkler
                    'türkü': '#00ced1',
                    'turku': '#00ced1',
                    'turquoise': '#00ced1',
                    'lacivert': '#191970',
                    'navy blue': '#191970',
                    'krem': '#f5f5dc',
                    'cream': '#f5f5dc',
                    'bej': '#f5f5dc',
                    'beige': '#f5f5dc',
                    'qara mavi': '#000080',
                    'qara mavi': '#000080',
                    'qara yaşıl': '#006400',
                    'qara yasil': '#006400',
                    'qara qırmızı': '#8b0000',
                    'qara qirmizi': '#8b0000',
                    
                    // Metalik renkler
                    'qızıl': '#ffd700',
                    'qizil': '#ffd700',
                    'gümüş': '#c0c0c0',
                    'gumus': '#c0c0c0',
                    'bürünc': '#cd7f32',
                    'burunc': '#cd7f32',
                    'bronze': '#cd7f32',
                    
                    // Pastel renkler
                    'pastel mavi': '#b0e0e6',
                    'pastel yasil': '#98fb98',
                    'pastel qirmizi': '#ffb6c1',
                    'pastel sari': '#f0e68c',
                    'pastel benovsəyi': '#dda0dd',
                    
                    // Neon renkler
                    'neon qirmizi': '#ff1493',
                    'neon mavi': '#00bfff',
                    'neon yasil': '#00ff7f',
                    'neon sari': '#ffff00',
                    'neon çehrayi': '#ff69b4',
                    
                    // Doğal renkler
                    'yaşıl mavi': '#008080',
                    'yasil mavi': '#008080',
                    'teal': '#008080',
                    'zeytun': '#808000',
                    'olive': '#808000',
                    'maroon': '#800000',
                    'bordo': '#800000',
                    'indigo': '#4b0082',
                    'çəhrayı qırmızı': '#dc143c',
                    'çehrayi qirmizi': '#dc143c',
                    'crimson': '#dc143c',
                    'tomato': '#ff6347',
                    'pomidor': '#ff6347',
                    'coral': '#ff7f50',
                    'mərcan': '#ff7f50',
                    'mercan': '#ff7f50',
                    'salmon': '#fa8072',
                    'somon': '#fa8072',
                    'lavender': '#e6e6fa',
                    'lavanta': '#e6e6fa',
                    'violet': '#ee82ee',
                    'bənövşəyi': '#ee82ee',
                    'benovsəyi': '#ee82ee',
                    'plum': '#dda0dd',
                    'gavalı': '#dda0dd',
                    'gavali': '#dda0dd',
                    'orchid': '#da70d6',
                    'orkide': '#da70d6',
                    'magenta': '#ff00ff',
                    'magenta': '#ff00ff',
                    'fuchsia': '#ff00ff',
                    'hot pink': '#ff69b4',
                    'istili çehrayi': '#ff69b4',
                    'deep pink': '#ff1493',
                    'dərin çehrayı': '#ff1493',
                    'derin çehrayi': '#ff1493',
                    'medium violet red': '#c71585',
                    'orta bənövşəyi qırmızı': '#c71585',
                    'orta benovsəyi qirmizi': '#c71585',
                    'pale violet red': '#db7093',
                    'solğun bənövşəyi qırmızı': '#db7093',
                    'solgun benovsəyi qirmizi': '#db7093',
                    
                    // Ek renkler
                    'qara': '#000000',
                    'black': '#000000',
                    'ağ': '#ffffff',
                    'ag': '#ffffff',
                    'white': '#ffffff',
                    'qırmızı': '#ff0000',
                    'qirmizi': '#ff0000',
                    'red': '#ff0000',
                    'mavi': '#0000ff',
                    'blue': '#0000ff',
                    'yaşıl': '#00ff00',
                    'yasil': '#00ff00',
                    'green': '#00ff00',
                    'sarı': '#ffff00',
                    'sari': '#ffff00',
                    'yellow': '#ffff00',
                    'bənövşəyi': '#800080',
                    'benovsəyi': '#800080',
                    'purple': '#800080',
                    'narıncı': '#ffa500',
                    'narinci': '#ffa500',
                    'orange': '#ffa500',
                    'çəhrayı': '#ffc0cb',
                    'çehrayi': '#ffc0cb',
                    'pink': '#ffc0cb',
                    'göy': '#87ceeb',
                    'goy': '#87ceeb',
                    'cyan': '#87ceeb',
                    'boz': '#808080',
                    'gray': '#808080',
                    'gri': '#808080',
                    'qəhvəyi': '#8b4513',
                    'qehveyi': '#8b4513',
                    'brown': '#8b4513',
                    'qızılı': '#ffd700',
                    'qizili': '#ffd700',
                    'gold': '#ffd700',
                    'gümüş': '#c0c0c0',
                    'gumus': '#c0c0c0',
                    'silver': '#c0c0c0',
                    
                    // Yeni eklenen renkler
                    'türkü': '#00ced1',
                    'turku': '#00ced1',
                    'turquoise': '#00ced1',
                    'lacivert': '#191970',
                    'navy blue': '#191970',
                    'krem': '#f5f5dc',
                    'cream': '#f5f5dc',
                    'bej': '#f5f5dc',
                    'beige': '#f5f5dc',
                    'bürünc': '#cd7f32',
                    'burunc': '#cd7f32',
                    'bronze': '#cd7f32',
                    'zeytun': '#808000',
                    'olive': '#808000',
                    'maroon': '#800000',
                    'bordo': '#800000',
                    'indigo': '#4b0082',
                    'crimson': '#dc143c',
                    'tomato': '#ff6347',
                    'pomidor': '#ff6347',
                    'coral': '#ff7f50',
                    'mərcan': '#ff7f50',
                    'mercan': '#ff7f50',
                    'salmon': '#fa8072',
                    'somon': '#fa8072',
                    'lavender': '#e6e6fa',
                    'lavanta': '#e6e6fa',
                    'violet': '#ee82ee',
                    'plum': '#dda0dd',
                    'gavalı': '#dda0dd',
                    'gavali': '#dda0dd',
                    'orchid': '#da70d6',
                    'orkide': '#da70d6',
                    'magenta': '#ff00ff',
                    'fuchsia': '#ff00ff',
                    'hot pink': '#ff69b4',
                    'istili çehrayi': '#ff69b4',
                    'deep pink': '#ff1493',
                    'dərin çehrayı': '#ff1493',
                    'derin çehrayi': '#ff1493',
                    'medium violet red': '#c71585',
                    'orta bənövşəyi qırmızı': '#c71585',
                    'orta benovsəyi qirmizi': '#c71585',
                    'pale violet red': '#db7093',
                    'solğun bənövşəyi qırmızı': '#db7093',
                    'solgun benovsəyi qirmizi': '#db7093',
                    
                    // Pastel renkler
                    'pastel mavi': '#b0e0e6',
                    'pastel yasil': '#98fb98',
                    'pastel qirmizi': '#ffb6c1',
                    'pastel sari': '#f0e68c',
                    'pastel benovsəyi': '#dda0dd',
                    
                    // Neon renkler
                    'neon qirmizi': '#ff1493',
                    'neon mavi': '#00bfff',
                    'neon yasil': '#00ff7f',
                    'neon sari': '#ffff00',
                    'neon çehrayi': '#ff69b4',
                    
                    // Doğal renkler
                    'yaşıl mavi': '#008080',
                    'yasil mavi': '#008080',
                    'teal': '#008080',
                    'çəhrayı qırmızı': '#dc143c',
                    'çehrayi qirmizi': '#dc143c',
                    
                    // Ek tonlar
                    'açıq boz': '#d3d3d3',
                    'aciq boz': '#d3d3d3',
                    'light gray': '#d3d3d3',
                    'tünd boz': '#696969',
                    'tund boz': '#696969',
                    'dark gray': '#696969',
                    'açıq qəhvəyi': '#d2b48c',
                    'aciq qehveyi': '#d2b48c',
                    'light brown': '#d2b48c',
                    'tünd sarı': '#b8860b',
                    'tund sari': '#b8860b',
                    'dark yellow': '#b8860b',
                    'açıq sarı': '#ffffe0',
                    'aciq sari': '#ffffe0',
                    'light yellow': '#ffffe0',
                    'tünd mavi': '#000080',
                    'tund mavi': '#000080',
                    'navy': '#000080',
                    'açıq mavi': '#add8e6',
                    'aciq mavi': '#add8e6',
                    'light blue': '#add8e6',
                    'tünd yaşıl': '#006400',
                    'tund yasil': '#006400',
                    'dark green': '#006400',
                    'açıq yaşıl': '#90ee90',
                    'aciq yasil': '#90ee90',
                    'light green': '#90ee90',
                    'tünd qırmızı': '#8b0000',
                    'tund qirmizi': '#8b0000',
                    'dark red': '#8b0000',
                    'açıq qırmızı': '#ffcccb',
                    'aciq qirmizi': '#ffcccb',
                    'light red': '#ffcccb',
                    'tünd bənövşəyi': '#4b0082',
                    'tund benovsəyi': '#4b0082',
                    'dark purple': '#4b0082',
                    'açıq bənövşəyi': '#e6e6fa',
                    'aciq benovsəyi': '#e6e6fa',
                    'light purple': '#e6e6fa',
                    'açıq çəhrayı': '#ffb6c1',
                    'aciq çehrayi': '#ffb6c1',
                    'light pink': '#ffb6c1',
                    'tünd qəhvəyi': '#654321',
                    'tund qehveyi': '#654321',
                    'dark brown': '#654321',
                    
                    // Ek renk varyasyonları
                    'siyah': '#000000',
                    'beyaz': '#ffffff',
                    'kırmızı': '#ff0000',
                    'kirmizi': '#ff0000',
                    'mavi': '#0000ff',
                    'yaşıl': '#00ff00',
                    'yasil': '#00ff00',
                    'sarı': '#ffff00',
                    'sari': '#ffff00',
                    'bənövşəyi': '#800080',
                    'benovsəyi': '#800080',
                    'narıncı': '#ffa500',
                    'narinci': '#ffa500',
                    'çəhrayı': '#ffc0cb',
                    'çehrayi': '#ffc0cb',
                    'göy': '#87ceeb',
                    'goy': '#87ceeb',
                    'boz': '#808080',
                    'qəhvəyi': '#8b4513',
                    'qehveyi': '#8b4513',
                    'qızılı': '#ffd700',
                    'qizili': '#ffd700',
                    'gümüş': '#c0c0c0',
                    'gumus': '#c0c0c0',
                    
                    // Türkçe renk isimleri
                    'siyah': '#000000',
                    'beyaz': '#ffffff',
                    'kırmızı': '#ff0000',
                    'kirmizi': '#ff0000',
                    'mavi': '#0000ff',
                    'yeşil': '#00ff00',
                    'yesil': '#00ff00',
                    'sarı': '#ffff00',
                    'sari': '#ffff00',
                    'mor': '#800080',
                    'turuncu': '#ffa500',
                    'pembe': '#ffc0cb',
                    'gök mavisi': '#87ceeb',
                    'gok mavisi': '#87ceeb',
                    'gri': '#808080',
                    'kahverengi': '#8b4513',
                    'kahve': '#8b4513',
                    'altın': '#ffd700',
                    'altin': '#ffd700',
                    'gümüş': '#c0c0c0',
                    'gumus': '#c0c0c0',
                    
                    // Ek varyasyonlar
                    'qara': '#000000',
                    'ağ': '#ffffff',
                    'ag': '#ffffff',
                    'qırmızı': '#ff0000',
                    'qirmizi': '#ff0000',
                    'mavi': '#0000ff',
                    'yaşıl': '#00ff00',
                    'yasil': '#00ff00',
                    'sarı': '#ffff00',
                    'sari': '#ffff00',
                    'bənövşəyi': '#800080',
                    'benovsəyi': '#800080',
                    'narıncı': '#ffa500',
                    'narinci': '#ffa500',
                    'çəhrayı': '#ffc0cb',
                    'çehrayi': '#ffc0cb',
                    'göy': '#87ceeb',
                    'goy': '#87ceeb',
                    'boz': '#808080',
                    'qəhvəyi': '#8b4513',
                    'qehveyi': '#8b4513',
                    'qızılı': '#ffd700',
                    'qizili': '#ffd700',
                    'gümüş': '#c0c0c0',
                    'gumus': '#c0c0c0',
                    
                    // Basit renk isimleri
                    'qara': '#000000',
                    'ağ': '#ffffff',
                    'ag': '#ffffff',
                    'qırmızı': '#ff0000',
                    'qirmizi': '#ff0000',
                    'mavi': '#0000ff',
                    'yaşıl': '#00ff00',
                    'yasil': '#00ff00',
                    'sarı': '#ffff00',
                    'sari': '#ffff00',
                    'bənövşəyi': '#800080',
                    'benovsəyi': '#800080',
                    'narıncı': '#ffa500',
                    'narinci': '#ffa500',
                    'çəhrayı': '#ffc0cb',
                    'çehrayi': '#ffc0cb',
                    'göy': '#87ceeb',
                    'goy': '#87ceeb',
                    'boz': '#808080',
                    'qəhvəyi': '#8b4513',
                    'qehveyi': '#8b4513',
                    'qızılı': '#ffd700',
                    'qizili': '#ffd700',
                    'gümüş': '#c0c0c0',
                    'gumus': '#c0c0c0',
                    
                    // Ek renkler
                    'türkü': '#00ced1',
                    'turku': '#00ced1',
                    'lacivert': '#191970',
                    'krem': '#f5f5dc',
                    'bej': '#f5f5dc',
                    'bürünc': '#cd7f32',
                    'burunc': '#cd7f32',
                    'zeytun': '#808000',
                    'bordo': '#800000',
                    'indigo': '#4b0082',
                    'crimson': '#dc143c',
                    'pomidor': '#ff6347',
                    'mərcan': '#ff7f50',
                    'mercan': '#ff7f50',
                    'somon': '#fa8072',
                    'lavanta': '#e6e6fa',
                    'violet': '#ee82ee',
                    'gavalı': '#dda0dd',
                    'gavali': '#dda0dd',
                    'orkide': '#da70d6',
                    'magenta': '#ff00ff',
                    'istili çehrayi': '#ff69b4',
                    'dərin çehrayı': '#ff1493',
                    'derin çehrayi': '#ff1493',
                    'orta bənövşəyi qırmızı': '#c71585',
                    'orta benovsəyi qirmizi': '#c71585',
                    'solğun bənövşəyi qırmızı': '#db7093',
                    'solgun benovsəyi qirmizi': '#db7093',
                    
                    // Pastel renkler
                    'pastel mavi': '#b0e0e6',
                    'pastel yasil': '#98fb98',
                    'pastel qirmizi': '#ffb6c1',
                    'pastel sari': '#f0e68c',
                    'pastel benovsəyi': '#dda0dd',
                    
                    // Neon renkler
                    'neon qirmizi': '#ff1493',
                    'neon mavi': '#00bfff',
                    'neon yasil': '#00ff7f',
                    'neon sari': '#ffff00',
                    'neon çehrayi': '#ff69b4',
                    
                    // Doğal renkler
                    'yaşıl mavi': '#008080',
                    'yasil mavi': '#008080',
                    'çəhrayı qırmızı': '#dc143c',
                    'çehrayi qirmizi': '#dc143c',
                    
                    // Ek tonlar
                    'açıq boz': '#d3d3d3',
                    'aciq boz': '#d3d3d3',
                    'tünd boz': '#696969',
                    'tund boz': '#696969',
                    'açıq qəhvəyi': '#d2b48c',
                    'aciq qehveyi': '#d2b48c',
                    'tünd sarı': '#b8860b',
                    'tund sari': '#b8860b',
                    'açıq sarı': '#ffffe0',
                    'aciq sari': '#ffffe0',
                    'tünd mavi': '#000080',
                    'tund mavi': '#000080',
                    'açıq mavi': '#add8e6',
                    'aciq mavi': '#add8e6',
                    'tünd yaşıl': '#006400',
                    'tund yasil': '#006400',
                    'açıq yaşıl': '#90ee90',
                    'aciq yasil': '#90ee90',
                    'tünd qırmızı': '#8b0000',
                    'tund qirmizi': '#8b0000',
                    'açıq qırmızı': '#ffcccb',
                    'aciq qirmizi': '#ffcccb',
                    'tünd bənövşəyi': '#4b0082',
                    'tund benovsəyi': '#4b0082',
                    'açıq bənövşəyi': '#e6e6fa',
                    'aciq benovsəyi': '#e6e6fa',
                    'açıq çəhrayı': '#ffb6c1',
                    'aciq çehrayi': '#ffb6c1',
                    'tünd qəhvəyi': '#654321',
                    'tund qehveyi': '#654321'
                  }
                  
                  const normalizedColor = colorName.toLowerCase().trim()
                  return colorMap[normalizedColor] || '#e5e7eb' // Varsayılan gri renk
                }
                
                const colorHex = getColorHex(c)
                const isSelected = selectedColor === c
                
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedColor((prev) => (prev === c ? '' : c))}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      border: isSelected ? '3px solid #6366f1' : '2px solid #e5e7eb',
                      background: colorHex,
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? '0 2px 8px rgba(99, 102, 241, 0.3)' : '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                    title={c}
                  >
                    {isSelected && (
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '16px',
                        height: '16px',
                        background: 'white',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        color: '#6366f1',
                        fontWeight: 'bold'
                      }}>
                        ✓
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
            {selectedColor && (
              <div style={{ 
                marginTop: 8, 
                fontSize: '0.9rem', 
                color: '#6b7280',
                fontWeight: 500
              }}>
                Seçilən rəng: <span style={{ color: '#374151' }}>{
                  (() => {
                    const colorTranslations = {
                      // Türkçe'den Azerbaycan'a çeviriler
                      'siyah': 'qara',
                      'beyaz': 'ağ',
                      'kırmızı': 'qırmızı',
                      'kirmizi': 'qırmızı',
                      'mavi': 'mavi',
                      'yeşil': 'yaşıl',
                      'yesil': 'yaşıl',
                      'sarı': 'sarı',
                      'sari': 'sarı',
                      'mor': 'bənövşəyi',
                      'turuncu': 'narıncı',
                      'pembe': 'çəhrayı',
                      'gök mavisi': 'göy',
                      'gok mavisi': 'göy',
                      'gri': 'boz',
                      'kahverengi': 'qəhvəyi',
                      'kahve': 'qəhvəyi',
                      'altın': 'qızılı',
                      'altin': 'qızılı',
                      'gümüş': 'gümüş',
                      'gumus': 'gümüş',
                      
                      // İngilizce'den Azerbaycan'a çeviriler
                      'black': 'qara',
                      'white': 'ağ',
                      'red': 'qırmızı',
                      'blue': 'mavi',
                      'green': 'yaşıl',
                      'yellow': 'sarı',
                      'purple': 'bənövşəyi',
                      'orange': 'narıncı',
                      'pink': 'çəhrayı',
                      'cyan': 'göy',
                      'gray': 'boz',
                      'grey': 'boz',
                      'brown': 'qəhvəyi',
                      'gold': 'qızılı',
                      'silver': 'gümüş',
                      'turquoise': 'türkü',
                      'navy blue': 'lacivert',
                      'cream': 'krem',
                      'beige': 'bej',
                      'bronze': 'bürünc',
                      'olive': 'zeytun',
                      'maroon': 'bordo',
                      'crimson': 'crimson',
                      'tomato': 'pomidor',
                      'coral': 'mərcan',
                      'salmon': 'somon',
                      'lavender': 'lavanta',
                      'violet': 'violet',
                      'plum': 'gavalı',
                      'orchid': 'orkide',
                      'magenta': 'magenta',
                      'fuchsia': 'magenta',
                      'hot pink': 'istili çəhrayı',
                      'deep pink': 'dərin çəhrayı',
                      'medium violet red': 'orta bənövşəyi qırmızı',
                      'pale violet red': 'solğun bənövşəyi qırmızı',
                      
                      // Ek çeviriler
                      'light blue': 'açıq mavi',
                      'light green': 'açıq yaşıl',
                      'light red': 'açıq qırmızı',
                      'light yellow': 'açıq sarı',
                      'light pink': 'açıq çəhrayı',
                      'light purple': 'açıq bənövşəyi',
                      'light gray': 'açıq boz',
                      'light brown': 'açıq qəhvəyi',
                      'dark blue': 'tünd mavi',
                      'dark green': 'tünd yaşıl',
                      'dark red': 'tünd qırmızı',
                      'dark purple': 'tünd bənövşəyi',
                      'dark gray': 'tünd boz',
                      'dark brown': 'tünd qəhvəyi',
                      'dark yellow': 'tünd sarı',
                      'navy': 'tünd mavi',
                      'teal': 'yaşıl mavi',
                      'indigo': 'indigo',
                      'pastel blue': 'pastel mavi',
                      'pastel green': 'pastel yaşıl',
                      'pastel red': 'pastel qırmızı',
                      'pastel yellow': 'pastel sarı',
                      'pastel purple': 'pastel bənövşəyi',
                      'neon red': 'neon qırmızı',
                      'neon blue': 'neon mavi',
                      'neon green': 'neon yaşıl',
                      'neon yellow': 'neon sarı',
                      'neon pink': 'neon çəhrayı'
                    }
                    
                    const normalizedColor = selectedColor.toLowerCase().trim()
                    return colorTranslations[normalizedColor] || selectedColor
                  })()
                }</span>
              </div>
            )}
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
        
        {/* Sepete Ekle ve Ödeme butonları */}
        <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #e5e7eb' }}>
          {isNormalUser && (
            <button 
              className="btn btn-success" 
              onClick={handleAddToCart}
              disabled={addingToCart}
              style={{ 
                width: '100%', 
                textAlign: 'center', 
                marginBottom: 12,
                background: '#10B981',
                border: 'none',
                color: 'white',
                padding: '12px 16px',
                borderRadius: '6px',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: addingToCart ? 'not-allowed' : 'pointer',
                opacity: addingToCart ? 0.7 : 1
              }}
            >
                              {addingToCart ? 'Ekleniyor...' : 'Sepete Ekle'}
            </button>
          )}
          
          <a className="btn btn-primary" href={makeWaMsg(product)} target="_blank" rel="noreferrer" style={{ width: '100%', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
            </svg>
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
      {/* Ölçü Tablosu - Sadece geyim kategorisi için */}
      {product.productCategory === 'giyim' && (
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
      )}

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
                    {relatedProduct.discountPrice && Number(relatedProduct.discountPrice) > 0 && Number(relatedProduct.discountPrice) < Number(relatedProduct.price) ? (
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


