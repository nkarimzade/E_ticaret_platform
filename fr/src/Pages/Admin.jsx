import React, { useEffect, useState } from 'react'
import { api } from '../utils/api'
import { Link } from 'react-router-dom'
import Notification from '../Components/Notification'

const Admin = () => {
  const [stats, setStats] = useState({
    totalStores: 0,
    pendingStores: 0,
    totalUsers: 0,
    totalProducts: 0
  })
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const stores = await api.listStores()
      const users = await api.adminListUsers()
      
      const totalStores = stores.length
      const pendingStores = stores.filter(s => s.status === 'pending').length
      const totalUsers = users.length
      const totalProducts = stores.reduce((sum, store) => sum + (store.products?.length || 0), 0)
      
      setStats({
        totalStores,
        pendingStores,
        totalUsers,
        totalProducts
      })
    } catch (error) {
      console.error('Stats yüklenemedi:', error)
    }
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

      <div className="admin-dashboard">
        <div className="admin-header">
          <h1>Admin Panel</h1>
          <p>Heshop sistemini idarə edin</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🏪</div>
            <div className="stat-content">
              <h3>{stats.totalStores}</h3>
              <p>Ümumi Mağaza</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <h3>{stats.pendingStores}</h3>
              <p>Gözləyən Mağaza</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>{stats.totalUsers}</h3>
              <p>Ümumi İstifadəçi</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-content">
              <h3>{stats.totalProducts}</h3>
              <p>Ümumi Məhsul</p>
            </div>
          </div>
        </div>

        <div className="admin-actions">
          <Link to="/admin/stores" className="admin-action-card">
            <div className="action-icon">🏪</div>
            <div className="action-content">
              <h3>Mağazalar</h3>
              <p>Mağazaları idarə edin, məhsulları görün və silin</p>
            </div>
            <div className="action-arrow">→</div>
          </Link>

          <Link to="/admin/users" className="admin-action-card">
            <div className="action-icon">👥</div>
            <div className="action-content">
              <h3>İstifadəçilər</h3>
              <p>Qeydiyyat olmuş istifadəçiləri idarə edin</p>
            </div>
            <div className="action-arrow">→</div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Admin


