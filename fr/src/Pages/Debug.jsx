import React, { useEffect, useState } from 'react'
import Notification from '../Components/Notification'

const Debug = () => {
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [activating, setActivating] = useState(false)
  const [approving, setApproving] = useState(false)
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await fetch('https://hesen.onrender.com/api/debug/stores')
        const data = await response.json()
        setStores(data)
      } catch (error) {
        console.error('Debug veri yükleme hatası:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStores()
  }, [])

  const handleActivateApproved = async () => {
    setActivating(true)
    try {
      const response = await fetch('https://hesen.onrender.com/api/debug/activate-approved', {
        method: 'POST'
      })
      const result = await response.json()
      setNotification({ message: result.message, type: 'success' })
      // Sayfayı yenile
      const storesResponse = await fetch('https://hesen.onrender.com/api/debug/stores')
      const storesData = await storesResponse.json()
      setStores(storesData)
    } catch (error) {
      setNotification({ message: 'Hata: ' + error.message, type: 'error' })
    } finally {
      setActivating(false)
    }
  }

  const handleApproveAllPending = async () => {
    setApproving(true)
    try {
      const response = await fetch('https://hesen.onrender.com/api/debug/approve-all-pending', {
        method: 'POST'
      })
      const result = await response.json()
      setNotification({ message: result.message, type: 'success' })
      // Sayfayı yenile
      const storesResponse = await fetch('https://hesen.onrender.com/api/debug/stores')
      const storesData = await storesResponse.json()
      setStores(storesData)
    } catch (error) {
      setNotification({ message: 'Hata: ' + error.message, type: 'error' })
    } finally {
      setApproving(false)
    }
  }

  if (loading) {
    return <div className="page">Yükleniyor...</div>
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
      
      <h2>Mağaza Debug Bilgileri</h2>
      <p>Bu sayfa mağazaların durumlarını ve ürün sayılarını gösterir.</p>
      <br />
      <div style={{ marginBottom: '20px', display: 'flex', gap: '12px' }}>
        <button 
          className="btn btn-primary" 
          onClick={handleActivateApproved}
          disabled={activating}
        >
          {activating ? 'Aktivləşdirilir...' : 'Onaylanmış Mağazaları Aktif Et'}
        </button>
        <button 
          className="btn btn-outline" 
          onClick={handleApproveAllPending}
          disabled={approving}
        >
          {approving ? 'Onaylanır...' : 'Tüm Pending Mağazaları Onayla'}
        </button>
      </div>
      
      <div className="cards">
        {stores.map((store) => (
          <div key={store.id} className="card">
            <div className="card-header">
              <h3>{store.name}</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span className={`badge ${store.status}`}>{store.status}</span>
                <span className={`badge ${store.active ? 'active' : 'inactive'}`}>
                  {store.active ? 'Aktiv' : 'Passiv'}
                </span>
              </div>
            </div>
            <div className="card-body">
              <div><strong>ID:</strong> {store.id}</div>
              <div><strong>Ürün sayısı:</strong> {store.productsCount}</div>
              <div><strong>Oluşturulma tarihi:</strong> {new Date(store.createdAt).toLocaleString('tr-TR')}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '24px', padding: '16px', background: '#f3f4f6', borderRadius: '12px' }}>
        <h3>Önemli Notlar:</h3>
        <ul>
          <li><strong>Status:</strong> pending, approved, rejected</li>
          <li><strong>Active:</strong> true/false - mağazanın aktif olup olmadığı</li>
          <li><strong>Ürünlerin görünmesi için:</strong> status='approved' VE active=true olmalı</li>
        </ul>
      </div>
    </div>
  )
}

export default Debug
