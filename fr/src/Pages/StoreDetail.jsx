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
  const [sortBy, setSortBy] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [genderFilter, setGenderFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  
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
      <div style={{width:"100%",height:"5vh",display:"flex",alignItems:"center",justifyContent:"center",backgroundColor:"#6366f1",color:"#ffffff",fontSize:"1rem",margin:"20px 0",borderRadius:"10px"}}>Hal-hazırda {store.name} mağazasındasınız</div>
      <div style={{textAlign:"center",fontSize:"1.2rem",margin:"20px 0"}}>
        Aşağıda {store.name} mağazasındakı məhsulları görə bilərsiniz.
      </div>
    

      <div className="toolbar">
        <h3>Mağazadakı Məhsulları</h3>
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


