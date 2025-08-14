import React, { useEffect, useState } from 'react'
import { api } from '../utils/api'
import { Link } from 'react-router-dom'
import Notification from '../Components/Notification'
import ConfirmModal from '../Components/ConfirmModal'

const AdminStores = () => {
  const [stores, setStores] = useState([])
  const [selectedStore, setSelectedStore] = useState(null)
  const [q, setQ] = useState('')
  const [notification, setNotification] = useState(null)
  const [confirmModal, setConfirmModal] = useState(null)

  useEffect(() => {
    loadStores()
  }, [])

  const loadStores = async () => {
    try {
      const data = await api.listStores()
      setStores(data)
    } catch (error) {
      setNotification({ message: 'Mağazalar yüklənərkən xəta baş verdi', type: 'error' })
    }
  }

  const handleApprove = async (id) => {
    try {
      await api.approveStore(id)
      setNotification({ message: 'Mağaza uğurla təsdiqləndi!', type: 'success' })
      loadStores()
    } catch (error) {
      setNotification({ message: 'Xəta: ' + error.message, type: 'error' })
    }
  }

  const handleReject = async (id) => {
    try {
      await api.rejectStore(id)
      setNotification({ message: 'Mağaza rədd edildi!', type: 'info' })
      loadStores()
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
          loadStores()
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
          await api.adminDeleteProduct(storeId, productId)
          setNotification({ message: 'Məhsul uğurla silindi!', type: 'success' })
          setConfirmModal(null)
          loadStores()
        } catch (error) {
          setNotification({ message: 'Xəta: ' + error.message, type: 'error' })
        }
      },
      onCancel: () => setConfirmModal(null),
      confirmText: 'Sil',
      cancelText: 'Ləğv et'
    })
  }

  const filteredStores = stores.filter(store => {
    const searchTerm = q.toLowerCase()
    return (
      store.name.toLowerCase().includes(searchTerm) ||
      store.owner.toLowerCase().includes(searchTerm) ||
      store.email.toLowerCase().includes(searchTerm)
    )
  })

  const pendingStores = filteredStores.filter(s => s.status === 'pending')
  const approvedStores = filteredStores.filter(s => s.status === 'approved')
  const rejectedStores = filteredStores.filter(s => s.status === 'rejected')

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

      <div className="admin-header">
        <div className="admin-header-content">
          <Link to="/admin" className="back-button">← Geri</Link>
          <h1>Mağazalar İdarəetməsi</h1>
        </div>
        <div className="search-input">
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#6b7280" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zM10 14a4 4 0 110-8 4 4 0 010 8z"></path>
          </svg>
          <input 
            placeholder="Mağaza, sahib və ya e-poçt axtar" 
            value={q} 
            onChange={(e) => setQ(e.target.value)} 
          />
        </div>
      </div>

      {/* Gözləyən Mağazalar */}
      <div className="admin-section">
        <h2>Gözləyən Mağazalar ({pendingStores.length})</h2>
        <div className="stores-grid">
          {pendingStores.length === 0 ? (
            <div className="empty-state">Gözləyən mağaza yoxdur</div>
          ) : (
            pendingStores.map((store) => (
              <div key={store.id} className="store-card">
                <div className="store-header">
                  <h3>{store.name}</h3>
                  <span className={`status-badge ${store.status}`}>{store.status}</span>
                </div>
                <div className="store-info">
                  <p><strong>Sahib:</strong> {store.owner}</p>
                  <p><strong>E-poçt:</strong> {store.email}</p>
                  <p><strong>Telefon:</strong> {store.phone}</p>
                  {store.description && <p><strong>Təsvir:</strong> {store.description}</p>}
                </div>
                <div className="store-actions">
                  <button 
                    className="btn btn-success" 
                    onClick={() => handleApprove(store.id)}
                  >
                    Təsdiqlə
                  </button>
                  <button 
                    className="btn btn-warning" 
                    onClick={() => handleReject(store.id)}
                  >
                    Rədd et
                  </button>
                  <button 
                    className="btn btn-danger" 
                    onClick={() => handleDeleteStore(store.id)}
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Təsdiqlənmiş Mağazalar */}
      <div className="admin-section">
        <h2>Təsdiqlənmiş Mağazalar ({approvedStores.length})</h2>
        <div className="stores-grid">
          {approvedStores.length === 0 ? (
            <div className="empty-state">Təsdiqlənmiş mağaza yoxdur</div>
          ) : (
            approvedStores.map((store) => (
              <div key={store.id} className="store-card">
                <div className="store-header">
                  <h3>{store.name}</h3>
                  <span className={`status-badge ${store.active ? 'active' : 'inactive'}`}>
                    {store.active ? 'Aktiv' : 'Passiv'}
                  </span>
                </div>
                <div className="store-info">
                  <p><strong>Sahib:</strong> {store.owner}</p>
                  <p><strong>E-poçt:</strong> {store.email}</p>
                  <p><strong>Telefon:</strong> {store.phone}</p>
                  <p><strong>Məhsul sayı:</strong> {store.products?.length || 0}</p>
                </div>
                <div className="store-actions">
                  <button 
                    className="btn btn-primary" 
                    onClick={() => setSelectedStore(selectedStore?.id === store.id ? null : store)}
                  >
                    {selectedStore?.id === store.id ? 'Məhsulları gizlət' : 'Məhsulları gör'}
                  </button>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => api.toggleStore(store.id).then(loadStores)}
                  >
                    {store.active ? 'Passiv et' : 'Aktiv et'}
                  </button>
                  <button 
                    className="btn btn-danger" 
                    onClick={() => handleDeleteStore(store.id)}
                  >
                    Sil
                  </button>
                </div>

                {/* Məhsullar */}
                {selectedStore?.id === store.id && (
                  <div className="products-section">
                    <h4>Məhsullar</h4>
                    <div className="products-grid">
                      {store.products?.length === 0 ? (
                        <div className="empty-state">Məhsul yoxdur</div>
                      ) : (
                        store.products?.map((product) => (
                          <div key={product.id} className="admin-product-card">
                            {product.image && (
                              <img 
                                src={product.image} 
                                alt={product.name} 
                                className="admin-product-image"
                              />
                            )}
                            <div className="admin-product-info">
                              <h5>{product.name}</h5>
                              <p><strong>Qiymət:</strong> {product.price} AZN</p>
                              <p><strong>Stok:</strong> {product.stock}</p>
                            </div>
                            <button 
                              className="btn btn-danger btn-sm" 
                              onClick={() => handleDeleteProduct(store.id, product.id)}
                            >
                              Sil
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Rədd edilmiş Mağazalar */}
      <div className="admin-section">
        <h2>Rədd edilmiş Mağazalar ({rejectedStores.length})</h2>
        <div className="stores-grid">
          {rejectedStores.length === 0 ? (
            <div className="empty-state">Rədd edilmiş mağaza yoxdur</div>
          ) : (
            rejectedStores.map((store) => (
              <div key={store.id} className="store-card">
                <div className="store-header">
                  <h3>{store.name}</h3>
                  <span className={`status-badge ${store.status}`}>{store.status}</span>
                </div>
                <div className="store-info">
                  <p><strong>Sahib:</strong> {store.owner}</p>
                  <p><strong>E-poçt:</strong> {store.email}</p>
                  <p><strong>Telefon:</strong> {store.phone}</p>
                </div>
                <div className="store-actions">
                  <button 
                    className="btn btn-danger" 
                    onClick={() => handleDeleteStore(store.id)}
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminStores
