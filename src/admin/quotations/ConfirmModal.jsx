import React from 'react'

const ConfirmModal = ({
  isOpen,
  title = 'Confirm Action',
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null

  const isDanger = variant === 'danger'
  const accentColor = isDanger ? '#ef4444' : '#00e5ff'
  const accentBg = isDanger ? 'rgba(239, 68, 68, 0.12)' : 'rgba(0, 229, 255, 0.12)'
  const accentBorder = isDanger ? 'rgba(239, 68, 68, 0.35)' : 'rgba(0, 229, 255, 0.35)'
  const btnBg = isDanger ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'linear-gradient(135deg, #00e5ff 0%, #0096ff 100%)'

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.82)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onCancel}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'linear-gradient(145deg, rgba(17, 23, 38, 0.98) 0%, rgba(10, 14, 26, 0.98) 100%)',
          border: `1px solid ${accentBorder}`,
          borderRadius: '16px',
          padding: '1.75rem',
          boxShadow: `0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px ${isDanger ? 'rgba(239, 68, 68, 0.15)' : 'rgba(0, 229, 255, 0.15)'}`,
          position: 'relative',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Line */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, height: '3px',
          background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`
        }} />

        {/* Icon & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: accentBg,
            border: `1px solid ${accentBorder}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            color: accentColor,
            flexShrink: 0
          }}>
            {isDanger ? '⚠️' : 'ℹ️'}
          </div>
          <div>
            <h3 style={{
              margin: 0,
              fontSize: '1.2rem',
              color: 'white',
              fontFamily: 'Rajdhani, sans-serif',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}>
              {title}
            </h3>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Action Confirmation Required
            </div>
          </div>
        </div>

        {/* Message */}
        <p style={{
          color: 'rgba(255, 255, 255, 0.75)',
          fontSize: '0.88rem',
          lineHeight: 1.6,
          margin: '0 0 1.75rem 0',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '8px',
          padding: '0.85rem 1rem'
        }}>
          {message}
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'rgba(255, 255, 255, 0.75)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                e.currentTarget.style.color = 'white'
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)'
              }
            }}
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: '0.6rem 1.4rem',
              borderRadius: '8px',
              border: 'none',
              background: btnBg,
              color: 'white',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: `0 4px 15px ${isDanger ? 'rgba(239, 68, 68, 0.35)' : 'rgba(0, 229, 255, 0.35)'}`,
              transition: 'all 0.2s ease',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Processing…' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
