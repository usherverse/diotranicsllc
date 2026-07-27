import React, { useState, useEffect } from 'react'
import { getStatusColor, formatCurrency } from './quotationUtils'
import { supabase } from '../../config/supabaseClient'
import PDFTemplate from './PDFTemplate'
import ConfirmModal from './ConfirmModal'

const QuotationDetail = ({ quotationId, onBack, onEdit, onDuplicate, onDelete, onRefreshRequired, isCloned }) => {
  const [quotation, setQuotation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showPDF, setShowPDF] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [duplicating, setDuplicating] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDuplicate = async () => {
    setDuplicating(true)
    await onDuplicate(quotationId)
    setDuplicating(false)
  }

  const handleConfirmDelete = async () => {
    if (!quotation) return
    const num = quotation.quotation_number || 'this quotation'
    setDeleting(true)
    await onDelete(quotation.id, num)
    setDeleting(false)
    setShowDeleteModal(false)
  }

  const fetchDetail = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('quotations')
        .select(`
          *,
          client:client_id (*),
          sections:quotation_sections (
            *,
            items:quotation_items (*)
          ),
          activity:quotation_activity (*)
        `)
        .eq('id', quotationId)
        .single()
      
      if (error) throw error
      
      // Sort
      if (data && data.sections) {
        data.sections.sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
        data.sections.forEach(sec => {
          if (sec.items) sec.items.sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
        })
      }
      if (data && data.activity) {
        data.activity.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      }

      setQuotation(data)
    } catch (err) {
      alert("Error loading details: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (quotationId) fetchDetail()
  }, [quotationId])

  const updateStatus = async (newStatus) => {
    setUpdating(true)
    try {
      await supabase.from('quotations').update({ status: newStatus }).eq('id', quotation.id)
      await supabase.from('quotation_activity').insert([{
        quotation_id: quotation.id,
        action: 'Status Changed',
        description: `Status changed to ${newStatus}`
      }])
      await fetchDetail()
      if (onRefreshRequired) onRefreshRequired()
    } catch (err) {
      alert("Error updating status: " + err.message)
    } finally {
      setUpdating(false)
    }
  }

  if (loading || !quotation) return <div className="admin-card"><div className="spinner"></div></div>

  const statusTheme = getStatusColor(quotation.status)

  return (
    <>
      <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Clone Banner */}
        {isCloned && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(0,229,255,0.12) 0%, rgba(0,150,255,0.08) 100%)',
            border: '1px solid rgba(0,229,255,0.35)',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
            animation: 'fadeIn 0.4s ease'
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'rgba(0,229,255,0.15)', border: '1px solid rgba(0,229,255,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem', flexShrink: 0
            }}>⧉</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#00e5ff', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                This is a freshly cloned draft
              </div>
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.82rem', lineHeight: 1.5 }}>
                A copy of the original quotation has been created with a new number and set to <strong style={{ color: 'white' }}>Draft</strong> status.
                Review the details, make any changes needed, then update the status to <strong style={{ color: 'white' }}>Sent</strong> or <strong style={{ color: 'white' }}>Pending Approval</strong> when ready.
              </div>
            </div>
            <button
              onClick={() => onEdit(quotation)}
              className="btn btn-skew"
              style={{ background: 'rgba(0,229,255,0.15)', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.3)', fontSize: '0.75rem', padding: '0.5rem 1rem', flexShrink: 0 }}
            >
              <span>Edit Now →</span>
            </button>
          </div>
        )}

        {/* Header Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={onBack} className="btn" style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: 0 }}>
            <span>← Back to List</span>
          </button>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => setShowPDF(true)} className="btn btn-primary btn-skew" style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}>
              <span>Preview PDF / Print</span>
            </button>
            <button onClick={() => onEdit(quotation)} className="btn btn-skew" style={{ background: 'rgba(255,255,255,0.1)', fontSize: '0.75rem', padding: '0.5rem 1rem' }}>
              <span>Edit Quotation</span>
            </button>
            <button
              onClick={handleDuplicate}
              disabled={duplicating}
              className="btn btn-skew"
              title="Clone this quotation as a new draft"
              style={{ background: 'rgba(0,229,255,0.08)', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.2)', fontSize: '0.75rem', padding: '0.5rem 1rem' }}
            >
              <span>{duplicating ? 'Cloning…' : '⧉ Clone'}</span>
            </button>
            {quotation.client?.email && (
              <a
                href={`mailto:${quotation.client.email}?subject=Quotation ${encodeURIComponent(quotation.quotation_number)} – ${encodeURIComponent(quotation.project_name || 'Project')}&body=${encodeURIComponent(`Dear ${quotation.client.client_name || 'Client'},\n\nPlease find attached our quotation ${quotation.quotation_number} for ${quotation.project_name || 'the above project'}.\n\nKindly review and revert with your feedback.\n\nWarm regards,\nDiotranics Enterprises Ltd`)}`}
                className="btn btn-skew"
                style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.25)', fontSize: '0.75rem', padding: '0.5rem 1rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                title={`Send to ${quotation.client.email}`}
              >
                <span>✉ Email Client</span>
              </a>
            )}
            <button
              onClick={() => setShowDeleteModal(true)}
              disabled={deleting}
              className="btn btn-skew"
              title="Delete this quotation permanently"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)', fontSize: '0.75rem', padding: '0.5rem 1rem' }}
            >
              <span>🗑 Delete Quotation</span>
            </button>
          </div>
        </div>

        {/* Master Info Card */}
        <div className="admin-card qc-flex-wrap">
          <div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Quotation Details</div>
            <h1 style={{ fontSize: '2rem', color: 'var(--primary)', margin: '0 0 0.5rem 0', fontFamily: 'Rajdhani', lineHeight: 1 }}>{quotation.quotation_number}</h1>
            <div style={{ fontSize: '1rem', color: 'white', fontWeight: 600 }}>{quotation.project_name}</div>
            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem' }}>Issue Date: {new Date(quotation.issue_date).toLocaleDateString()}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ marginBottom: '1rem' }}>
              <span style={{ 
                background: statusTheme.bg, color: statusTheme.text, border: `1px solid ${statusTheme.border}`,
                padding: '0.4rem 1rem', borderRadius: '99px', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700
              }}>{quotation.status}</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <select className="admin-input" style={{ width: '150px', padding: '0.3rem', fontSize: '0.75rem' }} value={quotation.status} onChange={e => updateStatus(e.target.value)} disabled={updating}>
                <option value="draft">Draft</option>
                <option value="pending approval">Pending Approval</option>
                <option value="sent">Sent</option>
                <option value="approved">Approved</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        <div className="qc-grid-layout">
          {/* Main Content: Services */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="admin-card">
              <h3 style={{ fontSize: '1.1rem', color: 'white', marginBottom: '1.5rem', fontFamily: 'Rajdhani', textTransform: 'uppercase' }}>Scope of Work</h3>
              
              {quotation.sections && quotation.sections.map((sec, idx) => (
                <div key={sec.id} style={{ marginBottom: '2rem' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                    {idx+1}.0 {sec.title}
                  </div>
                  <table className="qc-table">
                    <thead>
                      <tr style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'left', textTransform: 'uppercase' }}>
                        <th style={{ padding: '0.5rem 0' }}>Description</th>
                        <th style={{ padding: '0.5rem 0', textAlign: 'center' }}>Qty</th>
                        <th style={{ padding: '0.5rem 0', textAlign: 'right' }}>Unit Price</th>
                        <th style={{ padding: '0.5rem 0', textAlign: 'right' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sec.items && sec.items.map(item => (
                        <tr key={item.id}>
                          <td data-label="Description" style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontWeight: 600 }}>{item.description}</div>
                          </td>
                          <td data-label="Qty" style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{item.quantity} {item.unit}</td>
                          <td data-label="Unit Price" style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{formatCurrency(item.unit_price, quotation.currency)}</td>
                          <td data-label="Total" style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'right', fontWeight: 600 }}>
                            {formatCurrency(item.total, quotation.currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem', borderTop: '2px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                <table style={{ width: '300px', fontSize: '0.85rem' }}>
                  <tbody>
                    <tr><td style={{ padding: '0.3rem 0', color: 'rgba(255,255,255,0.6)' }}>Subtotal</td><td style={{ textAlign: 'right', color: 'white' }}>{formatCurrency(quotation.subtotal, quotation.currency)}</td></tr>
                    {Number(quotation.discount_amount) > 0 && <tr><td style={{ padding: '0.3rem 0', color: 'rgba(255,255,255,0.6)' }}>Discount</td><td style={{ textAlign: 'right', color: '#ef4444' }}>-{formatCurrency(quotation.discount_amount, quotation.currency)}</td></tr>}
                    <tr><td style={{ padding: '0.3rem 0', color: 'rgba(255,255,255,0.6)' }}>Tax ({quotation.tax_rate}%)</td><td style={{ textAlign: 'right', color: 'white' }}>{formatCurrency(quotation.tax_amount, quotation.currency)}</td></tr>
                    {Number(quotation.transport) > 0 && <tr><td style={{ padding: '0.3rem 0', color: 'rgba(255,255,255,0.6)' }}>Transport</td><td style={{ textAlign: 'right', color: 'white' }}>{formatCurrency(quotation.transport, quotation.currency)}</td></tr>}
                    {Number(quotation.labour) > 0 && <tr><td style={{ padding: '0.3rem 0', color: 'rgba(255,255,255,0.6)' }}>Labour</td><td style={{ textAlign: 'right', color: 'white' }}>{formatCurrency(quotation.labour, quotation.currency)}</td></tr>}
                    <tr style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)' }}><td style={{ padding: '1rem 0 0 0' }}>Grand Total</td><td style={{ textAlign: 'right', padding: '1rem 0 0 0' }}>{formatCurrency(quotation.grand_total, quotation.currency)}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar Info: Client & Activity */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="admin-card">
              <h3 style={{ fontSize: '0.9rem', color: 'white', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Client Info</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
                <div style={{ fontWeight: 700, color: 'white', fontSize: '1rem' }}>{quotation.client?.company || quotation.client?.client_name}</div>
                {quotation.client?.company && <div>Contact: {quotation.client.client_name}</div>}
                <div>Email: {quotation.client?.email}</div>
                <div>Phone: {quotation.client?.phone}</div>
                <div style={{ whiteSpace: 'pre-line', marginTop: '0.5rem' }}>{quotation.client?.address}</div>
              </div>
            </div>

            <div className="admin-card">
              <h3 style={{ fontSize: '0.9rem', color: 'white', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Activity Log</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
                {quotation.activity && quotation.activity.map(act => (
                  <div key={act.id} style={{ display: 'flex', gap: '0.75rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', marginTop: '0.3rem', flexShrink: 0 }}></div>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'white' }}>{act.action}</div>
                      <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.2rem' }}>{new Date(act.created_at).toLocaleString()}</div>
                      <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>{act.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPDF && <PDFTemplate quotation={quotation} onClose={() => setShowPDF(false)} />}

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Quotation"
        message={`Are you sure you want to delete quotation ${quotation?.quotation_number || ''}? This action cannot be undone and will remove all associated line items and activity logs.`}
        confirmText="Delete Quotation"
        cancelText="Cancel"
        variant="danger"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </>
  )
}

export default QuotationDetail
