import React, { useState } from 'react'
import { useClients } from './useClients'

const ClientManager = () => {
  const { clients, loading, createClient, updateClient } = useClients()
  const [searchTerm, setSearchTerm] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  
  const [formData, setFormData] = useState({
    client_name: '', company: '', email: '', phone: '', address: '', notes: ''
  })

  const filteredClients = clients.filter(c => 
    c.client_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.company && c.company.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingClient) {
        await updateClient(editingClient.id, formData)
      } else {
        await createClient(formData)
      }
      setIsAdding(false)
      setEditingClient(null)
      setFormData({ client_name: '', company: '', email: '', phone: '', address: '', notes: '' })
    } catch (err) {
      alert("Error saving client: " + err.message)
    }
  }

  const openEdit = (client) => {
    setEditingClient(client)
    setFormData(client)
    setIsAdding(true)
  }

  return (
    <div className="admin-card">
      <div className="qc-flex-wrap" style={{ marginBottom: '1.5rem', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.25rem', color: 'white' }}>Client Database</h2>
        <button className="btn btn-primary btn-skew" onClick={() => { setIsAdding(true); setEditingClient(null); setFormData({ client_name: '', company: '', email: '', phone: '', address: '', notes: '' }) }}>
          <span>+ New Client</span>
        </button>
      </div>

      {!isAdding ? (
        <>
          <div className="admin-input-group" style={{ marginBottom: '1.5rem' }}>
            <input type="text" className="admin-input" placeholder="Search clients..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          
          {loading ? <div className="spinner"></div> : (
            <div style={{ overflowX: 'auto' }}>
              <table className="qc-table">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '1rem' }}>Name</th>
                    <th style={{ padding: '1rem' }}>Company</th>
                    <th style={{ padding: '1rem' }}>Contact</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map(client => (
                    <tr key={client.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td data-label="Name" style={{ padding: '1rem' }}>{client.client_name}</td>
                      <td data-label="Company" style={{ padding: '1rem' }}>{client.company || '-'}</td>
                      <td data-label="Contact" style={{ padding: '1rem' }}>
                        <div>{client.email}</div>
                        <div style={{ opacity: 0.6 }}>{client.phone}</div>
                      </td>
                      <td data-label="Actions" style={{ padding: '1rem', textAlign: 'right' }}>
                        <button onClick={() => openEdit(client)} className="btn btn-skew" style={{ background: 'rgba(255,255,255,0.1)', padding: '0.4rem 0.8rem', fontSize: '0.7rem' }}><span>Edit</span></button>
                      </td>
                    </tr>
                  ))}
                  {filteredClients.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>No clients found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="qc-grid-form">
            <div className="admin-input-group"><label className="admin-label">Full Name</label><input type="text" className="admin-input" required value={formData.client_name} onChange={e => setFormData({...formData, client_name: e.target.value})} /></div>
            <div className="admin-input-group"><label className="admin-label">Company (Optional)</label><input type="text" className="admin-input" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} /></div>
          </div>
          <div className="qc-grid-form">
            <div className="admin-input-group"><label className="admin-label">Email</label><input type="email" className="admin-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
            <div className="admin-input-group"><label className="admin-label">Phone</label><input type="text" className="admin-input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
          </div>
          <div className="admin-input-group"><label className="admin-label">Address</label><input type="text" className="admin-input" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} /></div>
          <div className="admin-input-group"><label className="admin-label">Notes</label><textarea className="admin-input" rows="3" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea></div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setIsAdding(false)} className="btn btn-skew" style={{ flex: 1, background: 'rgba(255,255,255,0.1)' }}><span>Cancel</span></button>
            <button type="submit" className="btn btn-primary btn-skew" style={{ flex: 1 }}><span>Save Client</span></button>
          </div>
        </form>
      )}
    </div>
  )
}

export default ClientManager
