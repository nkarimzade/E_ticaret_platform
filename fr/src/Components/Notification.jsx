import React, { useEffect, useMemo, useRef, useState } from 'react'
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa'

const Notification = ({ message, type = 'success', onClose, duration = 3000, position = 'top-center' }) => {
  const [progress, setProgress] = useState(100)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (duration > 0) {
      const start = Date.now()
      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - start
        const p = Math.max(0, 100 - (elapsed / duration) * 100)
        setProgress(p)
        if (elapsed >= duration) {
          clearInterval(intervalRef.current)
          onClose()
        }
      }, 50)
      return () => clearInterval(intervalRef.current)
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
          background: 'rgba(16, 185, 129, 0.9)',
          borderColor: 'rgba(16,185,129,.6)'
        }
      case 'error':
        return {
          background: 'rgba(239, 68, 68, 0.92)',
          borderColor: 'rgba(239,68,68,.6)'
        }
      case 'info':
        return {
          background: 'rgba(59,130,246,0.92)',
          borderColor: 'rgba(59,130,246,.6)'
        }
      default:
        return {
          background: 'rgba(107,114,128,0.92)',
          borderColor: 'rgba(107,114,128,.6)'
        }
    }
  }

  const containerPosition = useMemo(() => {
    const base = { position: 'fixed', zIndex: 9999 }
    switch (position) {
      case 'top-right': return { ...base, top: 20, right: 20 }
      case 'top-left': return { ...base, top: 20, left: 20 }
      case 'bottom-left': return { ...base, bottom: 20, left: 20 }
      case 'bottom-right': return { ...base, bottom: 20, right: 20 }
      case 'top-center':
      default:
        return { ...base, top: 20, left: '50%', transform: 'translateX(-50%)' }
    }
  }, [position])

  return (
    <div 
      className="notification"
      style={{
        ...containerPosition,
        padding: '14px 16px',
        borderRadius: '14px',
        color: 'white',
        border: '1px solid',
        boxShadow: '0 12px 28px rgba(2,6,23,.18)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        minWidth: '280px',
        maxWidth: '360px',
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
          padding: '6px',
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
      {duration > 0 && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 3, background: 'rgba(255,255,255,.25)', borderBottomLeftRadius: 14, borderBottomRightRadius: 14 }}>
          <div style={{ width: progress + '%', height: '100%', background: 'rgba(255,255,255,.9)', opacity: .9, transition: 'width .05s linear' }} />
        </div>
      )}
    </div>
  )
}

export default Notification

