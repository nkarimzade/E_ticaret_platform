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
      
      <div className="panel-layout">
        <aside className="card panel-sidebar" style={{position:'sticky',top:12}}>
          <div className="panel-sidebar-inner">
            <div className="brand" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <span style={{fontWeight:700}}>Admin</span>
              <button className="btn btn-danger btn-sm" onClick={handleLogout}>Çıxış</button>
            </div>
            <nav className="panel-nav">
              <Link className={`btn ${isActive('/admin')||isActive('/admin/stores')?'btn-primary':''}`} to="/admin/stores">Mağazalar & Məhsullar</Link>
              <Link className={`btn ${isActive('/admin/users')?'btn-primary':''}`} to="/admin/users">İstifadəçilər</Link>
            </nav>
          </div>
        </aside>
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout


