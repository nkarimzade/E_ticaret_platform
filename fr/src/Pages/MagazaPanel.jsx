import React, { useEffect, useMemo, useState } from 'react'
import { api, resolveImageUrl } from '../utils/api'

const MagazaPanel = () => {
  const [stores, setStores] = useState([])
  const [selectedStoreId, setSelectedStoreId] = useState('')
  const [product, setProduct] = useState({ name: '', price: '', stock: '', file: null })

  const [token, setToken] = useState(localStorage.getItem('store_token') || '')
  const [me, setMe] = useState(null)
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
    if (!token) { alert('Ürün eklemek için giriş yapın'); return }
    const formData = new FormData()
    formData.append('name', product.name)
    formData.append('price', String(product.price))
    formData.append('stock', String(product.stock))
    if (product.file) formData.append('image', product.file)
    await api.addProduct(selectedStoreId, formData, token)
    setProduct({ name: '', price: '', stock: '', file: null })
    alert('Ürün eklendi')
  }

  const toggleStoreActive = () => {
    if (!currentStore) return
    api.toggleStore(currentStore._id || currentStore.id).then(() => window.location.reload())
  }

  return (
    <div className="page">
      <h2>Mağaza paneli</h2>
      <div className="card" style={{marginBottom:12}}>
        <div className="card-header">
          <h3>Daxil ol</h3>
          {token && <button className="btn" onClick={onLogout}>Çıxış et</button>}
        </div>
        {!token ? (
          <StoreLogin onLogin={(t)=>{ localStorage.setItem('store_token', t); setToken(t) }} />
        ) : (
          <div className="card-body">
            <div className="row"><strong>Hesab:</strong> {me?.email || '—'}</div>
            <div className="row"><strong>Mağaza:</strong> {me?.name || '—'}</div>
          </div>
        )}
      </div>

      {token && (
        <div className="form-row">
          <label>Mağaza seç</label>
          <select value={selectedStoreId} onChange={(e) => setSelectedStoreId(e.target.value)}>
            <option value="">Seçiniz</option>
            {stores.map((s) => (
              <option value={s._id || s.id} key={s._id || s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      )}

      {token && currentStore ? (
        <>
          <div className="card">
            <div className="card-header"><h3>{currentStore.name}</h3></div>
            <div className="card-body">
              <div className="row"><strong>Status:</strong> {currentStore.active ? 'Aktiv' : 'Passiv'}</div>
              <button className="btn btn-primary" onClick={toggleStoreActive}>{currentStore.active ? 'Passiv et' : 'Aktiv et'}</button>
            </div>
          </div>

          <h3>Məhsul əlavə et</h3>
          <form className="form" onSubmit={handleAddProduct}>
            <div className="form-row">
              <label>Məhsul adı</label>
              <input required value={product.name} onChange={(e) => setProduct({ ...product, name: e.target.value })} />
            </div>
            <div className="form-row two">
              <div>
                <label>Qiymət</label>
                <input type="number" step="0.01" required value={product.price} onChange={(e) => setProduct({ ...product, price: e.target.value })} />
              </div>
              <div>
                <label>Stok</label>
                <input type="number" required value={product.stock} onChange={(e) => setProduct({ ...product, stock: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <label>Şəkil (tək fayl)</label>
              <input type="file" accept="image/*" onChange={(e) => setProduct({ ...product, file: e.target.files?.[0] || null })} />
            </div>
            <button className="btn btn-primary" type="submit">Əlavə et</button>
          </form>

          <h3>Ürünler</h3>
          <div className="cards">
            {(currentStore.products || []).map((p) => (
              <ProductRow
                key={p._id || p.id}
                product={p}
                storeId={currentStore._id || currentStore.id}
                token={token}
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
      onLogin(resp.token)
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

const ProductRow = ({ product, storeId, token }) => {
  const [price, setPrice] = useState(product.price)
  const [stock, setStock] = useState(product.stock)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    try{
      await api.updateProduct(storeId, product._id || product.id, { price: Number(price), stock: Number(stock) }, token)
      alert('Güncellendi')
    } finally { setSaving(false) }
  }

  const remove = async () => {
    if(!window.confirm('Silinsin?')) return
    await api.deleteProduct(storeId, (product._id || product.id), token)
    window.location.reload()
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
          <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Yüklənir...' : 'Yenilə'}</button>
          <button className="btn btn-danger" onClick={remove}>Sil</button>
        </div>
      </div>
    </div>
  )
}


