import React, { useState } from 'react'
import { getStatusColor, formatCurrency } from './quotationUtils'

const QuotationList = ({ quotations, loading, onViewQuotation, onEditQuotation }) => {
  const [searchTerm, setSearchTerm] = useState('')

  const filtered = quotations.filter(q => 
    (q.quotation_number && q.quotation_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (q.project_name && q.project_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (q.client && q.client.client_name && q.client.client_name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="admin-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: 'white' }}>Quotations</h2>
        <div className="admin-input-group" style={{ width: '300px' }}>
          <input type="text" className="admin-input" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ padding: '0.5rem 1rem' }} />
        </div>
      </div>

      {loading ? <div className="spinner"></div> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '1rem' }}>Quote #</th>
                <th style={{ padding: '1rem' }}>Client & Project</th>
                <th style={{ padding: '1rem' }}>Date</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Amount</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(q => {
                const statusTheme = getStatusColor(q.status)
                return (
                  <tr key={q.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--primary)' }}>{q.quotation_number}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600 }}>{q.client ? q.client.client_name : '-'}</div>
                      <div style={{ opacity: 0.6, fontSize: '0.75rem' }}>{q.project_name || '-'}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>{new Date(q.issue_date).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        background: statusTheme.bg, color: statusTheme.text, border: `1px solid ${statusTheme.border}`,
                        padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700
                      }}>{q.status}</span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>
                      {formatCurrency(q.grand_total, q.currency)}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button onClick={() => onViewQuotation(q.id)} className="btn btn-skew" style={{ background: 'rgba(255,255,255,0.1)', padding: '0.4rem 0.8rem', fontSize: '0.7rem', marginRight: '0.5rem' }}><span>View</span></button>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>No quotations found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default QuotationList
