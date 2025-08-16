import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api, resolveImageUrl } from '../utils/api'

const StoreDetail = () => {
  const { id } = useParams()
  const [store, setStore] = useState(null)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')
  const [sortBy, setSortBy] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [genderFilter, setGenderFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [favorites, setFavorites] = useState([])
  const [cart, setCart] = useState([])
  const userToken = localStorage.getItem('user_token')

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

  // Favori ürünleri yükle
  useEffect(() => {
    const loadFavorites = async () => {
      if (userToken) {
        try {
          const favoritesData = await api.getFavorites(userToken)
          setFavorites(favoritesData || [])
        } catch (error) {
          console.log('Favoriler yüklenemedi:', error)
        }
      }
    }
    loadFavorites()
  }, [userToken])

  // Sepet ürünleri yükle
  useEffect(() => {
    const loadCart = async () => {
      if (userToken) {
        try {
          const cartData = await api.getCart(userToken)
          setCart(cartData || [])
        } catch (error) {
          console.log('Sepet yüklenemedi:', error)
        }
      }
    }
    loadCart()
  }, [userToken])

  const waPhone = useMemo(() => {
    const phone = (store && store.phone) ? String(store.phone) : ''
    const raw = phone.replace(/\D+/g, '')
    if (!raw) return ''
    const withCountry = raw.startsWith('994') ? `+${raw}` : `+994${raw}`
    return withCountry
  }, [store && store.phone])
  
  const filteredProducts = useMemo(() => {
    const list = Array.isArray(store?.products) ? store.products : []
    let filtered = list.filter(p => {
      // Arama filtresi
      const searchMatch = !q || (p.name || '').toLowerCase().includes(q.toLowerCase())
      
      // Kategori filtresi
      let categoryMatch = true
      if (categoryFilter === 'tumu') {
        categoryMatch = true
      } else if (categoryFilter === 'kadin') {
        categoryMatch = p.category === 'kadin'
      } else if (categoryFilter === 'erkek') {
        categoryMatch = p.category === 'erkek'
      } else if (categoryFilter) {
        categoryMatch = p.productCategory === categoryFilter
      }
      
      // Cinsiyet filtresi
      const genderMatch = !genderFilter || p.category === genderFilter
      
      // Fiyat aralığı filtresi
      const price = Number(p.price) || 0
      const priceMatch = (!minPrice || price >= Number(minPrice)) && 
                        (!maxPrice || price <= Number(maxPrice))
      
      return searchMatch && categoryMatch && genderMatch && priceMatch
    })

    // Sıralama
    if (sortBy === 'price-asc') {
      filtered.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0))
    } else if (sortBy === 'price-desc') {
      filtered.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0))
    }

    return filtered
  }, [store?.products, q, categoryFilter, sortBy, minPrice, maxPrice, genderFilter])

  const clearFilters = () => {
    setSortBy('')
    setMinPrice('')
    setMaxPrice('')
    setGenderFilter('')
    setCategoryFilter('')
  }

  const hasActiveFilters = sortBy || minPrice || maxPrice || genderFilter || categoryFilter

  // Ürünün favori olup olmadığını kontrol et
  const isFavorite = (productId) => {
    return favorites.some(fav => fav.id === productId)
  }

  // Ürünün sepette olup olmadığını kontrol et
  const isInCart = (productId) => {
    return cart.some(item => item.id === productId)
  }

  const handleFavoriteToggle = async (productId, storeId, e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!userToken) {
      return
    }

    const isCurrentlyFavorite = isFavorite(productId)

    try {
      if (isCurrentlyFavorite) {
        // Favorilerden çıkar
        await api.removeFromFavorites(productId, storeId, userToken)
        setFavorites(favorites.filter(fav => fav.id !== productId))
      } else {
        // Favorilere ekle
        await api.addToFavorites(productId, storeId, userToken)
        setFavorites([...favorites, { id: productId, storeId }])
      }
    } catch (error) {
      console.error('Favori işlemi hatası:', error)
    }
  }

  const handleAddToCart = async (productId, storeId, quantity = 1) => {
    if (!userToken) {
      return
    }

    try {
      await api.addToCart(productId, storeId, quantity, userToken)
      // Sepet listesini güncelle
      const updatedCart = [...cart, { id: productId, storeId, quantity }]
      setCart(updatedCart)
      
      // Navbar'daki sepet sayısını güncelle
      window.dispatchEvent(new Event('cartUpdated'))
    } catch (error) {
      console.error('Sepete ekleme hatası:', error)
    }
  }

  if (error) return <div className="page"><div className="muted">{error}</div></div>
  if (!store) return <div className="page"><div className="muted">Yükleniyor...</div></div>

  const makeWaMsg = (p) => {
    const baseUrl = window.location.origin
    const text = `Salam, ${store.name} mağazasından \"${p.name}\" (${p.price} AZN) məhsulunu sifariş etmək istəyirəm.
    Məhsul linki : ${baseUrl}/urun/${store.id}/${p.id}`
    const enc = encodeURIComponent(text)
    const phone = waPhone.replace(/\D+/g, '')
    return `https://wa.me/${phone}?text=${enc}`
  }

  return (
    <div className="page">
      {/* Mağaza Başlığı */}
      <div className="store-title-section">
        <div className="store-header">
          <div className="store-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" stroke="currentColor" strokeWidth="2"/>
              <path d="M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="store-info">
            <h1>{store.name}</h1>
            <div className="store-meta">
              <span className="product-count">{filteredProducts.length} ürün</span>
              {waPhone && (
                <a href={`tel:${waPhone}`} className="phone-link">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {waPhone}
                </a>
              )}
            </div>
          </div>
          {waPhone && (
            <a href={`https://wa.me/${waPhone.replace('+', '')}`} className="whatsapp-link" target="_blank" rel="noopener noreferrer">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
            </a>
          )}
        </div>
      </div>

      <div className="toolbar">
        <h3>Ürünler</h3>
        <div className="filters-container">
          {/* Arama */}
          <div className="search-input-wrapper">
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#6b7280" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zM10 14a4 4 0 110-8 4 4 0 010 8z"></path></svg>
            <input placeholder="Məhsul axtar" value={q} onChange={(e)=>setQ(e.target.value)} />
          </div>

          {/* Filtreleme Butonu */}
          <button 
            className={`filter-button ${hasActiveFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Filtrlər
            {hasActiveFilters && <span className="filter-badge">{[sortBy, minPrice, maxPrice, genderFilter, categoryFilter].filter(Boolean).length}</span>}
          </button>
        </div>
      </div>

      {/* Filtreleme Modal */}
      {showFilters && (
        <div className="filter-modal-overlay" onClick={() => setShowFilters(false)}>
          <div className="filter-modal" onClick={(e) => e.stopPropagation()}>
            <div className="filter-modal-header">
              <h3>Filtrlər</h3>
              <button className="close-button" onClick={() => setShowFilters(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            
            <div className="filter-modal-content">
              {/* Sıralama */}
              <div className="filter-section">
                <h4>Sıralama</h4>
                <div className="filter-options">
                  <label className="filter-option">
                    <input
                      type="radio"
                      name="sort"
                      value=""
                      checked={sortBy === ''}
                      onChange={(e) => setSortBy(e.target.value)}
                    />
                    <span>Standart</span>
                  </label>
                  <label className="filter-option">
                    <input
                      type="radio"
                      name="sort"
                      value="price-asc"
                      checked={sortBy === 'price-asc'}
                      onChange={(e) => setSortBy(e.target.value)}
                    />
                    <span>Qiymət (Artan)</span>
                  </label>
                  <label className="filter-option">
                    <input
                      type="radio"
                      name="sort"
                      value="price-desc"
                      checked={sortBy === 'price-desc'}
                      onChange={(e) => setSortBy(e.target.value)}
                    />
                    <span>Qiymət (Azalan)</span>
                  </label>
                </div>
              </div>

              {/* Cinsiyet Filtresi */}
              <div className="filter-section">
                <h4>Cinsiyət</h4>
                <div className="filter-options">
                  <label className="filter-option">
                    <input
                      type="radio"
                      name="gender"
                      value=""
                      checked={genderFilter === ''}
                      onChange={(e) => setGenderFilter(e.target.value)}
                    />
                    <span>Hamısı</span>
                  </label>
                  <label className="filter-option">
                    <input
                      type="radio"
                      name="gender"
                      value="kadin"
                      checked={genderFilter === 'kadin'}
                      onChange={(e) => setGenderFilter(e.target.value)}
                    />
                    <span>Qadın</span>
                  </label>
                  <label className="filter-option">
                    <input
                      type="radio"
                      name="gender"
                      value="erkek"
                      checked={genderFilter === 'erkek'}
                      onChange={(e) => setGenderFilter(e.target.value)}
                    />
                    <span>Kişi</span>
                  </label>
                </div>
              </div>

              {/* Kategori Filtresi */}
              <div className="filter-section">
                <h4>Kateqoriya</h4>
                <div className="filter-options">
                  <label className="filter-option">
                    <input
                      type="radio"
                      name="category"
                      value=""
                      checked={categoryFilter === ''}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    />
                    <span>Hamısı</span>
                  </label>
                  <label className="filter-option">
                    <input
                      type="radio"
                      name="category"
                      value="tumu"
                      checked={categoryFilter === 'tumu'}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    />
                    <span>Tümü</span>
                  </label>
                  <label className="filter-option">
                    <input
                      type="radio"
                      name="category"
                      value="kadin"
                      checked={categoryFilter === 'kadin'}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    />
                    <span>Qadın</span>
                  </label>
                  <label className="filter-option">
                    <input
                      type="radio"
                      name="category"
                      value="erkek"
                      checked={categoryFilter === 'erkek'}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    />
                    <span>Kişi</span>
                  </label>
                  <label className="filter-option">
                    <input
                      type="radio"
                      name="category"
                      value="ayakkabi"
                      checked={categoryFilter === 'ayakkabi'}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    />
                    <span>Ayaqqabı</span>
                  </label>
                  <label className="filter-option">
                    <input
                      type="radio"
                      name="category"
                      value="giyim"
                      checked={categoryFilter === 'giyim'}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    />
                    <span>Geyim</span>
                  </label>
                  <label className="filter-option">
                    <input
                      type="radio"
                      name="category"
                      value="aksesuar"
                      checked={categoryFilter === 'aksesuar'}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    />
                    <span>Aksesuar</span>
                  </label>
                  <label className="filter-option">
                    <input
                      type="radio"
                      name="category"
                      value="makyaj"
                      checked={categoryFilter === 'makyaj'}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    />
                    <span>Makiyaj</span>
                  </label>
                  <label className="filter-option">
                    <input
                      type="radio"
                      name="category"
                      value="parfum"
                      checked={categoryFilter === 'parfum'}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    />
                    <span>Ətir</span>
                  </label>
                  <label className="filter-option">
                    <input
                      type="radio"
                      name="category"
                      value="elektronik"
                      checked={categoryFilter === 'elektronik'}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    />
                    <span>Elektronika</span>
                  </label>
                </div>
              </div>

              {/* Fiyat Aralığı */}
              <div className="filter-section">
                <h4>Qiymət Aralığı</h4>
                <div className="price-range-inputs">
                  <div className="price-input-group">
                    <label>Min qiymət</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="price-input"
                    />
                  </div>
                  <div className="price-input-group">
                    <label>Max qiymət</label>
                    <input
                      type="number"
                      placeholder="1000"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="price-input"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="filter-modal-footer">
              <button className="clear-filters-button" onClick={clearFilters}>
                Filtrləri təmizlə
              </button>
              <button className="apply-filters-button" onClick={() => setShowFilters(false)}>
                Tətbiq et
              </button>
            </div>
          </div>
        </div>
      )}

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
                {userToken && (
                  <button 
                    className={`favorite-btn ${isFavorite(p.id) ? 'favorite-active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleFavoriteToggle(p.id, store.id, e)
                    }}
                    title={isFavorite(p.id) ? "Favorilərdən çıxar" : "Favorilərə əlavə et"}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill={isFavorite(p.id) ? "currentColor" : "none"}>
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                )}
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
                  
                  {/* Sepete Ekle Butonu */}
                  {userToken && (
                    <button 
                      className={`add-to-cart-btn ${isInCart(p.id) ? 'in-cart' : ''}`}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleAddToCart(p.id, store.id, 1)
                      }}
                      title={isInCart(p.id) ? "Sepette var" : "Sepete ekle"}
                    >
                      {isInCart(p.id) ? 'Sepette' : 'Sepete Ekle'}
                    </button>
                  )}
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


