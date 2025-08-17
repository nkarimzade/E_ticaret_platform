import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, resolveImageUrl } from '../utils/api'
import { getAuthToken } from '../utils/auth'
import Notification from '../Components/Notification'
import { BsHourglassSplit } from 'react-icons/bs'
import { SlBasketLoaded } from 'react-icons/sl'

const Cart = () => {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState(null)
  const [storeDetails, setStoreDetails] = useState({})
  const userToken = getAuthToken()
  const navigate = useNavigate()

  useEffect(() => {
    if (userToken) {
      loadCart()
    } else {
      setLoading(false)
    }
  }, [userToken])

  // Mağaza bilgilerini yükle
  useEffect(() => {
    const loadStoreDetails = async () => {
      const storeIds = [...new Set(cartItems.map(item => item.storeId))]
      const storeData = {}
      
      for (const storeId of storeIds) {
        try {
          const store = await api.getStore(storeId)
          storeData[storeId] = {
            name: store.name,
            phone: store.phone
          }
        } catch (error) {
          console.error('Mağaza bilgileri yüklenemedi:', error)
          storeData[storeId] = {
            name: 'Bilinməyən mağaza',
            phone: ''
          }
        }
      }
      
      setStoreDetails(storeData)
    }

    if (cartItems.length > 0) {
      loadStoreDetails()
    }
  }, [cartItems])

  const loadCart = async () => {
    try {
      const response = await api.getCart(userToken)
      setCartItems(response)
    } catch (error) {
      console.error('Səbət yükləmə xətası:', error)
      setNotification({ message: 'Səbət yüklənərkən xəta baş verdi', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateQuantity = async (productId, storeId, newQuantity) => {
    if (newQuantity < 1) return

    try {
      await api.updateCartQuantity(productId, storeId, newQuantity, userToken)
      setCartItems(prev => prev.map(item =>
        item.productId === productId && item.storeId === storeId
          ? { ...item, quantity: newQuantity }
          : item
      ))
      window.dispatchEvent(new Event('cartUpdated'))
    } catch (error) {
      console.error('Miqdar yeniləmə xətası:', error)
      setNotification({ message: 'Miqdar yenilənərkən xəta baş verdi', type: 'error' })
    }
  }

  const handleRemoveFromCart = async (productId, storeId) => {
    try {
      await api.removeFromCart(productId, storeId, userToken)
      setCartItems(prev => prev.filter(item =>
        !(item.productId === productId && item.storeId === storeId)
      ))
      setNotification({ message: 'Məhsul səbətdən silindi', type: 'success' })
      window.dispatchEvent(new Event('cartUpdated'))
    } catch (error) {
      console.error('Səbətdən silmə xətası:', error)
      setNotification({ message: 'Məhsul silinərkən xəta baş verdi', type: 'error' })
    }
  }

  const handleClearCart = async () => {
    try {
      await api.clearCart(userToken)
      setCartItems([])
      setNotification({ message: 'Səbət təmizləndi', type: 'success' })
      window.dispatchEvent(new Event('cartUpdated'))
    } catch (error) {
      console.error('Səbət təmizləmə xətası:', error)
      setNotification({ message: 'Səbət təmizlənərkən xəta baş verdi', type: 'error' })
    }
  }

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const discountPrice = parseFloat(item.product?.discountPrice || 0)
      const regularPrice = parseFloat(item.product?.price || 0)
      const price = discountPrice > 0 ? discountPrice : regularPrice
      return total + (price * item.quantity)
    }, 0)
  }

  // Sepet öğelerini mağazalara göre grupla
  const groupCartByStore = () => {
    const grouped = {}
    cartItems.forEach(item => {
      const storeId = item.storeId
      const storeInfo = storeDetails[storeId] || {}
      const storeName = storeInfo.name || item.product?.storeName || 'Bilinməyən mağaza'
      const storePhone = storeInfo.phone || item.product?.storePhone || ''
      
      if (!grouped[storeId]) {
        grouped[storeId] = {
          storeName,
          storePhone,
          items: [],
          total: 0
        }
      }
      
      const discountPrice = parseFloat(item.product?.discountPrice || 0)
      const regularPrice = parseFloat(item.product?.price || 0)
      const price = discountPrice > 0 ? discountPrice : regularPrice
      const itemTotal = price * item.quantity
      
      grouped[storeId].items.push(item)
      grouped[storeId].total += itemTotal
    })
    
    return grouped
  }

  if (!userToken) {
    return (
      <div className="cart-page">
        <div className="cart-empty">
          <div className="cart-empty-icon">🔒</div>
          <h4>Daxil olun</h4>
          <p>Səbəti görmək üçün daxil olmalısınız.</p>
          <a href="/giris" className="cart-empty-btn">Daxil ol</a>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="cart-page">
        <div className="cart-loading">
          <div className="loading-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
          <h4>Səbət yüklənir...</h4>
          <p>Məhsullarınız hazırlanır</p>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-page">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="cart-header">
        <h2>Səbətim ({cartItems.length})</h2>
        {cartItems.length > 0 && (
          <button
            className="cart-clear-btn"
            onClick={handleClearCart}
          >
            Səbəti təmizlə
          </button>
        )}
      </div>

      {cartItems.length === 0 ? (
        <div className="cart-empty">
          <div className="cart-empty-icon"><SlBasketLoaded />
          </div>
          <h4>Səbətiniz boşdur</h4>
          <p>Alış-verişə başlamaq üçün məhsullara baxın.</p>
          <a href="/" className="cart-empty-btn">Alış-verişə başla</a>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map((item, index) => (
              <div key={index} className="cart-item">
                <div className="cart-item-image">
                  <img
                    src={resolveImageUrl(item.product?.image)}
                    alt={item.product?.name}
                  />
                </div>
                <div className="cart-item-details">
                  <h5 className="cart-item-name">{item.product?.name}</h5>
                  <p className="cart-item-store">{item.product?.storeName}</p>
                  <div className="cart-item-price">
                    {item.product?.discountPrice && Number(item.product?.discountPrice) > 0 && Number(item.product?.discountPrice) < Number(item.product?.price) ? (
                      <>
                        <span style={{ color: '#64748b', textDecoration: 'line-through', marginRight: 8 }}>{item.product?.price} ₼</span>
                        <span>{item.product?.discountPrice} ₼</span>
                      </>
                    ) : (
                      <span>{item.product?.price} ₼</span>
                    )}
                  </div>
                </div>
                <div className="cart-item-actions">
                  <div className="cart-quantity-controls">
                    <button
                      className="quantity-btn"
                      onClick={() => handleUpdateQuantity(item.productId, item.storeId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="quantity-display">{item.quantity}</span>
                    <button
                      className="quantity-btn"
                      onClick={() => handleUpdateQuantity(item.productId, item.storeId, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="cart-remove-btn"
                    onClick={() => handleRemoveFromCart(item.productId, item.storeId)}
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <div className="cart-total">
              <span>Ümumi cəmi:</span>
              <span>{calculateTotal().toFixed(2)} ₼</span>
            </div>
            
            {/* Mağazalara göre sipariş butonları */}
            {Object.entries(groupCartByStore()).map(([storeId, storeData]) => (
              <div key={storeId} className="store-order-section">
                <div className="store-order-header">
                  <h4>{storeData.storeName}</h4>
                  <span className="store-total">{storeData.total.toFixed(2)} ₼</span>
                </div>
                <button
                  className="cart-whatsapp-btn"
                  onClick={() => {
                    // Modern ve resmi WhatsApp mesajı oluştur
                    const baseUrl = window.location.origin
                    const itemsList = storeData.items.map(item => {
                      const discountPrice = parseFloat(item.product?.discountPrice || 0)
                      const regularPrice = parseFloat(item.product?.price || 0)
                      const price = discountPrice > 0 ? discountPrice : regularPrice
                      const productLink = `${baseUrl}/urun/${item.storeId}/${item.productId}`
                      
                      return `📦 ${item.product?.name}
💰 Qiymət: ${price} ₼
📊 Miqdar: ${item.quantity} ədəd
🔗 Məhsul linki: ${productLink}`
                    }).join('\n\n')

                    const message = `Salam! ${storeData.storeName} mağazasından sifariş etmək istəyirəm.

🛒 Sifariş detalları:
${itemsList}

💳 Ümumi məbləğ: ${storeData.total.toFixed(2)} ₼

📞 Əlaqə üçün bu mesajı göndərdim.
⏰ Tezliklə cavab gözləyirəm.

Təşəkkürlər! 🙏`

                    const phoneNumber = storeData.storePhone.replace(/[^0-9]/g, '')
                    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
                    window.open(whatsappUrl, '_blank')
                  }}
                  disabled={!storeData.storePhone || storeData.storePhone.trim() === ''}
                >
                  {storeData.storePhone && storeData.storePhone.trim() !== '' ? (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px' }}>
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                      </svg>
                      {storeData.storeName} ilə sifariş ver
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px', opacity: 0.5 }}>
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                      </svg>
                      {storeData.storeName} - Telefon nömrəsi yoxdur
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default Cart
