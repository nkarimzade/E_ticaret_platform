import React from 'react'
import { useOutletContext } from 'react-router-dom'

const StatCard = ({ title, value, hint }) => (
  <div className="card">
    <div className="card-header"><h3 style={{margin:0}}>{title}</h3></div>
    <div className="card-body">
      <div style={{ fontSize: 28, fontWeight: 700 }}>{value}</div>
      {hint && <div className="muted" style={{ marginTop: 6 }}>{hint}</div>}
    </div>
  </div>
)

const PanelDashboard = () => {
  const { me, currentStore } = useOutletContext()

  return (
    <div className="page" style={{ display: 'grid', gap: 16 }}>
      <h2>Dashboard</h2>
      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
        <StatCard title="Toplam Ürün" value={(currentStore?.products || []).length} />
      </div>

      <div className="card">
        <div className="card-header"><h3 style={{margin:0}}>Hızlı Aksiyonlar</h3></div>
        <div className="card-body" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <a className="btn btn-primary" href="/urun-ekle">Yeni Ürün Ekle</a>
          <a className="btn" href={`/magaza/${currentStore?._id || currentStore?.id}`}>Mağazayı Görüntüle</a>
        </div>
      </div>
    </div>
  )
}

export default PanelDashboard


