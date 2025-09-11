import React, { useEffect, useMemo, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { api } from '../utils/api'

const PanelLayout = () => {
  const navigate = useNavigate()
  const [token, setToken] = useState(localStorage.getItem('store_token') || '')
  const [me, setMe] = useState(null)
  const [stores, setStores] = useState([])
  const [selectedStoreId, setSelectedStoreId] = useState('')

  useEffect(() => {
    (async () => {
      if (!token) {
        navigate('/magaza-giris')
        return
      }
      try {
        const mine = await api.meStore(token)
        setMe(mine)
        setStores([mine])
        setSelectedStoreId(mine._id || mine.id)
      } catch (e) {
        console.error(e)
        navigate('/magaza-giris')
      }
    })()
  }, [token])

  const currentStore = useMemo(() => stores.find((s) => (s._id || s.id) === selectedStoreId), [stores, selectedStoreId])

  const onLogout = () => {
    localStorage.removeItem('store_token')
    setToken('')
    setMe(null)
    setStores([])
    setSelectedStoreId('')
    navigate('/magaza-giris')
  }

  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="page panel-layout">
      <div className="panel-mobile-bar">
        <h2 style={{margin:0}}>Mağaza Paneli</h2>
        <button className="btn" onClick={()=>setSidebarOpen((s)=>!s)}>{sidebarOpen ? 'Menüyü Gizle' : 'Menüyü Göster'}</button>
      </div>
      <aside className={`card panel-sidebar ${sidebarOpen ? '' : 'is-hidden'}`}>
        <div className="panel-sidebar-inner">
          <div className="brand" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        
            <small>{me?.name || ''}</small>
          </div>
          <nav className="panel-nav">
            <NavLink to="." end className={({ isActive }) => `btn ${isActive ? 'btn-primary' : ''}`}>Dashboard</NavLink>
            <NavLink to="urunler" className={({ isActive }) => `btn ${isActive ? 'btn-primary' : ''}`}>Ürünler</NavLink>
            <NavLink to="ayarlar" className={({ isActive }) => `btn ${isActive ? 'btn-primary' : ''}`}>Ayarlar</NavLink>
            <button className="btn btn-danger" onClick={onLogout} style={{ marginTop: 8 }}>Çıkış</button>
          </nav>
        </div>
      </aside>
      <main>
        <Outlet context={{ token, me, currentStore }} />
      </main>
    </div>
  )
}

export default PanelLayout


