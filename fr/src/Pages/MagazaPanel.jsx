import React, { useEffect, useMemo, useState } from 'react'
import { api, resolveImageUrl } from '../utils/api'
import { saveAuthToken } from '../utils/auth'
import Notification from '../Components/Notification'
import ConfirmModal from '../Components/ConfirmModal'

const MagazaPanel = () => {
  const [stores, setStores] = useState([])
  const [selectedStoreId, setSelectedStoreId] = useState('')
  const [product, setProduct] = useState({ name: '', price: '', stock: '', file: null })

  const [token, setToken] = useState(localStorage.getItem('store_token') || '')
  const [me, setMe] = useState(null)
  const [notification, setNotification] = useState(null)
  const [confirmModal, setConfirmModal] = useState(null)
  const onLogout = () => {
    localStorage.removeItem('store_token')
    setToken('')
    setMe(null)
    setStores([])
    setSelectedStoreId('')
  }

  useEffect(() => {
    (async () => {
      try{
        if(token){
          const mine = await api.meStore(token)
          setMe(mine)
          setStores([mine])
          setSelectedStoreId(mine._id || mine.id)
        } else {
          const data = await api.listApprovedStores()
          setStores(data)
          setSelectedStoreId(data[0]?._id || '')
        }
      }catch(e){
        console.error(e)
      }
    })()
  }, [token])

  const currentStore = useMemo(() => stores.find((s) => (s._id || s.id) === selectedStoreId), [stores, selectedStoreId])

  const handleAddProduct = async (e) => {
    e.preventDefault()
    if (!selectedStoreId) return
    if (!token) { 
      setNotification({ message: 'Ürün eklemek için giriş yapın', type: 'error' })
      return 
    }
    const formData = new FormData()
    formData.append('name', product.name)
    formData.append('price', String(product.price))
    formData.append('stock', String(product.stock))
    if (product.file) formData.append('image', product.file)
    try {
      await api.addProduct(selectedStoreId, formData, token)
      setProduct({ name: '', price: '', stock: '', file: null })
      setNotification({ message: 'Ürün uğurla əlavə edildi!', type: 'success' })
    } catch (error) {
      setNotification({ message: 'Ürün əlavə edilə bilmədi. Zəhmət olmasa yenidən cəhd edin.', type: 'error' })
    }
  }

  const toggleStoreActive = () => {
    if (!currentStore) return
    api.toggleStore(currentStore._id || currentStore.id).then(() => window.location.reload())
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
      
      {confirmModal && (
        <ConfirmModal
          isOpen={true}
          title={confirmModal.title}
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={confirmModal.onCancel}
          confirmText={confirmModal.confirmText}
          cancelText={confirmModal.cancelText}
        />
      )}
      
      <h2>Mağaza paneli</h2>
      <div className="card auth-card" style={{marginBottom:12}}>
        <div className="card-header auth-card-header">
          <h3 className="auth-card-title">{!token ? 'Daxil ol' : 'Hesab'}</h3>
          {token && <button className="btn" onClick={onLogout}>Çıxış et</button>}
        </div>
        {!token ? (
          <div className="card-body auth-card-body auth-card-body--login">
            <StoreLogin onLogin={(t, storeData)=>{ 
              saveAuthToken(t, 'store', storeData)
              setToken(t) 
            }} />
          </div>
        ) : (
          <div className="card-body auth-card-body">
            <div className="auth-meta"><span className="label">Hesab</span><span className="value">{me?.email || '—'}</span></div>
            <div className="auth-meta"><span className="label">Mağaza</span><span className="value">{me?.name || '—'}</span></div>
          </div>
        )}
      </div>

      {token && (
        <div className="form-row">
          <label>Mağaza seç</label>
            
        </div>
      )}

      {token && currentStore ? (
        <>
        <br />
          <div className="card">
            <div className="card-header"><h3>{currentStore.name}</h3></div>
            <div className="card-body">
              <div className="row"><strong>Status:</strong> {currentStore.active ? 'Aktiv' : 'Passiv'}</div> <br />
              <button className="btn btn-primary" onClick={toggleStoreActive}>{currentStore.active ? 'Passiv et' : 'Aktiv et'}</button>
            </div>
          </div>
          <br />

          <div className="card-actions">
            <a className="btn btn-primary" href="/urun-ekle">Məhsul əlavə et</a>
          </div>

          <h3>Ürünler</h3>
          <div className="cards">
            {(currentStore.products || []).map((p) => (
              <ProductRow
                key={p._id || p.id}
                product={p}
                storeId={currentStore._id || currentStore.id}
                token={token}
                onNotification={setNotification}
                onConfirmModal={setConfirmModal}
              />
            ))}
          </div>
        </>
      ) : (
        !token && <div className="muted">Zəhmət olmasa daxil olun.</div>
      )}
    </div>
  )
}

