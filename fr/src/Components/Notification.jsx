import React, { useEffect } from 'react'
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa'

const Notification = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle />
      case 'error':
        return <FaExclamationTriangle />
      case 'info':
        return <FaInfoCircle />
      default:
        return <FaInfoCircle />
    }
  }

  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          borderColor: '#047857'
        }
      case 'error':
        return {
          background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
          borderColor: '#B91C1C'
        }
      case 'info':
        return {
          background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
          borderColor: '#1D4ED8'
        }
      default:
        return {
          background: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
          borderColor: '#374151'
        }
    }
  }

  return (
    <div 
      className="notification"
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        padding: '16px 20px',
        borderRadius: '12px',
        color: 'white',
        border: '1px solid',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        minWidth: '300px',
        maxWidth: '400px',
        animation: 'slideInRight 0.3s ease-out',
        ...getStyles()
      }}
    >
      <div style={{ fontSize: '18px', flexShrink: 0 }}>
        {getIcon()}
      </div>
      <div style={{ flex: 1, fontSize: '14px', lineHeight: '1.4' }}>
        {message}
      </div>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          padding: '4px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.8,
          transition: 'opacity 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.opacity = '1'}
        onMouseLeave={(e) => e.target.style.opacity = '0.8'}
      >
        <FaTimes size={14} />
      </button>
    </div>
  )
}

export default Notification
