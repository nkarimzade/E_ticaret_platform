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
  deleteProduct: (storeId, productId, token) => fetch(`${API_BASE_URL}/api/products/${storeId}/${productId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }).then(handle),
  // Auth
  login: (email, password) => fetch(`${API_BASE_URL}/api/auth/login`, { method: 'POST', headers: jsonHeaders, body: JSON.stringify({ email, password }) }).then(handle),
  meStore: (token) => fetch(`${API_BASE_URL}/api/me/store`, { headers: { Authorization: `Bearer ${token}` } }).then(handle),
  // Admin
  adminListUsers: () => fetch(`${API_BASE_URL}/api/admin/users`).then(handle),
  adminDeleteUser: (id) => fetch(`${API_BASE_URL}/api/admin/users/${id}`, { method: 'DELETE' }).then(handle),
}

// Görsel yolu çözücü: backend-relative yolu tam URL'ye çevirir
export const resolveImageUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path
  if (path.startsWith('/')) return `${API_BASE_URL}${path}`
  return `${API_BASE_URL}/${path}`
}



