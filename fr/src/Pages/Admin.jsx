import React, { useEffect, useMemo, useState } from 'react'
import { api } from '../utils/api'

const Admin = () => {
  const [stores, setStores] = useState([])

  const refresh = async () => setStores(await api.listStores())

  useEffect(() => {
    refresh()
  }, [])

  const handleApprove = async (id) => { await api.approveStore(id); refresh() }
  const handleReject = async (id) => { await api.rejectStore(id); refresh() }
  const handleDeleteStore = async (id) => {
    if (!window.confirm('Mağaza silinecek. Emin misiniz?')) return
    await api.deleteStore(id)
    refresh()
  }

  const handleDeleteProduct = async (storeId, productId) => {
    if (!window.confirm('Ürün silinecek. Emin misiniz?')) return
    await api.deleteProduct(storeId, productId)
    refresh()
  }

  const pending = useMemo(() => stores.filter((s) => s.status === 'pending'), [stores])
  const approved = useMemo(() => stores.filter((s) => s.status === 'approved'), [stores])
  const rejected = useMemo(() => stores.filter((s) => s.status === 'rejected'), [stores])

  return (
    <div className="page">
      <h2>Admin Yönetim Paneli</h2>
      <p>Başvuruları yönetin, mağazaları ve ürünleri düzenleyin.</p>

      <h3>Bekleyen Başvurular</h3>
      <div className="cards">
        {pending.length === 0 && <div className="muted">Henüz bekleyen başvuru yok.</div>}
        {pending.map((s) => (
          <div key={s._id || s.id} className={`card status-${s.status}`}>
            <div className="card-header">
              <h3>{s.name}</h3>
              <span className={`badge ${s.status}`}>{s.status}</span>
            </div>
            <div className="card-body">
              <div className="row"><strong>Sahip:</strong> {s.owner}</div>
              <div className="row"><strong>E-posta:</strong> {s.email}</div>
              <div className="row"><strong>Telefon:</strong> {s.phone}</div>
              {s.description && <p className="desc">{s.description}</p>}
            </div>
            <div className="card-actions">
              <button className="btn btn-primary" onClick={() => handleApprove(s._id || s.id)}>Onayla</button>
              <button className="btn" onClick={() => handleReject(s._id || s.id)}>Reddet</button>
              <button className="btn btn-danger" onClick={() => handleDeleteStore(s._id || s.id)}>Mağazayı Sil</button>
            </div>
          </div>
        ))}
      </div>

      <h3>Onaylanan Mağazalar</h3>
      <div className="cards">
        {approved.length === 0 && <div className="muted">Henüz onaylı mağaza yok.</div>}
        {approved.map((s) => (
          <div key={s._id || s.id} className={`card status-${s.status}`}>
            <div className="card-header">
              <h3>{s.name}</h3>
              <span className={`badge ${s.active ? 'active' : 'inactive'}`}>{s.active ? 'Aktif' : 'Pasif'}</span>
            </div>
            <div className="card-body">
              <div className="row"><strong>Sahip:</strong> {s.owner}</div>
              <div className="row"><strong>E-posta:</strong> {s.email}</div>
              <div className="row"><strong>Telefon:</strong> {s.phone}</div>
              <p className="desc">{s.description || '—'}</p>
              <div style={{ marginTop: 8 }}>
                <strong>Ürünler:</strong>
                <div className="cards grid-3" style={{ marginTop: 8 }}>
                  {(s.products || []).map((p) => (
                    <div key={p._id || p.id} className="card">
                      {p.image && <img alt={p.name} src={p.image} style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 8 }} />}
                      <div className="card-header"><h4>{p.name}</h4></div>
                      <div className="card-body">
                        <div className="row">Fiyat: {p.price} ₺</div>
                        <div className="row">Stok: {p.stock}</div>
                      </div>
                      <div className="card-actions">
                        <button className="btn btn-danger" onClick={() => handleDeleteProduct(s._id || s.id, p._id || p.id)}>Ürünü Sil</button>
                      </div>
                    </div>
                  ))}
                  {(s.products || []).length === 0 && <div className="muted">Ürün yok.</div>}
                </div>
              </div>
            </div>
            <div className="card-actions">
              <button className="btn" onClick={() => api.toggleStore(s._id || s.id).then(refresh)}>{s.active ? 'Pasifleştir' : 'Aktifleştir'}</button>
              <button className="btn btn-danger" onClick={() => handleDeleteStore(s._id || s.id)}>Mağazayı Sil</button>
            </div>
          </div>
        ))}
      </div>
      <h3>Reddedilen Başvurular</h3>
      <div className="cards">
        {rejected.length === 0 && <div className="muted">Reddedilen başvuru yok.</div>}
        {rejected.map((s) => (
          <div key={s._id || s.id} className={`card status-${s.status}`}>
            <div className="card-header">
              <h3>{s.name}</h3>
              <span className={`badge ${s.status}`}>{s.status}</span>
            </div>
            <div className="card-actions">
              <button className="btn btn-danger" onClick={() => handleDeleteStore(s._id || s.id)}>Mağazayı Sil</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Admin


