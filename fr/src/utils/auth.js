// Kalıcı oturum sistemi için auth utility
const TOKEN_KEY = 'user_token'
const USER_TYPE_KEY = 'user_type'
const USER_DATA_KEY = 'user_data'
const TOKEN_EXPIRY_KEY = 'token_expiry'

// Token'ı localStorage'a kaydet (7 günlük süre ile)
export const saveAuthToken = (token, userType, userData) => {
  try {
    // Token'ı kaydet
    localStorage.setItem(TOKEN_KEY, token)
    
    // Kullanıcı tipini kaydet
    localStorage.setItem(USER_TYPE_KEY, userType)
    
    // Kullanıcı verilerini kaydet
    if (userData) {
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData))
    }
    
    // Token süresini kaydet (7 gün sonra)
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + 7)
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryDate.toISOString())
    
    console.log('✅ Oturum bilgileri kaydedildi')
  } catch (error) {
    console.error('❌ Oturum bilgileri kaydedilemedi:', error)
  }
}

// Token'ı localStorage'dan al
export const getAuthToken = () => {
  try {
    const token = localStorage.getItem(TOKEN_KEY)
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY)
    
    if (!token || !expiry) {
      return null
    }
    
    // Token süresini kontrol et
    const expiryDate = new Date(expiry)
    const now = new Date()
    
    if (now > expiryDate) {
      console.log('⚠️ Token süresi dolmuş, oturum temizleniyor')
      clearAuthData()
      return null
    }
    
    return token
  } catch (error) {
    console.error('❌ Token alınamadı:', error)
    return null
  }
}

// Kullanıcı tipini al
export const getUserType = () => {
  try {
    return localStorage.getItem(USER_TYPE_KEY)
  } catch (error) {
    console.error('❌ Kullanıcı tipi alınamadı:', error)
    return null
  }
}

// Kullanıcı verilerini al
export const getUserData = () => {
  try {
    const userData = localStorage.getItem(USER_DATA_KEY)
    return userData ? JSON.parse(userData) : null
  } catch (error) {
    console.error('❌ Kullanıcı verileri alınamadı:', error)
    return null
  }
}

// Oturum verilerini temizle
export const clearAuthData = () => {
  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_TYPE_KEY)
    localStorage.removeItem(USER_DATA_KEY)
    localStorage.removeItem(TOKEN_EXPIRY_KEY)
    console.log('✅ Oturum verileri temizlendi')
  } catch (error) {
    console.error('❌ Oturum verileri temizlenemedi:', error)
  }
}

// Oturum durumunu kontrol et
export const isAuthenticated = () => {
  const token = getAuthToken()
  return !!token
}

// Token süresini kontrol et ve gerekirse yenile
export const checkTokenExpiry = () => {
  const token = getAuthToken()
  if (!token) {
    return false
  }
  
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY)
  if (!expiry) {
    clearAuthData()
    return false
  }
  
  const expiryDate = new Date(expiry)
  const now = new Date()
  const timeLeft = expiryDate.getTime() - now.getTime()
  
  // 1 günden az kaldıysa uyarı ver
  if (timeLeft < 24 * 60 * 60 * 1000) {
    console.log('⚠️ Token süresi yakında dolacak')
  }
  
  return timeLeft > 0
}

// Oturum bilgilerini güncelle
export const updateAuthData = (userData) => {
  try {
    if (userData) {
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData))
    }
  } catch (error) {
    console.error('❌ Oturum bilgileri güncellenemedi:', error)
  }
}
