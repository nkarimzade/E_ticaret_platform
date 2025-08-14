import React, { useEffect, useState } from 'react'
import { api } from '../utils/api'
import { Link } from 'react-router-dom'
import Notification from '../Components/Notification'
import ConfirmModal from '../Components/ConfirmModal'

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [q, setQ] = useState('')
  const [notification, setNotification] = useState(null)
  const [confirmModal, setConfirmModal] = useState(null)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const data = await api.adminListUsers()
      setUsers(data)
    } catch (error) {
      setNotification({ message: 'İstifadəçilər yüklənərkən xəta baş verdi', type: 'error' })
    }
  }

  const handleDeleteUser = async (userId) => {
    setConfirmModal({
      title: 'İstifadəçini sil',
      message: 'Bu istifadəçi həmişəlik silinəcək. Bu əməliyyatı geri ala bilməzsiniz. Davam etmək istəyirsiniz?',
      onConfirm: async () => {
        try {
          await api.adminDeleteUser(userId)
          setNotification({ message: 'İstifadəçi uğurla silindi!', type: 'success' })
          setConfirmModal(null)
          loadUsers()
        } catch (error) {
          setNotification({ message: 'Xəta: ' + error.message, type: 'error' })
        }
      },
      onCancel: () => setConfirmModal(null),
      confirmText: 'Sil',
      cancelText: 'Ləğv et'
    })
  }

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await api.adminToggleUserStatus(userId)
      setNotification({ 
        message: `İstifadəçi ${currentStatus ? 'deaktiv' : 'aktiv'} edildi!`, 
        type: 'success' 
      })
      loadUsers()
    } catch (error) {
      setNotification({ message: 'Xəta: ' + error.message, type: 'error' })
    }
  }

  const filteredUsers = users.filter(user => {
    const searchTerm = q.toLowerCase()
    return (
      user.name.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm) ||
      (user.phone && user.phone.toLowerCase().includes(searchTerm))
    )
  })

  const activeUsers = filteredUsers.filter(u => u.active)
  const inactiveUsers = filteredUsers.filter(u => !u.active)

  return (
    <div className="page">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {confirmModal && (
        <ConfirmModal
          isOpen={true}
          title={confirmModal.title}
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={confirmModal.onCancel}
          confirmText={confirmModal.confirmText}
          cancelText={confirmModal.cancelText}
        />
      )}

      <div className="admin-header">
        <div className="admin-header-content">
          <Link to="/admin" className="back-button">← Geri</Link>
          <h1>İstifadəçilər İdarəetməsi</h1>
        </div>
        <div className="search-input">
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#6b7280" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zM10 14a4 4 0 110-8 4 4 0 010 8z"></path>
          </svg>
          <input 
            placeholder="Ad, e-poçt və ya telefon axtar" 
            value={q} 
            onChange={(e) => setQ(e.target.value)} 
          />
        </div>
      </div>

      {/* Aktiv İstifadəçilər */}
      <div className="admin-section">
        <h2>Aktiv İstifadəçilər ({activeUsers.length})</h2>
        <div className="users-grid">
          {activeUsers.length === 0 ? (
            <div className="empty-state">Aktiv istifadəçi yoxdur</div>
          ) : (
            activeUsers.map((user) => (
              <div key={user.id} className="user-card">
                <div className="user-header">
                  <h3>{user.name}</h3>
                  <span className={`status-badge ${user.active ? 'active' : 'inactive'}`}>
                    {user.active ? 'Aktiv' : 'Deaktiv'}
                  </span>
                </div>
                <div className="user-info">
                  <p><strong>E-poçt:</strong> {user.email}</p>
                  {user.phone && <p><strong>Telefon:</strong> {user.phone}</p>}
                  <p><strong>Qeydiyyat tarixi:</strong> {new Date(user.createdAt).toLocaleDateString('az-AZ')}</p>
                  <p><strong>Favori sayı:</strong> {user.favorites?.length || 0}</p>
                </div>
                <div className="user-actions">
                  <button 
                    className="btn btn-warning" 
                    onClick={() => handleToggleUserStatus(user.id, user.active)}
                  >
                    Deaktiv et
                  </button>
                  <button 
                    className="btn btn-danger" 
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Deaktiv İstifadəçilər */}
      <div className="admin-section">
        <h2>Deaktiv İstifadəçilər ({inactiveUsers.length})</h2>
        <div className="users-grid">
          {inactiveUsers.length === 0 ? (
            <div className="empty-state">Deaktiv istifadəçi yoxdur</div>
          ) : (
            inactiveUsers.map((user) => (
              <div key={user.id} className="user-card">
                <div className="user-header">
                  <h3>{user.name}</h3>
                  <span className={`status-badge ${user.active ? 'active' : 'inactive'}`}>
                    {user.active ? 'Aktiv' : 'Deaktiv'}
                  </span>
                </div>
                <div className="user-info">
                  <p><strong>E-poçt:</strong> {user.email}</p>
                  {user.phone && <p><strong>Telefon:</strong> {user.phone}</p>}
                  <p><strong>Qeydiyyat tarixi:</strong> {new Date(user.createdAt).toLocaleDateString('az-AZ')}</p>
                  <p><strong>Favori sayı:</strong> {user.favorites?.length || 0}</p>
                </div>
                <div className="user-actions">
                  <button 
                    className="btn btn-success" 
                    onClick={() => handleToggleUserStatus(user.id, user.active)}
                  >
                    Aktiv et
                  </button>
                  <button 
                    className="btn btn-danger" 
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminUsers


