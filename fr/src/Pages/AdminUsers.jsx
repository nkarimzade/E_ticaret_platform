import React, { useEffect, useState } from 'react'
import { api } from '../utils/api'

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const refresh = async () => setUsers(await api.adminListUsers())
  useEffect(() => { refresh() }, [])

  const remove = async (id) => {
    if (!window.confirm('İstifadəçini silmək istəyirsiniz?')) return
    await api.adminDeleteUser(id)
    refresh()
  }

  return (
    <div className="page">
      <h2>İstifadəçilər</h2>
      <div className="cards">
        {users.length === 0 && <div className="muted">Hələ istifadəçi yoxdur.</div>}
        {users.map(u => (
          <div key={u.id} className="card">
            <div className="card-header"><h3>{u.owner}</h3><span className={`badge ${u.status}`}>{u.status}</span></div>
            <div className="card-body">
              <div className="row"><strong>E-poçt:</strong> {u.email}</div>
              <div className="row"><strong>Mağaza:</strong> {u.storeName}</div>
              <div className="row"><strong>Telefon:</strong> {u.phone}</div>
            </div>
            <div className="card-actions">
              <button className="btn btn-danger" onClick={() => remove(u.id)}>Sil</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminUsers


