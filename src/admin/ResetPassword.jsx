import React, { useState, useEffect } from 'react'
import { supabase } from '../config/supabaseClient'
import { useNavigate } from 'react-router-dom'
import '../styles/admin.css'

/**
 * ResetPassword page
 * Supabase redirects here after the user clicks the reset link in their email.
 * The URL will contain a token which Supabase handles automatically via the
 * onAuthStateChange SIGNED_IN event triggered by the URL hash.
 */
const ResetPassword = () => {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [done, setDone] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Supabase automatically exchanges the token in the URL hash for a session.
    // We listen for the PASSWORD_RECOVERY event to know when it's ready.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setSessionReady(true)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleReset = async (e) => {
    e.preventDefault()
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setDone(true)
      setTimeout(() => navigate('/admin/dashboard'), 2500)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-layout" style={{ justifyContent: 'center', alignItems: 'center', padding: '2rem', minHeight: '100vh', flexDirection: 'column' }}>
      <div className="admin-card" style={{ width: '100%', maxWidth: '420px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: 'linear-gradient(90deg, var(--primary), var(--secondary))' }}></div>

        {done ? (
          /* ── SUCCESS ── */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1.25rem', padding: '1rem 0' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" width="28" height="28">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h2 style={{ color: 'white', fontSize: '1.3rem' }}>Password Updated!</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', lineHeight: 1.6 }}>
              Your password has been changed successfully.<br />Redirecting you to the dashboard...
            </p>
            <div style={{ width: '100%', height: '3px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', overflow: 'hidden', marginTop: '0.5rem' }}>
              <div style={{ height: '100%', background: 'var(--primary)', width: '100%', animation: 'none', transition: 'width 2.4s linear', borderRadius: '99px' }}></div>
            </div>
          </div>
        ) : (
          /* ── FORM ── */
          <>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" width="28" height="28">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <h1 style={{ fontSize: '1.4rem', color: 'white', letterSpacing: '0.05em' }}>Set New Password</h1>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', textAlign: 'center', marginTop: '0.5rem', lineHeight: 1.5 }}>
                Choose a strong password for your admin account.
              </p>
            </div>

            {!sessionReady && (
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', textAlign: 'center', marginBottom: '1.5rem' }}>
                <div className="spinner" style={{ margin: '0 auto 0.75rem' }}></div>
                Verifying reset link...
              </div>
            )}

            <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', opacity: sessionReady ? 1 : 0.4, pointerEvents: sessionReady ? 'auto' : 'none', transition: 'opacity 0.3s' }}>
              <div className="admin-input-group">
                <label className="admin-label">New Password</label>
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
                    required
                    minLength={8}
                    className="admin-input"
                    style={{ width: '100%', paddingLeft: '3rem' }}
                    placeholder="Min. 8 characters"
                  />
                </div>
              </div>

              <div className="admin-input-group">
                <label className="admin-label">Confirm New Password</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" width="16" height="16">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </div>
                  <input
                    type="password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    required
                    className="admin-input"
                    style={{ width: '100%', paddingLeft: '3rem', borderColor: confirm && password !== confirm ? 'rgba(248,113,113,0.5)' : '' }}
                    placeholder="Repeat password"
                  />
                </div>
                {confirm && password !== confirm && (
                  <div style={{ color: '#f87171', fontSize: '0.7rem', marginTop: '0.3rem' }}>Passwords don't match</div>
                )}
              </div>

              {/* Password strength hint */}
              {password.length > 0 && (
                <div style={{ display: 'flex', gap: '4px', marginTop: '-0.5rem' }}>
                  {[1, 2, 3, 4].map(i => {
                    const strength = Math.min(4, Math.floor(password.length / 3))
                    const colors = ['#ef4444', '#f59e0b', '#3b82f6', '#34d399']
                    return (
                      <div key={i} style={{ flex: 1, height: '3px', borderRadius: '99px', background: i <= strength ? colors[strength - 1] : 'rgba(255,255,255,0.1)', transition: 'background 0.2s' }}></div>
                    )
                  })}
                </div>
              )}

              {error && (
                <div style={{ color: '#f87171', fontSize: '0.75rem', background: 'rgba(248,113,113,0.1)', padding: '0.75rem', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '4px' }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading || !sessionReady} className="btn btn-primary btn-skew" style={{ width: '100%', marginTop: '0.5rem' }}>
                <span>{loading ? 'Updating...' : 'Update Password'}</span>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default ResetPassword
