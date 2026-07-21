import React, { useState, useEffect } from 'react'
import { supabase } from '../../config/supabaseClient'

const QSettings = () => {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .limit(1)
        .single()
      
      if (error && error.code !== 'PGRST116') throw error
      if (data) setSettings(data)
      else setSettings({
        company_name: 'Diotranics Enterprises Ltd',
        email: '', phone: '', address: '', website: '',
        kra_pin: '', vat_number: '', quotation_prefix: 'DIO-QT'
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      if (settings.id) {
        const { error } = await supabase.from('company_settings').update(settings).eq('id', settings.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('company_settings').insert([settings])
        if (error) throw error
      }
      setMessage('Settings saved successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage(`Error: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="admin-card"><div className="spinner"></div></div>

  return (
    <div className="admin-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'white' }}>Company Settings</h2>
      {message && <div style={{ padding: '1rem', background: message.includes('Error') ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', color: message.includes('Error') ? '#ef4444' : '#10b981', marginBottom: '1rem', borderRadius: '4px' }}>{message}</div>}
      
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="admin-input-group">
            <label className="admin-label">Company Name</label>
            <input type="text" className="admin-input" value={settings.company_name || ''} onChange={e => setSettings({...settings, company_name: e.target.value})} required />
          </div>
          <div className="admin-input-group">
            <label className="admin-label">Quotation Prefix</label>
            <input type="text" className="admin-input" value={settings.quotation_prefix || ''} onChange={e => setSettings({...settings, quotation_prefix: e.target.value})} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="admin-input-group">
            <label className="admin-label">Email</label>
            <input type="email" className="admin-input" value={settings.email || ''} onChange={e => setSettings({...settings, email: e.target.value})} />
          </div>
          <div className="admin-input-group">
            <label className="admin-label">Phone</label>
            <input type="text" className="admin-input" value={settings.phone || ''} onChange={e => setSettings({...settings, phone: e.target.value})} />
          </div>
        </div>

        <div className="admin-input-group">
          <label className="admin-label">Address</label>
          <textarea className="admin-input" rows="2" value={settings.address || ''} onChange={e => setSettings({...settings, address: e.target.value})}></textarea>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="admin-input-group">
            <label className="admin-label">Website</label>
            <input type="text" className="admin-input" value={settings.website || ''} onChange={e => setSettings({...settings, website: e.target.value})} />
          </div>
          <div className="admin-input-group">
            <label className="admin-label">KRA PIN</label>
            <input type="text" className="admin-input" value={settings.kra_pin || ''} onChange={e => setSettings({...settings, kra_pin: e.target.value})} />
          </div>
        </div>

        <div className="admin-input-group">
          <label className="admin-label">Bank Details (Appears on Quotation)</label>
          <textarea className="admin-input" rows="3" value={settings.bank_account || ''} onChange={e => setSettings({...settings, bank_account: e.target.value})} placeholder="Bank Name: ...&#10;Account Name: ...&#10;Account Number: ..."></textarea>
        </div>

        <div className="admin-input-group">
          <label className="admin-label">Footer Disclaimer</label>
          <input type="text" className="admin-input" value={settings.footer_disclaimer || ''} onChange={e => setSettings({...settings, footer_disclaimer: e.target.value})} />
        </div>

        <button type="submit" className="btn btn-primary btn-skew" disabled={saving}>
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </form>
    </div>
  )
}

export default QSettings
