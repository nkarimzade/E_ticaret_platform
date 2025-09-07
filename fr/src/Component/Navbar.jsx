import { FaBasketShopping } from 'react-icons/fa6'
import React, { useState, useEffect } from 'react'
import { api } from '../utils/api'
import { saveAuthToken, getAuthToken, getUserType, getUserData, clearAuthData, checkTokenExpiry } from '../utils/auth'
import './Navbar.css'
import { MdFavorite } from 'react-icons/md'
import { IoMdExit } from 'react-icons/io'
import { FaStore } from 'react-icons/fa'
import { FaUser } from 'react-icons/fa'
import { useNavigate, useLocation } from 'react-router-dom'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [userToken, setUserToken] = useState(getAuthToken() || localStorage.getItem('store_token'))
  const [userType, setUserType] = useState(getUserType() || (localStorage.getItem('store_token') ? 'store' : null))
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [showStoreDropdown, setShowStoreDropdown] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const navigate = useNavigate()
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState(new URLSearchParams(location.search).get('q') || '')
  const [searchTimeout, setSearchTimeout] = useState(null)

  // İstifadəçi vəziyyətini yoxla
  useEffect(() => {
    const checkUser = async () => {
      // Token süresini kontrol et
      if (!checkTokenExpiry()) {
        setUserType(null)
        setUser(null)
        setCartCount(0)
        setUserToken(null)
        return
      }

      const token = getAuthToken() || localStorage.getItem('store_token')
      setUserToken(token)

      if (token) {
        try {
          // Önce localStorage'dan kullanıcı verilerini al
          const cachedUserData = getUserData()
          if (cachedUserData) {
            setUser(cachedUserData)
          }

          // Əvvəlcə müştəri kimi yoxla
          const userData = await api.meUser(token)
          setUserType('customer')
          setUser(userData)
          
          // Səbət sayını da yüklə
          const cartData = await api.getCart(token)
          setCartCount(cartData ? cartData.length : 0)
        } catch (error) {
          try {
            // Müştəri deyilsə mağaza kimi yoxla
            const storeData = await api.meStore(token)
            setUserType('store')
            setUser(storeData)
            setCartCount(0) // Mağazaların səbəti yoxdur
          } catch (storeError) {
            console.log('Token etibarsızdır:', error)
            setUserType(null)
            setUser(null)
            setCartCount(0)
            clearAuthData()
            setUserToken(null)
          }
        }
      } else {
        setUserType(null)
        setUser(null)
        setCartCount(0)
      }
    }

    checkUser()
  }, [])

  // Səbət yeniləmələrini dinlə
  useEffect(() => {
    const updateCartCount = async () => {
      if (userToken && userType === 'customer') {
        try {
          const cartData = await api.getCart(userToken)
          setCartCount(cartData ? cartData.length : 0)
        } catch (error) {
          console.log('Səbət yenilənə bilmədi:', error)
        }
      }
    }

    window.addEventListener('cartUpdated', updateCartCount)
    return () => window.removeEventListener('cartUpdated', updateCartCount)
  }, [userToken, userType])

  // URL değişince arama inputunu senkronize et
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    setSearchQuery(params.get('q') || '')
  }, [location.search])

  // Component unmount olduğunda timeout'u temizle
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
    }
  }, [searchTimeout])


  const handleLogout = () => {
    clearAuthData()
    localStorage.removeItem('store_token') // Mağaza token'ını da temizle
    setUserToken(null)
    setUser(null)
    setUserType(null)
    setShowUserDropdown(false)
    setShowStoreDropdown(false)
    setCartCount(0)
    window.location.href = '/' // Ana sayfaya yönlendir
  }

  // Dropdown xaricində klikləndikdə bağlama
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown')) {
        setShowUserDropdown(false)
        setShowStoreDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // ESC tuşu ile kapatma
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        setShowUserDropdown(false)
        setShowStoreDropdown(false)
      }
    }

    document.addEventListener('keydown', handleEscKey)
    return () => document.removeEventListener('keydown', handleEscKey)
  }, [])

  // Hamburger menyu xaricində klikləndikdə bağlama
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('mobile-menu')) {
      setIsOpen(false)
    }
  }

  // ESC düyməsi ilə bağlama
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
        setShowUserDropdown(false)
        setShowStoreDropdown(false)
      }
    }

      document.addEventListener('keydown', handleEscKey)
    document.body.style.overflow = isOpen ? 'hidden' : 'unset' // Scroll'u blokla/aç

    return () => {
      document.removeEventListener('keydown', handleEscKey)
      document.body.style.overflow = 'unset' // Scroll'u geri aç
    }
  }, [isOpen])

  return (
    <>
     
      <nav className="navbar">
        <div className="navbar-container">
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '50px' }} className="navbar-logo">
             <h1><a href="/"><img className="navbar-logo-img" src="/bavılogo.png" alt="logo" /></a></h1>
          </div>

          {/* Search Center */}
          <div className="navbar-search">
            <div className="search-input-wrapper">
              <input 
                placeholder="Məhsul və ya mağaza axtar" 
                value={searchQuery} 
                onChange={(e) => {
                  const value = e.target.value
                  setSearchQuery(value)
                  
                  // Önceki timeout'u temizle
                  if (searchTimeout) {
                    clearTimeout(searchTimeout)
                  }
                  
                  // 300ms sonra arama yap (debounce)
                  const timeout = setTimeout(() => {
                    const params = new URLSearchParams(location.search)
                    if (value) {
                      params.set('q', value)
                    } else {
                      params.delete('q')
                    }
                    navigate({ pathname: '/', search: params.toString() ? `?${params.toString()}` : '' })
                  }, 300)
                  
                  setSearchTimeout(timeout)
                }}
              />
            </div>
          </div>

          {/* Desktop Buttons */}
          <div className="navbar-buttons">
            {/* Səbət İkonu - Yalnız müştərilər üçün */}
            {userToken && userType === 'customer' && (
              <a href="/sepet" className="cart-icon-link">
                <div className="cart-icon-container">
                  <FaBasketShopping />
                  {cartCount > 0 && (
                    <span className="cart-badge">{cartCount}</span>
                  )}
                </div>
              </a>
            )}

            {/* Mağaza Dropdown - Mağazalar ve giriş yapmamış kullanıcılar için */}
            {(userType === 'store' || !userToken) && (
              <div className="dropdown">
                <button
                  className="dropdown-toggle store-dropdown"
                  onClick={() => {
                    setShowStoreDropdown(!showStoreDropdown)
                    setShowUserDropdown(false) // Digər dropdown'ı bağla
                  }}
                >
                  <img src="/profil.png" alt="Mağaza" className="dropdown-avatar" />
                  <span>{userToken ? 'Mağazam' : 'Mağaza'}</span>
                  <span className="dropdown-arrow">▼</span>
                </button>
                {showStoreDropdown && (
                  <div className="dropdown-menu show">
                    {userToken ? (
                      <>
                        <a href="/panel" className="dropdown-item">
                          <FaStore />
                          Mağazam
                        </a>
                        <div className="dropdown-divider"></div>
                        <button onClick={handleLogout} className="dropdown-item logout-item">
                          <IoMdExit />
                          Çıxış
                        </button>
                      </>
                    ) : (
                      <>
                        <a href="/magaza-giris" className="dropdown-item">
                          <FaStore />
                          Mağazana Daxil ol
                        </a>
                        <a href="/magaza-ac" className="dropdown-item">
                          <FaStore />
                          Mağaza aç
                        </a>
                        
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* İstifadəçi Dropdown - Müştərilər ve giriş yapmamış kullanıcılar için */}
            {(userType === 'customer' || (!userToken && userType !== 'store')) && (
              <div className="dropdown">
                <button
                  className="dropdown-toggle user-dropdown"
                  onClick={() => {
                    setShowUserDropdown(!showUserDropdown)
                    setShowStoreDropdown(false) // Digər dropdown'ı bağla
                  }}
                >
                  <img src="/profil.png" alt="Profil" className="dropdown-avatar" />
                  <span>{userToken ? 'Hesabım' : 'Giriş'}</span>
                  <span className="dropdown-arrow">▼</span>
                </button>
                {showUserDropdown && (
                  <div className="dropdown-menu show">
                    {userToken ? (
                      <>
                        <a href="/favorites" className="dropdown-item">
                          <MdFavorite />
                          Favorilər
                        </a>
                        <div className="dropdown-divider"></div>
                        <button onClick={handleLogout} className="dropdown-item logout-item">
                          <IoMdExit />
                          Çıxış
                        </button>
                      </>
                    ) : (
                      <>
                        <a href="/giris" className="dropdown-item">
                          Daxil ol
                        </a>
                        <a href="/kayit" className="dropdown-item">
                          Qeydiyyat
                        </a>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobil Səbət Düyməsi */}
          {userToken && userType === 'customer' && (
            <a href="/sepet" className="mobile-cart-link">
              <div className="mobile-cart-container">
                <FaBasketShopping />
                {cartCount > 0 && (
                  <span className="mobile-cart-badge">{cartCount}</span>
                )}
              </div>
            </a>
          )}

          {/* Mobile Hamburger */}
          <button
            className={`hamburger ${isOpen ? 'active' : ''}`}
            onClick={() => setIsOpen(!isOpen)}
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>
        {/* Mobile Menu */}
        <div 
          className={`mobile-menu ${isOpen ? 'open' : ''}`}
          onClick={handleOverlayClick}
        >
          <div className="mobile-menu-content">
            <div className="mobile-menu-header">
              <div className="mobile-logo">
                <a href="/" className="logo-link"><img src="/bavılogo.png" alt="logo" style={{ width: '80px', height: '80px' }} /></a>
              </div>

              <button className="mobile-close" onClick={() => setIsOpen(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            <div className="mobile-sections">
              {/* Mağaza Bölməsi - Mağazalar ve giriş yapmamış kullanıcılar için */}
              {(userType === 'store' || !userToken) && (
                <div className="mobile-section">
                  <h3 className="mobile-section-title">
                    <FaStore className="section-icon" />
                    {userToken ? 'Mağazam' : 'Mağaza'}
                  </h3>
                  <div className="mobile-section-items">
                    {userToken ? (
                      <>
                        <a href="/panel" className="mobile-section-item" onClick={() => setIsOpen(false)}>
                          <FaStore className="item-icon" />
                          Mağazam
                        </a>
                        <button
                          className="mobile-section-item logout-item"
                          onClick={() => { handleLogout(); setIsOpen(false); }}
                        >
                          <IoMdExit className="item-icon" />
                          Çıxış
                        </button>
                      </>
                    ) : (
                      <>
                        <a href="/panel" className="mobile-section-item" onClick={() => setIsOpen(false)}>
                          <FaStore className="item-icon" />
                          Mağazana Daxil ol
                        </a>
                        <a href="/magaza-ac" className="mobile-section-item" onClick={() => setIsOpen(false)}>
                          <FaStore className="item-icon" />
                          Mağaza aç
                        </a>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* İstifadəçi Bölməsi - Müştərilər ve giriş yapmamış kullanıcılar için */}
              {(userType === 'customer' || (!userToken && userType !== 'store')) && (
                <div className="mobile-section">
                  <h3 className="mobile-section-title">
                    <FaUser className="section-icon" />
                    Hesab
                  </h3>
                  <div className="mobile-section-items">
                    {userToken ? (
                      <>
                        <a href="/favorites" className="mobile-section-item" onClick={() => setIsOpen(false)}>
                          <MdFavorite className="item-icon" />
                          Favorilər
                        </a>
                        <button
                          className="mobile-section-item logout-item"
                          onClick={() => { handleLogout(); setIsOpen(false); }}
                        >
                          <IoMdExit className="item-icon" />
                          Çıxış
                        </button>
                      </>
                    ) : (
                      <>
                        <a href="/giris" className="mobile-section-item" onClick={() => setIsOpen(false)}>
                          <FaUser className="item-icon" />
                          Daxil ol
                        </a>
                        <a href="/kayit" className="mobile-section-item" onClick={() => setIsOpen(false)}>
                          <FaUser className="item-icon" />
                          Qeydiyyat
                        </a>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}

export default Navbar