import React, { useState } from 'react'
import { supabase } from '../config/supabaseClient'
import { useNavigate } from 'react-router-dom'
import '../styles/admin.css'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [mode, setMode] = useState('login') // 'login' | 'forgot' | 'sent'
  const [resetEmail, setResetEmail] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      })
      if (error) throw error
      setMode('sent')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const LockIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" width="28" height="28">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
  )

  const MailIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" width="28" height="28">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
      <polyline points="22,6 12,13 2,6"></polyline>
    </svg>
  )

  const CheckIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" width="28" height="28">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  )

  return (
    <div className="admin-layout" style={{ justifyContent: 'center', alignItems: 'center', padding: '2rem', minHeight: '100vh', flexDirection: 'column' }}>
      <div className="admin-card" style={{ width: '100%', maxWidth: '420px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: 'linear-gradient(90deg, var(--primary), var(--secondary))' }}></div>

        {/* ── LOGIN MODE ──────────────────────────────────── */}
        {mode === 'login' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2.5rem' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <LockIcon />
              </div>
              <h1 style={{ fontSize: '1.5rem', color: 'white', letterSpacing: '0.1em' }}>Admin Control</h1>
              <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.5rem' }}>Diotranics Management</p>
            </div>

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="admin-input-group">
                <label className="admin-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" width="16" height="16">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    className="admin-input"
                    style={{ width: '100%', paddingLeft: '3rem' }}
                    placeholder="admin@diotranics.co.ke"
                  />
                </div>
              </div>

              <div className="admin-input-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label className="admin-label" style={{ margin: 0 }}>Access Key</label>
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setResetEmail(email); setError(null) }}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.7rem', cursor: 'pointer', textDecoration: 'underline', padding: 0, letterSpacing: '0.03em' }}
                  >
                    Forgot password?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" width="16" height="16">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    className="admin-input"
                    style={{ width: '100%', paddingLeft: '3rem' }}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <div style={{ color: '#f87171', fontSize: '0.75rem', background: 'rgba(248,113,113,0.1)', padding: '0.75rem', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '4px' }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="btn btn-primary btn-skew" style={{ width: '100%', marginTop: '0.5rem' }}>
                <span>{loading ? 'Authenticating...' : 'Establish Connection'}</span>
              </button>
            </form>

            <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', opacity: 0.3 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" width="12" height="12">
                  <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
                  <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
                  <line x1="6" y1="6" x2="6.01" y2="6"></line>
                  <line x1="6" y1="18" x2="6.01" y2="18"></line>
                </svg>
                <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase' }}>Supabase Cloud</span>
              </div>
              <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase' }}>Encrypted Node</span>
            </div>
          </>
        )}

        {/* ── FORGOT PASSWORD MODE ─────────────────────────── */}
        {mode === 'forgot' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <MailIcon />
              </div>
              <h1 style={{ fontSize: '1.4rem', color: 'white', letterSpacing: '0.05em' }}>Reset Password</h1>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', textAlign: 'center', marginTop: '0.5rem', lineHeight: 1.5 }}>
                Enter your admin email address and we'll send you a link to reset your password.
              </p>
            </div>

            <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="admin-input-group">
                <label className="admin-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" width="16" height="16">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                    required
                    className="admin-input"
                    style={{ width: '100%', paddingLeft: '3rem' }}
                    placeholder="admin@diotranics.co.ke"
                  />
                </div>
              </div>

              {error && (
                <div style={{ color: '#f87171', fontSize: '0.75rem', background: 'rgba(248,113,113,0.1)', padding: '0.75rem', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '4px' }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="btn btn-primary btn-skew" style={{ width: '100%' }}>
                <span>{loading ? 'Sending...' : 'Send Reset Link'}</span>
              </button>

              <button
                type="button"
                onClick={() => { setMode('login'); setError(null) }}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', cursor: 'pointer', textAlign: 'center', textDecoration: 'underline' }}
              >
                ← Back to login
              </button>
            </form>
          </>
        )}

        {/* ── EMAIL SENT CONFIRMATION ───────────────────────── */}
        {mode === 'sent' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1.25rem', padding: '1rem 0' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckIcon />
            </div>
            <h2 style={{ color: 'white', fontSize: '1.3rem' }}>Check Your Email</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', lineHeight: 1.6 }}>
              A password reset link has been sent to<br />
              <strong style={{ color: 'rgba(255,255,255,0.8)' }}>{resetEmail}</strong>.<br /><br />
              Click the link in the email to set a new password. The link expires in 1 hour.
            </p>
            <div style={{ width: '100%', background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.15)', borderRadius: '6px', padding: '0.75rem', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
              Didn't receive it? Check your spam folder or{' '}
              <button
                onClick={() => { setMode('forgot'); setError(null) }}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.72rem', padding: 0 }}
              >
                try again
              </button>.
            </div>
            <button
              onClick={() => { setMode('login'); setError(null) }}
              className="btn btn-skew"
              style={{ background: 'rgba(255,255,255,0.07)', width: '100%', marginTop: '0.5rem' }}
            >
              <span>← Back to Login</span>
            </button>
          </div>
        )}
      </div>

      <a href="/" style={{ marginTop: '2rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Back to Website
      </a>
    </div>
  )
}

export default Login
