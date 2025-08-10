import React from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'

const AdminLayout = () => {
  const { pathname } = useLocation()
  const isActive = (p) => pathname === p || pathname === `/admin/${p}`
  return (
    <div className="page">
      <div className="card" style={{marginBottom:12}}>
        <div className="card-header"><h2>Admin</h2></div>
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


