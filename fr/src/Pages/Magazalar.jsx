import React, { useEffect, useMemo, useState } from 'react'
import { api } from '../utils/api'
import { Link } from 'react-router-dom'

const Magazalar = () => {
  const [approved, setApproved] = useState([])
  const [q, setQ] = useState('')
  useEffect(() => { (async () => setApproved(await api.listApprovedStores()))() }, [])
  const filtered = useMemo(() => approved.filter(s => s.name.toLowerCase().includes(q.toLowerCase()) || (s.owner||'').toLowerCase().includes(q.toLowerCase())), [approved, q])

  return (
    <div className="page">
      <div className="store-list-header">
        <h2>Təsdiqlənmiş mağazalar</h2>
        <div className="search-input">
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#6b7280" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zM10 14a4 4 0 110-8 4 4 0 010 8z"></path></svg>
          <input placeholder="Mağaza və ya sahibi axtar" value={q} onChange={(e)=>setQ(e.target.value)} />
        </div>
      </div>

      <div className="store-grid">
        {filtered.length === 0 && <div className="muted">Mağaza tapılmadı.</div>}
        {filtered.map((s) => (
          <div className="card store-card" key={s._id || s.id}>
            <div className="card-header"><h3>{s.name}</h3><span className={`badge ${s.active?'active':'inactive'}`}>{s.active ? 'Aktiv' : 'Passiv'}</span></div>
            <div className="card-body">
              <div className="meta"><span>Sahib: {s.owner}</span></div>
              <p className="desc">{s.description || '—'}</p>
              <div className="card-actions">
                <Link className="btn btn-outline visit-btn" to={`/magaza/${s._id || s.id}`}>Mağazaya keç</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Magazalar