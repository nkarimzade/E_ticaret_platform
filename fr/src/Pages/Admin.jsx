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
  const [pendingStores, setPendingStores] = useState([])
  const [recentUsers, setRecentUsers] = useState([])

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const stores = await api.listStores()
      const users = await api.adminListUsers()
      
      const totalStores = stores.length
      const pendingList = stores.filter(s => s.status === 'pending')
      const pendingStores = pendingList.length
      const totalUsers = users.length
      const totalProducts = stores.reduce((sum, store) => sum + (store.products?.length || 0), 0)
      
      setStats({
        totalStores,
        pendingStores,
        totalUsers,
        totalProducts
      })

      // Son listeler
      setPendingStores(pendingList.slice(0, 5))
      setRecentUsers([...users].sort((a,b)=> new Date(b.createdAt||0)-new Date(a.createdAt||0)).slice(0,5))
    } catch (error) {
      console.error('Stats yüklenemedi:', error)
    }
  }

  const approve = async (id) => {
    try{
      await api.approveStore(id)
      setNotification({ message: 'Mağaza onaylandı', type: 'success' })
      loadStats()
    }catch(e){
      setNotification({ message: 'Onaylama başarısız', type: 'error' })
    }
  }

  const reject = async (id) => {
    try{
      await api.rejectStore(id)
      setNotification({ message: 'Mağaza reddedildi', type: 'success' })
      loadStats()
    }catch(e){
      setNotification({ message: 'Reddetme başarısız', type: 'error' })
    }
  }

  return (
    <div className="page admin-page">
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
          <p><img src="/bavılogo.png" alt="logo" style={{ height: '24px', verticalAlign: 'middle' }} /> sistemini idarə edin</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-content">
              <h3>{stats.totalStores}</h3>
              <p>Ümumi Mağaza</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-content">
              <h3>{stats.pendingStores}</h3>
              <p>Gözləyən Mağaza</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-content">
              <h3>{stats.totalUsers}</h3>
              <p>Ümumi İstifadəçi</p>
            </div>
          </div>
          
          <div className="stat-card">
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

        {/* Bekleyen mağazalar */}
        <div className="card" style={{marginTop:20}}>
          <div className="card-header">
            <h3 style={{margin:0}}>Gözləyən Mağazalar</h3>
            <Link to="/admin/stores" className="btn btn-outline">Tümünü Gör</Link>
          </div>
          <div className="card-body">
            {pendingStores.length === 0 ? (
              <div className="muted">Bekleyen mağaza yoxdur.</div>
            ) : (
              <div className="cards">
                {pendingStores.map((s)=> (
                  <div key={s._id || s.id} className="card" style={{margin:0}}>
                    <div className="card-header"><h3 style={{margin:0}}>{s.name}</h3><span className="badge pending">Bekliyor</span></div>
                    <div className="card-body" style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap'}}>
                      <div className="muted">Məhsul: {(s.products||[]).length}</div>
                      <div style={{display:'flex',gap:8}}>
                        <button className="btn btn-outline" onClick={()=>approve(s._id || s.id)}>Onayla</button>
                        <button className="btn btn-danger" onClick={()=>reject(s._id || s.id)}>Rədd et</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Son kullanıcılar */}
        <div className="card" style={{marginTop:20}}>
          <div className="card-header"><h3 style={{margin:0}}>Son İstifadəçilər</h3></div>
          <div className="card-body">
            {recentUsers.length === 0 ? (
              <div className="muted">Hələ istifadəçi yoxdur.</div>
            ) : (
              <div style={{display:'grid',gap:8}}>
                {recentUsers.map((u)=> (
                  <div key={u._id || u.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',border:'1px solid #e5e7eb',borderRadius:12,padding:'10px 12px'}}>
                    <div style={{display:'flex',flexDirection:'column'}}>
                      <strong>{u.name || u.email || '—'}</strong>
                      <span className="muted" style={{fontSize:12}}>{u.email}</span>
                    </div>
                    <span className="badge active">Aktiv</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Admin


