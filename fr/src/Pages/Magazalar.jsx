import React, { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { api, resolveImageUrl } from '../utils/api'
import { getAuthToken } from '../utils/auth'
import { Link } from 'react-router-dom'
import './Magazalar.css'
import Notification from '../Components/Notification'

const Magazalar = ({ selectedCategory = 'tumu' }) => {
  const [approved, setApproved] = useState([])
  const location = useLocation()
  const [q, setQ] = useState(new URLSearchParams(location.search).get('q') || '')
  const [sortBy, setSortBy] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [genderFilter, setGenderFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [notification, setNotification] = useState(null)
  const [favorites, setFavorites] = useState([])
  const [cart, setCart] = useState([])
  const userToken = getAuthToken()
  
  useEffect(() => { (async () => setApproved(await api.listApprovedStores()))() }, [])
  
  // Favorileri yükle
  useEffect(() => {
    if (userToken) {
      api.getFavorites(userToken)
        .then(favs => setFavorites(favs.map(f => ({ id: f.id, storeId: f.storeId }))))
        .catch(err => console.log('Favoriler yüklenemedi:', err))
    }
  }, [userToken])
  
  // Sepeti yükle
  useEffect(() => {
    if (userToken) {
      api.getCart(userToken)
        .then(cartData => setCart(cartData || []))
        .catch(err => console.log('Sepet yüklenemedi:', err))
    }
  }, [userToken])
  
  const isFavorite = (productId) => {
    return favorites.some(fav => fav.id === productId)
  }
  
  const isInCart = (productId) => {
    return cart.some(item => item.id === productId)
  }
  
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
      category: p.category,
      productCategory: p.productCategory,
    })))
  }, [approved])

  // URL q değişince senkronize et
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    setQ(params.get('q') || '')
  }, [location.search])
  
  const filtered = useMemo(() => {
    let filteredProducts = products.filter(p => {
      // Arama filtresi
      const searchMatch = (p.name||'').toLowerCase().includes(q.toLowerCase()) || 
                         (p.storeName||'').toLowerCase().includes(q.toLowerCase())
      
      // Kategori filtresi
      let categoryMatch = true
      if (selectedCategory === 'tumu') {
        // Tümü seçildiğinde tüm ürünler gösterilir
        categoryMatch = true
      } else if (selectedCategory === 'kadin') {
        categoryMatch = p.category === 'kadin'
      } else if (selectedCategory === 'erkek') {
        categoryMatch = p.category === 'erkek'
      } else {
        // Diğer kategoriler için productCategory'yi kontrol et
        categoryMatch = p.productCategory === selectedCategory
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
      filteredProducts.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0))
    } else if (sortBy === 'price-desc') {
      filteredProducts.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0))
    }

    return filteredProducts
  }, [products, q, selectedCategory, sortBy, minPrice, maxPrice, genderFilter])

  const clearFilters = () => {
    setSortBy('')
    setMinPrice('')
    setMaxPrice('')
    setGenderFilter('')
  }

  const hasActiveFilters = sortBy || minPrice || maxPrice || genderFilter

  const handleFavoriteToggle = async (productId, storeId, e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!userToken) {
      setNotification({ message: 'Favorilərə əlavə etmək üçün daxil olmalısınız', type: 'error' })
      return
    }

    const isCurrentlyFavorite = isFavorite(productId)
    
    try {
      if (isCurrentlyFavorite) {
        await api.removeFromFavorites(productId, storeId, userToken)
        setFavorites(favorites.filter(fav => fav.id !== productId))
        setNotification({ message: 'Məhsul favorilərdən çıxarıldı', type: 'success' })
      } else {
        await api.addToFavorites(productId, storeId, userToken)
        setFavorites([...favorites, { id: productId, storeId }])
        setNotification({ message: 'Məhsul favorilərə əlavə edildi', type: 'success' })
      }
    } catch (error) {
      console.error('Favori işlemi hatası:', error)
      setNotification({ message: 'Xəta baş verdi', type: 'error' })
    }
  }

  const handleAddToCart = async (productId, storeId, quantity = 1) => {
    if (!userToken) {
      setNotification({ message: 'Sepete eklemek için giriş yapmalısınız', type: 'error' })
      return
    }
    try {
      await api.addToCart(productId, storeId, quantity, userToken)
      const updatedCart = [...cart, { id: productId, storeId, quantity }]
      setCart(updatedCart)
      setNotification({ message: 'Ürün sepete eklendi!', type: 'success' })
      window.dispatchEvent(new Event('cartUpdated'))
    } catch (error) {
      console.error('Sepete ekleme hatası:', error)
      setNotification({ message: 'Sepete eklenirken hata oluştu', type: 'error' })
    }
  }

  return (
    <div className="page">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="store-list-header">
        <h2>Məhsullar</h2>
        <div className="filters-container">
          {/* Filtreleme Butonu */}
          <button 
            className={`filter-button ${hasActiveFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {hasActiveFilters && <span className="filter-badge">{[sortBy, minPrice, maxPrice, genderFilter].filter(Boolean).length}</span>}
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
        {filtered.length === 0 && <div className="muted">Axtarılan məhsul və ya mağaza tapılmadı.</div>}
        {filtered.map((p) => {
            const hasDiscount = p.discountPrice && Number(p.discountPrice) > 0 && Number(p.discountPrice) < Number(p.price)
          const price = Number(p.price) || 0
          const dprice = Number(p.discountPrice) || 0
          const pct = hasDiscount && price > 0 ? Math.round((1 - dprice / price) * 100) : 0
          const isNew = p.addedAt ? (Date.now() - new Date(p.addedAt).getTime()) < 7 * 24 * 60 * 60 * 1000 : false
          return (
            <Link 
              key={`${p.storeId}-${p.id}`} 
              to={`/urun/${p.storeId}/${p.id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="product-card">
                {isNew && <span className="ribbon ribbon-new">Yeni</span>}
                {hasDiscount && pct > 0 && <span className="ribbon ribbon-discount">-{pct}%</span>}
                
                <div className="product-image" style={{ aspectRatio: '4 / 5' }}>
                  {p.image ? (<img alt={p.name} src={resolveImageUrl(p.image)} />) : (<div className="muted" style={{fontSize:12}}>Şəkil yoxdur</div>)}
                  <div className="image-cta">
                    <span>Ətraflı bax</span>
                  </div>
                  {userToken && (
                    <button 
                      className={`favorite-btn ${isFavorite(p.id) ? 'favorite-active' : ''}`}
                      onClick={(e) => handleFavoriteToggle(p.id, p.storeId, e)}
                      title={isFavorite(p.id) ? "Favorilərdən çıxar" : "Favorilərə əlavə et"}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  )}
                </div>
                
                <div className="product-info">
                  <div className="product-title">
                    {p.name}
                  </div>
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
                  {userToken && (
                    <button 
                      className={`add-to-cart-btn ${isInCart(p.id) ? 'in-cart' : ''}`}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleAddToCart(p.id, p.storeId)
                      }}
                      disabled={isInCart(p.id)}
                    >
                      {isInCart(p.id) ? 'Sepette' : 'Sepete Ekle'}
                    </button>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default Magazalar