import React, { useState, useEffect } from 'react'
import { supabase } from '../../config/supabaseClient'

const ServiceLibrary = () => {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState({ name: '', category: 'Electrical', default_price: 0, default_unit: 'Item', description: '' })

  const fetchServices = async () => {
    setLoading(true)
    const { data } = await supabase.from('qt_services').select('*').order('name', { ascending: true })
    setServices(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchServices() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await supabase.from('qt_services').insert([formData])
      setIsAdding(false)
      setFormData({ name: '', category: 'Electrical', default_price: 0, default_unit: 'Item', description: '' })
      fetchServices()
    } catch (err) { alert(err.message) }
  }

  return (
    <div className="admin-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: 'white' }}>Service Library</h2>
        <button className="btn btn-primary btn-skew" onClick={() => setIsAdding(!isAdding)}>
          <span>{isAdding ? 'Cancel' : '+ Add Service'}</span>
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="admin-input-group"><label className="admin-label">Service Name</label><input type="text" className="admin-input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
            <div className="admin-input-group">
              <label className="admin-label">Category</label>
              <select className="admin-input" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                <option value="Electrical">Electrical</option>
                <option value="Solar">Solar</option>
                <option value="Borehole">Borehole</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="admin-input-group"><label className="admin-label">Default Price (KES)</label><input type="number" className="admin-input" value={formData.default_price} onChange={e => setFormData({...formData, default_price: e.target.value})} /></div>
            <div className="admin-input-group"><label className="admin-label">Unit</label><input type="text" className="admin-input" value={formData.default_unit} onChange={e => setFormData({...formData, default_unit: e.target.value})} /></div>
          </div>
          <button type="submit" className="btn btn-primary btn-skew" style={{ alignSelf: 'flex-start' }}><span>Save Service</span></button>
        </form>
      )}

      {loading ? <div className="spinner"></div> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
                <th style={{ padding: '1rem' }}>Service Name</th>
                <th style={{ padding: '1rem' }}>Category</th>
                <th style={{ padding: '1rem' }}>Default Price</th>
              </tr>
            </thead>
            <tbody>
              {services.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem' }}>{s.name}</td>
                  <td style={{ padding: '1rem', color: 'var(--primary)' }}>{s.category}</td>
                  <td style={{ padding: '1rem' }}>{Number(s.default_price).toLocaleString()}</td>
                </tr>
              ))}
              {services.length === 0 && <tr><td colSpan="3" style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>No services defined yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default ServiceLibrary
