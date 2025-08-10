import React, { useEffect, useMemo, useState } from 'react'
import { api } from '../utils/api'
import Notification from '../Components/Notification'
import ConfirmModal from '../Components/ConfirmModal'

const Admin = () => {
  const [stores, setStores] = useState([])
  const [q, setQ] = useState('')
  const [notification, setNotification] = useState(null)
  const [confirmModal, setConfirmModal] = useState(null)

  const refresh = async () => setStores(await api.listStores())

  useEffect(() => {
    refresh()
  }, [])

  const handleApprove = async (id) => { 
    try {
      await api.approveStore(id)
      setNotification({ message: 'Mağaza uğurla təsdiqləndi!', type: 'success' })
      refresh()
    } catch (error) {
      setNotification({ message: 'Xəta: ' + error.message, type: 'error' })
    }
  }
  
  const handleReject = async (id) => { 
    try {
      await api.rejectStore(id)
      setNotification({ message: 'Mağaza rədd edildi!', type: 'info' })
      refresh()
    } catch (error) {
      setNotification({ message: 'Xəta: ' + error.message, type: 'error' })
    }
  }
  
  const handleDeleteStore = async (id) => {
    setConfirmModal({
      title: 'Mağazanı sil',
      message: 'Bu mağaza həmişəlik silinəcək. Bu əməliyyatı geri ala bilməzsiniz. Davam etmək istəyirsiniz?',
      onConfirm: async () => {
        try {
          await api.deleteStore(id)
          setNotification({ message: 'Mağaza uğurla silindi!', type: 'success' })
          setConfirmModal(null)
          refresh()
        } catch (error) {
          setNotification({ message: 'Xəta: ' + error.message, type: 'error' })
        }
      },
      onCancel: () => setConfirmModal(null),
      confirmText: 'Sil',
      cancelText: 'Ləğv et'
    })
  }

  const handleDeleteProduct = async (storeId, productId) => {
    setConfirmModal({
      title: 'Məhsulu sil',
      message: 'Bu məhsul həmişəlik silinəcək. Bu əməliyyatı geri ala bilməzsiniz. Davam etmək istəyirsiniz?',
      onConfirm: async () => {
        try {
          await api.deleteProduct(storeId, productId)
          setNotification({ message: 'Məhsul uğurla silindi!', type: 'success' })
          setConfirmModal(null)
          refresh()
        } catch (error) {
          setNotification({ message: 'Xəta: ' + error.message, type: 'error' })
        }
      },
      onCancel: () => setConfirmModal(null),
      confirmText: 'Sil',
      cancelText: 'Ləğv et'
    })
  }

  const textMatch = (s) => {
    const t = q.toLowerCase()
    return (
      s.name.toLowerCase().includes(t) ||
      (s.owner || '').toLowerCase().includes(t) ||
      (s.email || '').toLowerCase().includes(t)
    )
  }
  const pending = useMemo(() => stores.filter((s) => s.status === 'pending' && textMatch(s)), [stores, q])
  const approved = useMemo(() => stores.filter((s) => s.status === 'approved' && textMatch(s)), [stores, q])
  const rejected = useMemo(() => stores.filter((s) => s.status === 'rejected' && textMatch(s)), [stores, q])

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
      
      <div className="store-list-header" style={{marginTop:0}}>
        <h2>Yönetim paneli</h2>
        <div className="search-input">
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#6b7280" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zM10 14a4 4 0 110-8 4 4 0 010 8z"></path></svg>
          <input placeholder="Mağaza, sahib və ya e-poçt axtar" value={q} onChange={(e)=>setQ(e.target.value)} />
        </div>
      </div>

      <h3>Gözləyən müraciətlər</h3>
      <div className="cards">
        {pending.length === 0 && <div className="muted">Gözləyən müraciət yoxdur.</div>}
        {pending.map((s) => (
          <div key={s._id || s.id} className={`card status-${s.status}`}>
            <div className="card-header">
              <h3>{s.name}</h3>
              <span className={`badge ${s.status}`}>{s.status}</span>
            </div>
            <div className="card-body">
              <div className="row"><strong>Sahib:</strong> {s.owner}</div>
              <div className="row"><strong>E-poçt:</strong> {s.email}</div>
              <div className="row"><strong>Telefon:</strong> {s.phone}</div>
              {s.description && <p className="desc">{s.description}</p>}
            </div>
            <div className="card-actions">
              <button className="btn btn-primary" onClick={() => handleApprove(s._id || s.id)}>Təsdiqlə</button>
              <button className="btn" onClick={() => handleReject(s._id || s.id)}>Rədd et</button>
              <button className="btn btn-danger" onClick={() => handleDeleteStore(s._id || s.id)}>Mağazanı sil</button>
            </div>
          </div>
        ))}
      </div>

      <h3>Təsdiqlənən mağazalar</h3>
      <div className="cards">
        {approved.length === 0 && <div className="muted">Hələ təsdiqlənmiş mağaza yoxdur.</div>}
        {approved.map((s) => (
          <div key={s._id || s.id} className={`card status-${s.status}`}>
            <div className="card-header">
              <h3>{s.name}</h3>
              <span className={`badge ${s.active ? 'active' : 'inactive'}`}>{s.active ? 'Aktiv' : 'Passiv'}</span>
            </div>
            <div className="card-body">
              <div className="row"><strong>Sahib:</strong> {s.owner}</div>
              <div className="row"><strong>E-poçt:</strong> {s.email}</div>
              <div className="row"><strong>Telefon:</strong> {s.phone}</div>
              <p className="desc">{s.description || '—'}</p>
              <div style={{ marginTop: 8 }}>
                <strong>Məhsullar:</strong>
                <div className="cards grid-3" style={{ marginTop: 8 }}>
                  {(s.products || []).map((p) => (
                    <div key={p._id || p.id} className="card">
                      {p.image && <img alt={p.name} src={p.image} style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 8 }} />}
                      <div className="card-header"><h4>{p.name}</h4></div>
                      <div className="card-body">
                        <div className="row">Qiymət: {p.price} AZN</div>
                        <div className="row">Stok: {p.stock}</div>
                      </div>
                      <div className="card-actions">
                        <button className="btn btn-danger" onClick={() => handleDeleteProduct(s._id || s.id, p._id || p.id)}>Məhsulu sil</button>
                      </div>
                    </div>
                  ))}
                  {(s.products || []).length === 0 && <div className="muted">Məhsul yoxdur.</div>}
                </div>
              </div>
            </div>
            <div className="card-actions">
              <button className="btn" onClick={() => api.toggleStore(s._id || s.id).then(refresh)}>{s.active ? 'Passiv et' : 'Aktiv et'}</button>
              <button className="btn btn-danger" onClick={() => handleDeleteStore(s._id || s.id)}>Mağazanı sil</button>
            </div>
          </div>
        ))}
      </div>
      <h3>Rədd edilən müraciətlər</h3>
      <div className="cards">
        {rejected.length === 0 && <div className="muted">Rədd edilən yoxdur.</div>}
        {rejected.map((s) => (
          <div key={s._id || s.id} className={`card status-${s.status}`}>
            <div className="card-header">
              <h3>{s.name}</h3>
              <span className={`badge ${s.status}`}>{s.status}</span>
            </div>
            <div className="card-actions">
              <button className="btn btn-danger" onClick={() => handleDeleteStore(s._id || s.id)}>Mağazanı sil</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Admin


