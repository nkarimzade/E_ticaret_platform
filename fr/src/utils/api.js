const baseFromEnv = import.meta && import.meta.env && import.meta.env.VITE_API_URL
const DEFAULT_BASE = 'http://localhost:3002'
export const API_BASE_URL = baseFromEnv || DEFAULT_BASE

const jsonHeaders = { 'Content-Type': 'application/json' }

const handle = async (res) => {
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `HTTP ${res.status}`)
  }
  return res.json()
}

export const api = {
  // Stores
  createStore: (payload) => fetch(`${API_BASE_URL}/api/stores`, { method: 'POST', headers: jsonHeaders, body: JSON.stringify(payload) }).then(handle),
  getStore: (id) => fetch(`${API_BASE_URL}/api/stores/${id}`).then(handle),
  listStores: () => fetch(`${API_BASE_URL}/api/stores`).then(handle),
  listApprovedStores: () => fetch(`${API_BASE_URL}/api/stores/approved`).then(handle),
  approveStore: (id) => fetch(`${API_BASE_URL}/api/stores/${id}/approve`, { method: 'POST' }).then(handle),
  rejectStore: (id) => fetch(`${API_BASE_URL}/api/stores/${id}/reject`, { method: 'POST' }).then(handle),
  toggleStore: (id) => fetch(`${API_BASE_URL}/api/stores/${id}/toggle`, { method: 'POST' }).then(handle),
  deleteStore: (id) => fetch(`${API_BASE_URL}/api/stores/${id}`, { method: 'DELETE' }).then(handle),
  // Products
  addProduct: (storeId, formData, token) => fetch(`${API_BASE_URL}/api/products/${storeId}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData }).then(handle),
  updateProduct: (storeId, productId, patch, token) => fetch(`${API_BASE_URL}/api/products/${storeId}/${productId}`, { method: 'PATCH', headers: { ...jsonHeaders, Authorization: `Bearer ${token}` }, body: JSON.stringify(patch) }).then(handle),
  updateProductImage: (storeId, productId, formData, token) => fetch(`${API_BASE_URL}/api/products/${storeId}/${productId}/image`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` }, body: formData }).then(handle),
  deleteProduct: (storeId, productId, token) => fetch(`${API_BASE_URL}/api/products/${storeId}/${productId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }).then(handle),
  // Auth
  login: (email, password) => fetch(`${API_BASE_URL}/api/auth/login`, { method: 'POST', headers: jsonHeaders, body: JSON.stringify({ email, password }) }).then(handle),
  meStore: (token) => fetch(`${API_BASE_URL}/api/me/store`, { headers: { Authorization: `Bearer ${token}` } }).then(handle),
  // Users
  registerUser: (payload) => fetch(`${API_BASE_URL}/api/users/register`, { method: 'POST', headers: jsonHeaders, body: JSON.stringify(payload) }).then(handle),
  loginUser: (email, password) => fetch(`${API_BASE_URL}/api/users/login`, { method: 'POST', headers: jsonHeaders, body: JSON.stringify({ email, password }) }).then(handle),
  meUser: (token) => fetch(`${API_BASE_URL}/api/me/user`, { headers: { Authorization: `Bearer ${token}` } }).then(handle),
  meStore: (token) => fetch(`${API_BASE_URL}/api/me/store`, { headers: { Authorization: `Bearer ${token}` } }).then(handle),
  // Favorites
  addToFavorites: (productId, storeId, token) => fetch(`${API_BASE_URL}/api/favorites`, { method: 'POST', headers: { ...jsonHeaders, Authorization: `Bearer ${token}` }, body: JSON.stringify({ productId, storeId }) }).then(handle),
  removeFromFavorites: (productId, storeId, token) => fetch(`${API_BASE_URL}/api/favorites/${productId}/${storeId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }).then(handle),
  getFavorites: (token) => fetch(`${API_BASE_URL}/api/favorites`, { headers: { Authorization: `Bearer ${token}` } }).then(handle),
  // Cart
  addToCart: (productId, storeId, quantity, token) => fetch(`${API_BASE_URL}/api/cart/${productId}/${storeId}`, { method: 'POST', headers: { ...jsonHeaders, Authorization: `Bearer ${token}` }, body: JSON.stringify({ quantity }) }).then(handle),
  removeFromCart: (productId, storeId, token) => fetch(`${API_BASE_URL}/api/cart/${productId}/${storeId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }).then(handle),
  updateCartQuantity: (productId, storeId, quantity, token) => fetch(`${API_BASE_URL}/api/cart/${productId}/${storeId}`, { method: 'PUT', headers: { ...jsonHeaders, Authorization: `Bearer ${token}` }, body: JSON.stringify({ quantity }) }).then(handle),
  getCart: (token) => fetch(`${API_BASE_URL}/api/cart`, { headers: { Authorization: `Bearer ${token}` } }).then(handle),
  clearCart: (token) => fetch(`${API_BASE_URL}/api/cart`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }).then(handle),
  // Comments
  createComment: (commentData) => fetch(`${API_BASE_URL}/api/comments`, { method: 'POST', headers: jsonHeaders, body: JSON.stringify(commentData) }).then(handle),
  getComments: (productId) => fetch(`${API_BASE_URL}/api/comments/${productId}`).then(handle),
  getAllComments: (productId) => fetch(`${API_BASE_URL}/api/comments/${productId}/all`).then(handle),
  // Admin
  adminLogin: (username, password) => fetch(`${API_BASE_URL}/api/admin/login`, { method: 'POST', headers: jsonHeaders, body: JSON.stringify({ username, password }) }).then(handle),
  adminListUsers: () => {
    const adminToken = localStorage.getItem('admin_token')
    return fetch(`${API_BASE_URL}/api/admin/registered-users`, { 
      headers: { Authorization: `Bearer ${adminToken}` } 
    }).then(handle)
  },
  adminDeleteUser: (userId) => {
    const adminToken = localStorage.getItem('admin_token')
    return fetch(`${API_BASE_URL}/api/admin/registered-users/${userId}`, { 
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` } 
    }).then(handle)
  },
  adminToggleUserStatus: (userId) => {
    const adminToken = localStorage.getItem('admin_token')
    return fetch(`${API_BASE_URL}/api/admin/registered-users/${userId}/toggle`, { 
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` } 
    }).then(handle)
  },
  // Admin product operations
  adminDeleteProduct: (storeId, productId) => {
    const adminToken = localStorage.getItem('admin_token')
    return fetch(`${API_BASE_URL}/api/admin/products/${storeId}/${productId}`, { 
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` } 
    }).then(handle)
  },
}

// Görsel yolu çözücü: backend-relative yolu tam URL'ye çevirir
export const resolveImageUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path
  if (path.startsWith('/')) return `${API_BASE_URL}${path}`
  return `${API_BASE_URL}/${path}`
}