export default MagazaPanel

const StoreLogin = ({ onLogin }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try{
      const resp = await api.login(email, password)
      onLogin(resp.token, resp.store)
    }catch(err){
      setError('Daxil olmaq alınmadı')
    }finally{
      setLoading(false)
    }
  }

  return (
    <form className="form" onSubmit={submit}>
      <div className="form-row two">
        <div>
          <label>E-poçt</label>
          <input type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} />
        </div>
        <div>
          <label>Şifrə</label>
          <input type="password" required value={password} onChange={(e)=>setPassword(e.target.value)} />
        </div>
      </div>
      {error && <div className="muted">{error}</div>}
      <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Daxil olunur...' : 'Daxil ol'}</button>
    </form>
  )
}

const ProductRow = ({ product, storeId, token, onNotification, onConfirmModal }) => {
  const [price, setPrice] = useState(product.price)
  const [stock, setStock] = useState(product.stock)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    try{
      await api.updateProduct(storeId, product._id || product.id, { price: Number(price), stock: Number(stock) }, token)
      onNotification({ message: 'Məhsul uğurla yeniləndi!', type: 'success' })
    } catch (error) {
      onNotification({ message: 'Yeniləmə uğursuz oldu. Zəhmət olmasa yenidən cəhd edin.', type: 'error' })
    } finally { setSaving(false) }
  }

  const remove = async () => {
    onConfirmModal({
      title: 'Məhsulu sil',
      message: 'Bu məhsul həmişəlik silinəcək. Bu əməliyyatı geri ala bilməzsiniz. Davam etmək istəyirsiniz?',
      onConfirm: async () => {
        try {
          await api.deleteProduct(storeId, (product._id || product.id), token)
          onNotification({ message: 'Məhsul uğurla silindi!', type: 'success' })
          window.location.reload()
        } catch (error) {
          onNotification({ message: 'Silmə uğursuz oldu. Zəhmət olmasa yenidən cəhd edin.', type: 'error' })
        }
      },
      onCancel: () => {},
      confirmText: 'Sil',
      cancelText: 'Ləğv et'
    })
  }

  return (
    <div className="card">
      <div className="card-body product-row-grid">
        <div>
          {product.image && <img className="product-row-thumb" alt={product.name} src={resolveImageUrl(product.image)} />}
        </div>
        <div className="product-row-fields">
          <div>
            <label>Məhsul</label>
            <input value={product.name} disabled />
          </div>
          <div>
            <label>Qiymət</label>
            <input type="number" value={price} onChange={(e)=>setPrice(e.target.value)} />
          </div>
          <div>
            <label>Stok</label>
            <input type="number" value={stock} onChange={(e)=>setStock(e.target.value)} />
          </div>
        </div>
        <div className="product-row-actions">
          <div style={{display:'flex',gap:8}}>
            <a className="btn" href={`/urun-duzenle/${storeId}/${product._id || product.id}`}>Detaylı yenilə</a>
            <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Yüklənir...' : 'Yenilə'}</button>
          </div>
          <button className="btn btn-danger" onClick={remove}>Sil</button>
        </div>
      </div>
    </div>
  )
}


