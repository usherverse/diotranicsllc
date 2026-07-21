import React from 'react'
import { formatCurrency } from './quotationUtils'

const QDashboard = ({ quotations, clients }) => {
  const activeQs = quotations.filter(q => q.status !== 'cancelled' && q.status !== 'rejected')
  const totalValue = activeQs.reduce((acc, q) => acc + Number(q.grand_total || 0), 0)
  const approvedValue = quotations.filter(q => q.status === 'approved' || q.status === 'accepted').reduce((acc, q) => acc + Number(q.grand_total || 0), 0)
  
  const drafts = quotations.filter(q => q.status === 'draft').length
  const sent = quotations.filter(q => q.status === 'sent').length
  const approved = quotations.filter(q => q.status === 'approved' || q.status === 'accepted').length

  const recentQuotations = quotations.slice(0, 5)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
        {[
          { label: 'Total Value', value: formatCurrency(totalValue), color: '#3b82f6' },
          { label: 'Approved Value', value: formatCurrency(approvedValue), color: '#10b981' },
          { label: 'Total Quotations', value: quotations.length, color: '#f59e0b' },
          { label: 'Drafts', value: drafts, color: '#a1a1aa' },
          { label: 'Pending/Sent', value: sent, color: '#3b82f6' },
          { label: 'Approved', value: approved, color: '#10b981' },
        ].map(stat => (
          <div key={stat.label} className="admin-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: stat.color, fontFamily: 'Rajdhani', lineHeight: 1 }}>{stat.value}</div>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.5rem' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="admin-card">
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'white' }}>Recent Activity</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentQuotations.map(q => (
              <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                <div>
                  <div style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem' }}>{q.quotation_number}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{q.client?.client_name}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{formatCurrency(q.grand_total, q.currency)}</div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>{new Date(q.created_at).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card">
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'white' }}>Latest Clients</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {clients.slice(0, 5).map(c => (
              <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'white' }}>{c.client_name}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{c.company || 'Individual'}</div>
                </div>
                <div style={{ fontSize: '0.75rem', opacity: 0.5, textAlign: 'right' }}>
                  {new Date(c.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}

export default QDashboard
