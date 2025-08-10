import React from 'react'
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa'

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Təsdiqlə', cancelText = 'Ləğv et' }) => {
  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        maxWidth: '400px',
        width: '90%',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
        animation: 'slideInUp 0.3s ease-out'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>
            <FaExclamationTriangle />
          </div>
          <h3 style={{ margin: 0, color: '#1F2937' }}>{title}</h3>
        </div>
        
        <p style={{ 
          margin: '0 0 24px 0', 
          color: '#6B7280', 
          lineHeight: '1.5',
          fontSize: '14px'
        }}>
          {message}
        </p>
        
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 16px',
              border: '1px solid #D1D5DB',
              borderRadius: '8px',
              background: 'white',
              color: '#374151',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#F9FAFB'
              e.target.style.borderColor = '#9CA3AF'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'white'
              e.target.style.borderColor = '#D1D5DB'
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '10px 16px',
              border: 'none',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-1px)'
              e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = 'none'
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
