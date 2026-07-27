import React, { useState, useMemo } from 'react'
import { getStatusColor, formatCurrency } from './quotationUtils'
import ConfirmModal from './ConfirmModal'

const STATUS_FILTERS = ['All', 'draft', 'pending approval', 'sent', 'approved', 'rejected']
const TERMINAL_STATUSES = ['approved', 'accepted', 'rejected', 'cancelled', 'completed']

const getExpiryInfo = (q) => {
  if (!q.issue_date || !q.validity_days || TERMINAL_STATUSES.includes(q.status)) return null
  const issueDate = new Date(q.issue_date)
  const expiryDate = new Date(issueDate.getTime() + q.validity_days * 24 * 60 * 60 * 1000)
  const daysLeft = Math.ceil((expiryDate - Date.now()) / (1000 * 60 * 60 * 24))
  if (daysLeft < 0) return { label: 'Expired', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', daysLeft }
  if (daysLeft <= 5) return { label: `${daysLeft}d left`, color: '#f97316', bg: 'rgba(249,115,22,0.12)', daysLeft }
  return null
}

const QuotationList = ({ quotations, loading, onViewQuotation, onDuplicate, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortField, setSortField] = useState('date') // 'date' | 'amount'
  const [sortDir, setSortDir] = useState('desc')     // 'asc' | 'desc'
  const [duplicatingId, setDuplicatingId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null) // { id, num }
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDuplicate = async (e, id) => {
    e.stopPropagation()
    setDuplicatingId(id)
    await onDuplicate(id)
    setDuplicatingId(null)
  }

  const promptDelete = (e, q) => {
    e.stopPropagation()
    setDeleteTarget({ id: q.id, num: q.quotation_number || 'this quotation' })
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    await onDelete(deleteTarget.id, deleteTarget.num)
    setIsDeleting(false)
    setDeleteTarget(null)
  }

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  const filtered = useMemo(() => {
    let list = quotations.filter(q =>
      (statusFilter === 'All' || q.status === statusFilter) &&
      (
        (q.quotation_number && q.quotation_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (q.project_name && q.project_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (q.client && q.client.client_name && q.client.client_name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    )
    list = [...list].sort((a, b) => {
      let valA = sortField === 'date' ? new Date(a.issue_date) : Number(a.grand_total)
      let valB = sortField === 'date' ? new Date(b.issue_date) : Number(b.grand_total)
      return sortDir === 'desc' ? valB - valA : valA - valB
    })
    return list
  }, [quotations, searchTerm, statusFilter, sortField, sortDir])

  const chipStyle = (active) => ({
    padding: '0.3rem 0.85rem', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 700,
    cursor: 'pointer', border: active ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
    background: active ? 'rgba(0,229,255,0.12)' : 'transparent',
    color: active ? 'var(--primary)' : 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase', letterSpacing: '0.05em', transition: 'all 0.2s'
  })

  const sortBtn = (field, label) => {
    const active = sortField === field
    return (
      <button
        onClick={() => toggleSort(field)}
        style={{
          background: active ? 'rgba(0,229,255,0.1)' : 'rgba(255,255,255,0.05)',
          border: active ? '1px solid rgba(0,229,255,0.3)' : '1px solid rgba(255,255,255,0.1)',
          color: active ? 'var(--primary)' : 'rgba(255,255,255,0.5)',
          borderRadius: '6px', padding: '0.3rem 0.75rem', fontSize: '0.7rem',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem'
        }}
      >
        {label} {active ? (sortDir === 'desc' ? '↓' : '↑') : '↕'}
      </button>
    )
  }

  return (
    <div className="admin-card">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: 'white' }}>
          Quotations <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>({filtered.length})</span>
        </h2>
        <div className="admin-input-group" style={{ width: '100%', maxWidth: '260px', margin: 0 }}>
          <input
            type="text"
            className="admin-input"
            placeholder="Search quote, client, project…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ padding: '0.5rem 1rem' }}
          />
        </div>
      </div>

      {/* Filters & Sort bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        {/* Status filter chips */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {STATUS_FILTERS.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} style={chipStyle(statusFilter === s)}>
              {s}
            </button>
          ))}
        </div>
        {/* Sort controls */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase' }}>Sort:</span>
          {sortBtn('date', 'Date')}
          {sortBtn('amount', 'Amount')}
        </div>
      </div>

      {loading ? <div className="spinner"></div> : (
        <div style={{ overflowX: 'auto' }}>
          <table className="qc-table">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '0.75rem 0.5rem' }}>Quote #</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Client &amp; Project</th>
                <th style={{ padding: '0.75rem 0.5rem', cursor: 'pointer' }} onClick={() => toggleSort('date')}>
                  Date {sortField === 'date' ? (sortDir === 'desc' ? '↓' : '↑') : ''}
                </th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right', cursor: 'pointer' }} onClick={() => toggleSort('amount')}>
                  Amount {sortField === 'amount' ? (sortDir === 'desc' ? '↓' : '↑') : ''}
                </th>
                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(q => {
                const statusTheme = getStatusColor(q.status)
                const expiryInfo = getExpiryInfo(q)
                return (
                  <tr
                    key={q.id}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td data-label="Quote #" style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: 'var(--primary)' }}>{q.quotation_number}</td>
                    <td data-label="Client & Project" style={{ padding: '0.75rem 0.5rem' }}>
                      <div style={{ fontWeight: 600 }}>{q.client ? q.client.client_name : '-'}</div>
                      <div style={{ opacity: 0.6, fontSize: '0.75rem' }}>{q.project_name || '-'}</div>
                    </td>
                    <td data-label="Date" style={{ padding: '0.75rem 0.5rem' }}>{new Date(q.issue_date).toLocaleDateString()}</td>
                    <td data-label="Status" style={{ padding: '0.75rem 0.5rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        <span style={{
                          background: statusTheme.bg, color: statusTheme.text, border: `1px solid ${statusTheme.border}`,
                          padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, display: 'inline-block'
                        }}>{q.status}</span>
                        {expiryInfo && (
                          <span style={{
                            background: expiryInfo.bg, color: expiryInfo.color,
                            padding: '0.15rem 0.5rem', borderRadius: '99px', fontSize: '0.65rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.2rem', width: 'fit-content'
                          }}>
                            {expiryInfo.daysLeft < 0 ? '⚠' : '⏰'} {expiryInfo.label}
                          </span>
                        )}
                      </div>
                    </td>
                    <td data-label="Amount" style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: 600 }}>
                      {formatCurrency(q.grand_total, q.currency)}
                    </td>
                    <td data-label="Actions" style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                      <button
                        onClick={() => onViewQuotation(q.id)}
                        className="btn btn-skew"
                        style={{ background: 'rgba(255,255,255,0.1)', padding: '0.4rem 0.8rem', fontSize: '0.7rem', marginRight: '0.5rem' }}
                      >
                        <span>View</span>
                      </button>
                      <button
                        onClick={(e) => handleDuplicate(e, q.id)}
                        disabled={duplicatingId === q.id || (isDeleting && deleteTarget?.id === q.id)}
                        className="btn btn-skew"
                        title="Clone this quotation as a new draft"
                        style={{ background: 'rgba(0,229,255,0.08)', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.2)', padding: '0.4rem 0.8rem', fontSize: '0.7rem', marginRight: '0.5rem' }}
                      >
                        <span>{duplicatingId === q.id ? '…' : '⧉ Clone'}</span>
                      </button>
                      <button
                        onClick={(e) => promptDelete(e, q)}
                        disabled={isDeleting || duplicatingId === q.id}
                        className="btn btn-skew"
                        title="Delete this quotation"
                        style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)', padding: '0.4rem 0.8rem', fontSize: '0.7rem' }}
                      >
                        <span>🗑 Delete</span>
                      </button>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', opacity: 0.4 }}>
                    No quotations match the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* App-styled Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Quotation"
        message={`Are you sure you want to delete quotation ${deleteTarget?.num || ''}? This action cannot be undone and will remove all associated line items and activity logs.`}
        confirmText="Delete Quotation"
        cancelText="Cancel"
        variant="danger"
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

export default QuotationList
