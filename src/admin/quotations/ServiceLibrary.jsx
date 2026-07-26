import React, { useState, useEffect } from 'react'
import { supabase } from '../../config/supabaseClient'

const CATEGORIES = ['Electrical', 'Solar', 'Borehole', 'Civil', 'Other']

const ServiceLibrary = () => {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [formData, setFormData] = useState({ name: '', category: 'Electrical', default_price: 0, default_unit: 'Item', description: '' })
  const [editData, setEditData] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')

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

  const handleEdit = (svc) => {
    setEditingId(svc.id)
    setEditData({ name: svc.name, category: svc.category, default_price: svc.default_price, default_unit: svc.default_unit, description: svc.description || '' })
  }

  const handleEditSave = async (id) => {
    try {
      const { error } = await supabase.from('qt_services').update(editData).eq('id', id)
      if (error) throw error
      setEditingId(null)
      fetchServices()
    } catch (err) { alert(err.message) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this service from the library?')) return
    setDeletingId(id)
    try {
      const { error } = await supabase.from('qt_services').delete().eq('id', id)
      if (error) throw error
      fetchServices()
    } catch (err) { alert(err.message) }
    finally { setDeletingId(null) }
  }

  const visibleCategories = ['All', ...CATEGORIES]
  const filtered = services.filter(s =>
    (categoryFilter === 'All' || s.category === categoryFilter) &&
    (s.name.toLowerCase().includes(searchTerm.toLowerCase()) || (s.description || '').toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: 'white', padding: '0.3rem 0.5rem', fontSize: '0.8rem', width: '100%' }

  return (
    <div className="admin-card">
      {/* Header */}
      <div className="qc-flex-wrap" style={{ marginBottom: '1.25rem', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.25rem', color: 'white' }}>
          Service Library <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>({filtered.length})</span>
        </h2>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <input
            type="text"
            className="admin-input"
            placeholder="Search services…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ padding: '0.4rem 0.8rem', width: '200px', fontSize: '0.8rem' }}
          />
          <button className="btn btn-primary btn-skew" onClick={() => setIsAdding(!isAdding)}>
            <span>{isAdding ? 'Cancel' : '+ Add Service'}</span>
          </button>
        </div>
      </div>

      {/* Category filter chips */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {visibleCategories.map(c => {
          const active = categoryFilter === c
          return (
            <button key={c} onClick={() => setCategoryFilter(c)} style={{
              padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 700,
              cursor: 'pointer', border: active ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
              background: active ? 'rgba(0,229,255,0.12)' : 'transparent',
              color: active ? 'var(--primary)' : 'rgba(255,255,255,0.5)',
              textTransform: 'uppercase', transition: 'all 0.2s'
            }}>{c}</button>
          )
        })}
      </div>

      {/* Add form */}
      {isAdding && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ color: 'var(--primary)', fontSize: '0.9rem', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>New Service</h3>
          <div className="qc-grid-form">
            <div className="admin-input-group"><label className="admin-label">Service Name</label><input type="text" className="admin-input" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
            <div className="admin-input-group">
              <label className="admin-label">Category</label>
              <select className="admin-input" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="qc-grid-form">
            <div className="admin-input-group"><label className="admin-label">Default Price (KES)</label><input type="number" className="admin-input" value={formData.default_price} onChange={e => setFormData({ ...formData, default_price: e.target.value })} /></div>
            <div className="admin-input-group"><label className="admin-label">Unit</label><input type="text" className="admin-input" value={formData.default_unit} onChange={e => setFormData({ ...formData, default_unit: e.target.value })} /></div>
          </div>
          <button type="submit" className="btn btn-primary btn-skew" style={{ alignSelf: 'flex-start' }}><span>Save Service</span></button>
        </form>
      )}

      {loading ? <div className="spinner"></div> : (
        <div style={{ overflowX: 'auto' }}>
          <table className="qc-table">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Service Name</th>
                <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                <th style={{ padding: '0.75rem 1rem' }}>Unit</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Default Price</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => {
                const isEditing = editingId === s.id
                return (
                  <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td data-label="Service Name" style={{ padding: '0.75rem 1rem' }}>
                      {isEditing
                        ? <input style={inputStyle} value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} />
                        : <span style={{ fontWeight: 600 }}>{s.name}</span>
                      }
                    </td>
                    <td data-label="Category" style={{ padding: '0.75rem 1rem' }}>
                      {isEditing
                        ? <select style={inputStyle} value={editData.category} onChange={e => setEditData({ ...editData, category: e.target.value })}>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        : <span style={{ color: 'var(--primary)' }}>{s.category}</span>
                      }
                    </td>
                    <td data-label="Unit" style={{ padding: '0.75rem 1rem' }}>
                      {isEditing
                        ? <input style={inputStyle} value={editData.default_unit} onChange={e => setEditData({ ...editData, default_unit: e.target.value })} />
                        : s.default_unit
                      }
                    </td>
                    <td data-label="Default Price" style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600 }}>
                      {isEditing
                        ? <input type="number" style={{ ...inputStyle, textAlign: 'right' }} value={editData.default_price} onChange={e => setEditData({ ...editData, default_price: e.target.value })} />
                        : `KES ${Number(s.default_price).toLocaleString()}`
                      }
                    </td>
                    <td data-label="Actions" style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      {isEditing ? (
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button onClick={() => handleEditSave(s.id)} className="btn btn-skew" style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)', padding: '0.3rem 0.75rem', fontSize: '0.7rem' }}><span>Save</span></button>
                          <button onClick={() => setEditingId(null)} className="btn btn-skew" style={{ background: 'rgba(255,255,255,0.05)', padding: '0.3rem 0.75rem', fontSize: '0.7rem' }}><span>Cancel</span></button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button onClick={() => handleEdit(s)} className="btn btn-skew" style={{ background: 'rgba(255,255,255,0.08)', padding: '0.3rem 0.75rem', fontSize: '0.7rem' }}><span>Edit</span></button>
                          <button
                            onClick={() => handleDelete(s.id)}
                            disabled={deletingId === s.id}
                            className="btn btn-skew"
                            style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', padding: '0.3rem 0.75rem', fontSize: '0.7rem' }}
                          >
                            <span>{deletingId === s.id ? '…' : 'Delete'}</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr><td colSpan="5" style={{ padding: '2.5rem', textAlign: 'center', opacity: 0.4 }}>No services found. Add one above.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default ServiceLibrary
