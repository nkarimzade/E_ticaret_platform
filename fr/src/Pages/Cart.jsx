import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, resolveImageUrl } from '../utils/api'
import Notification from '../Components/Notification'
import { BsHourglassSplit } from 'react-icons/bs'
import { SlBasketLoaded } from 'react-icons/sl'

const Cart = () => {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState(null)
  const [storeDetails, setStoreDetails] = useState({})
  const userToken = localStorage.getItem('user_token')
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
                    {item.product?.discountPrice && item.product?.discountPrice > 0 ? (
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
                    const message = `Salam! ${storeData.storeName} mağazasından sifariş:\n\n${storeData.items.map(item => {
                      const discountPrice = parseFloat(item.product?.discountPrice || 0)
                      const regularPrice = parseFloat(item.product?.price || 0)
                      const price = discountPrice > 0 ? discountPrice : regularPrice
                      return `• ${item.product?.name} - ${item.quantity} ədəd - ${price} ₼`
                    }).join('\n')}\n\nCəmi: ${storeData.total.toFixed(2)} ₼`

                    // Mağazanın telefon numarasını kullan
                    const phoneNumber = storeData.storePhone.replace(/[^0-9]/g, '')

                    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
                    window.open(whatsappUrl, '_blank')
                  }}
                  disabled={!storeData.storePhone || storeData.storePhone.trim() === ''}
                >
                  {storeData.storePhone && storeData.storePhone.trim() !== '' ? 
                    `${storeData.storeName} ilə sifariş ver` : 
                    `${storeData.storeName} - Telefon nömrəsi yoxdur`
                  }
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
