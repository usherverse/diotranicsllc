import React, { useState, useCallback, useContext, createContext } from 'react'

/* ─── Context ─── */
const ToastContext = createContext(null)

/* ─── Hook ─── */
export const useToast = () => useContext(ToastContext)

/* ─── Provider ─── */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
  }

  const colors = {
    success: { bg: 'rgba(20,50,35,0.97)', border: 'rgba(52,211,153,0.4)', text: '#34d399', icon: '#34d399' },
    error:   { bg: 'rgba(50,15,15,0.97)', border: 'rgba(239,68,68,0.4)',  text: '#f87171', icon: '#f87171' },
    info:    { bg: 'rgba(10,25,50,0.97)', border: 'rgba(0,229,255,0.4)',  text: '#00e5ff', icon: '#00e5ff' },
    warning: { bg: 'rgba(50,35,5,0.97)', border: 'rgba(251,191,36,0.4)', text: '#fbbf24', icon: '#fbbf24' },
  }

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      {/* Toast Viewport */}
      <div style={{
        position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)',
        zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.6rem',
        alignItems: 'center', pointerEvents: 'none', width: '90%', maxWidth: '420px'
      }}>
        {toasts.map(t => {
          const c = colors[t.type] || colors.info
          return (
            <div key={t.id} style={{
              background: c.bg,
              border: `1px solid ${c.border}`,
              borderRadius: '12px',
              padding: '0.85rem 1.25rem',
              width: '100%',
              display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
              boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              pointerEvents: 'all',
              animation: 'toastSlideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)',
            }}>
              {/* Icon */}
              <div style={{
                width: '22px', height: '22px', borderRadius: '50%',
                background: `${c.icon}20`, border: `1px solid ${c.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: c.icon, fontSize: '0.75rem', fontWeight: 700, flexShrink: 0, marginTop: '1px'
              }}>
                {icons[t.type]}
              </div>
              {/* Message */}
              <div style={{ flex: 1, color: 'rgba(255,255,255,0.9)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                {t.message}
              </div>
              {/* Dismiss */}
              <button onClick={() => removeToast(t.id)} style={{
                background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)',
                cursor: 'pointer', fontSize: '1rem', padding: 0, flexShrink: 0, lineHeight: 1
              }}>×</button>
            </div>
          )
        })}
      </div>
      <style>{`
        @keyframes toastSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </ToastContext.Provider>
  )
}
