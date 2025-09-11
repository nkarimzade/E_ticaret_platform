import React, { useEffect, useRef, useState } from 'react'

// Minimal, material-benzeri snackbar: alt-orta, pill biçimli, opsiyonel aksiyon düğmesi
const Snackbar = ({
  message,
  type = 'default', // default | success | error | info
  duration = 2500,
  actionLabel,
  onAction,
  onClose,
}) => {
  const [open, setOpen] = useState(true)
  const timerRef = useRef(null)

  useEffect(() => {
    if (duration > 0) {
      timerRef.current = setTimeout(() => {
        setOpen(false)
        onClose && onClose()
      }, duration)
      return () => clearTimeout(timerRef.current)
    }
  }, [duration, onClose])

  const palette = {
    default: { bg: 'rgba(17,24,39,.9)', fg: '#fff' },
    success: { bg: 'rgba(16,185,129,.95)', fg: '#0b3b2f' },
    error: { bg: 'rgba(239,68,68,.95)', fg: '#3b0d0d' },
    info: { bg: 'rgba(59,130,246,.95)', fg: '#0b2244' },
  }[type] || { bg: 'rgba(17,24,39,.9)', fg: '#fff' }

  if (!open) return null

  return (
    <div
      className="snackbar"
      style={{
        position: 'fixed',
        left: '50%',
        bottom: 20,
        transform: 'translateX(-50%)',
        zIndex: 10000,
        background: palette.bg,
        color: '#fff',
        borderRadius: 999,
        padding: '10px 14px',
        boxShadow: '0 12px 30px rgba(0,0,0,.25)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        maxWidth: 560,
        width: 'fit-content',
        animation: 'slideInUp .25s ease-out',
        backdropFilter: 'saturate(120%) blur(6px)'
      }}
    >
      <span style={{ lineHeight: 1.2, fontSize: 14, padding: '2px 4px' }}>{message}</span>
      {actionLabel && (
        <button
          className="snackbar-action"
          onClick={() => { onAction && onAction(); setOpen(false); onClose && onClose() }}
          style={{
            marginLeft: 6,
            background: 'rgba(255,255,255,.14)',
            color: '#fff',
            border: 'none',
            borderRadius: 999,
            padding: '6px 10px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export default Snackbar


