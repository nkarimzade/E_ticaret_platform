import React, { useEffect, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import Notification from '../Components/Notification'

const AdminLayout = () => {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [notification, setNotification] = useState(null)
  const isActive = (p) => pathname === p || pathname === `/admin/${p}`

  useEffect(() => {
    const adminToken = localStorage.getItem('admin_token')
    if (!adminToken) {
      setNotification({ 
        message: 'Admin girişi tələb olunur', 
        type: 'error' 
      })
      setTimeout(() => {
        navigate('/admin/login')
      }, 2000)
    }
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    navigate('/admin/login')
  }

  const adminToken = localStorage.getItem('admin_token')
  
  if (!adminToken) {
    return (
      <div className="page">
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}
        <div className="card">
          <div className="card-body">
            <p>Admin girişi tələb olunur. Yönləndirilir...</p>
          </div>
        </div>
      </div>
    )
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
      
      <div className="card" style={{marginBottom:12}}>
        <div className="card-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Admin Panel</h2>
            <button 
              className="btn btn-danger btn-sm" 
              onClick={handleLogout}
            >
              Çıxış
            </button>
          </div>
        </div>
        <div className="card-body" style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          <Link className={`btn ${isActive('/admin')||isActive('/admin/stores')?'btn-primary':''}`} to="/admin/stores">Mağazalar & Məhsullar</Link>
          <Link className={`btn ${isActive('/admin/users')?'btn-primary':''}`} to="/admin/users">İstifadəçilər</Link>
        </div>
      </div>
      <Outlet />
    </div>
  )
}

export default AdminLayout


