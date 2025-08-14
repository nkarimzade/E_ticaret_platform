import React, { useEffect, useState } from 'react'
import { api, resolveImageUrl } from '../utils/api'
import { Link } from 'react-router-dom'
import Notification from '../Components/Notification'

const Favorites = () => {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState(null)
  const userToken = localStorage.getItem('user_token')

  useEffect(() => {
    if (!userToken) {
      setNotification({ message: 'Favoriləri görmək üçün daxil olmalısınız', type: 'error' })
      return
    }

    loadFavorites()
  }, [userToken])

  const loadFavorites = async () => {
    try {
      setLoading(true)
      const data = await api.getFavorites(userToken)
      setFavorites(data)
    } catch (error) {
      console.error('Error loading favorites:', error)
      setNotification({ message: 'Favorilər yüklənərkən xəta baş verdi', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const removeFromFavorites = async (productId, storeId) => {
    try {
      await api.removeFromFavorites(productId, storeId, userToken)
      setFavorites(favorites.filter(fav => !(fav.id === productId && fav.storeId === storeId)))
      setNotification({ message: 'Məhsul favorilərdən silindi', type: 'success' })
    } catch (error) {
      console.error('Error removing from favorites:', error)
      setNotification({ message: 'Məhsul silinərkən xəta baş verdi', type: 'error' })
    }
  }

  if (!userToken) {
    return (
      <div className="page">
        <div className="card">
          <div className="card-header">
            <h2>Favorilər</h2>
          </div>
          <div className="card-body">
            <p>Favoriləri görmək üçün <Link to="/giris">daxil olun</Link> və ya <Link to="/kayit">qeydiyyat olun</Link>.</p>
          </div>
        </div>
      </div>
    )
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
        <h2>Favori Məhsullarım</h2>
      </div>

      {loading ? (
        <div className="muted">Yüklənir...</div>
      ) : favorites.length === 0 ? (
        <div className="card">
          <div className="card-body">
            <p>Hələ heç bir məhsul favorilərə əlavə etməmisiniz.</p> <br />
            <Link to="/" className="btn btn-primary">Məhsullara bax</Link>
          </div>
        </div>
      ) : (
        <div className="product-grid">
          {favorites.map((product) => {
            const hasDiscount = product.discountPrice && Number(product.discountPrice) > 0
            const price = Number(product.price) || 0
            const dprice = Number(product.discountPrice) || 0
            const pct = hasDiscount && price > 0 ? Math.round((1 - dprice / price) * 100) : 0
            const addedAt = product.addedAt || product.createdAt
            const isNew = addedAt ? (Date.now() - new Date(addedAt).getTime()) < 7 * 24 * 60 * 60 * 1000 : false
            const lowStock = Number(product.stock) <= 3

            return (
              <Link 
                key={`${product.storeId}-${product.id}`} 
                to={`/urun/${product.storeId}/${product.id}`}
                className="product-card"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                {isNew && <span className="ribbon ribbon-new">Yeni</span>}
                {hasDiscount && pct > 0 && <span className="ribbon ribbon-discount">-{pct}%</span>}
                
                <div className="product-image" style={{ aspectRatio: '4 / 5' }}>
                  {product.image ? (
                    <img alt={product.name} src={resolveImageUrl(product.image)} />
                  ) : (
                    <div className="muted" style={{fontSize:12}}>Görsel yok</div>
                  )}
                  <div className="image-cta">
                    <span>Ətraflı bax</span>
                  </div>
                </div>

                <div className="product-info">
                  <div className="product-title">{product.name}</div>
                  <div className="product-store">{product.storeName}</div>
                  <div className="product-price" style={{fontSize:'1.1rem'}}>
                    {hasDiscount ? (
                      <>
                        <span style={{ color: '#ef4444', textDecoration: 'line-through', marginRight: 8 }}>{product.price} AZN</span>
                        <span style={{ color: '#10B981', fontWeight: 700 }}>{product.discountPrice} AZN</span>
                      </>
                    ) : (
                      <>{product.price} AZN</>
                    )}
                  </div>
                  
                  {Array.isArray(product.campaigns) && product.campaigns.length > 0 && (
                    <div className="pill-row">
                      {product.campaigns.slice(0,2).map((c) => (
                        <span key={c} className="pill pill-green">{c}</span>
                      ))}
                      {product.campaigns.length > 2 && <span className="pill">+{product.campaigns.length - 2}</span>}
                    </div>
                  )}
                  
                  {lowStock && <div className="pill pill-warning" style={{ marginTop: 8 }}>Son {product.stock} ədəd</div>}
                  
                  <div className="product-actions">
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        removeFromFavorites(product.id, product.storeId)
                      }}
                    >
                      Favorilərdən sil
                    </button>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Favorites
