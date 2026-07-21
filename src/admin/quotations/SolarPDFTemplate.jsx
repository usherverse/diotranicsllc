import React from 'react'
import { formatCurrency } from './quotationUtils'
import RubberStamp from '../../components/RubberStamp'

/**
 * SolarPDFTemplate
 * 
 * Matches the "MWIKI CHILDREN'S HOME SYSTEM QUOTE" format:
 * - Single flat table: QTY | UOM | Description | Unit Cost | Total | D/Note
 * - Subtotal, Electrical Installation/Commissioning line, Discount, VAT, Grand Total
 * - Solar-specific terms (delivery: immediate, 80/20 payment)
 * - Toshiba / Panasonic / LG brand footer
 */
const SolarPDFTemplate = ({ quotation: q, settings, onClose }) => {
  const c = q.client || {}

  // Flatten all items from all sections into a single table
  const allItems = (q.sections || []).flatMap(sec => sec.items || [])

  const handlePrint = () => window.print()

  return (
    <div className="pdf-overlay" style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#525659', overflowY: 'auto' }}>

      {/* Controls */}
      <div className="no-print" style={{ background: '#323639', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ fontFamily: 'Rajdhani', fontWeight: 600, letterSpacing: '0.05em' }}>Solar Quotation Preview — {q.quotation_number}</div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={handlePrint} className="btn btn-primary btn-skew" style={{ fontSize: '0.75rem', padding: '0.5rem 1.5rem' }}><span>Print / Save PDF</span></button>
          <button onClick={onClose} className="btn btn-skew" style={{ background: 'rgba(255,255,255,0.1)', fontSize: '0.75rem', padding: '0.5rem 1.5rem' }}><span>Close Preview</span></button>
        </div>
      </div>

      {/* A4 Page */}
      <div className="pdf-page" style={{ width: '210mm', background: 'white', margin: '2rem auto 4rem auto', padding: '12mm', boxSizing: 'border-box', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', color: '#111827', fontFamily: 'Inter, sans-serif', fontSize: '10pt' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #f59e0b', paddingBottom: '3mm', marginBottom: '5mm' }}>
          <img src="/assets/logo/original-logo.png" alt="Diotranics Enterprises" style={{ height: '130px', objectFit: 'contain', display: 'block' }} />
          <div style={{ textAlign: 'right', fontSize: '8pt', color: '#4b5563', lineHeight: '1.5' }}>
            <div style={{ fontWeight: 800, fontSize: '11pt', color: '#92400e' }}>{q.quotation_number}</div>
            <div>Date: {new Date(q.issue_date).toLocaleDateString('en-GB')}</div>
            {settings?.address && <div>{settings.address}</div>}
            <div>info@diotranics.co.ke</div>
            <div>+254 721 423 793 / +254 799 524 922</div>
            {settings?.kra_pin && <div>KRA PIN: {settings.kra_pin}</div>}
          </div>
        </div>

        {/* Addressed To */}
        <div style={{ marginBottom: '5mm', fontSize: '9pt', color: '#1f2937' }}>
          <div style={{ fontWeight: 700 }}>{c.company || c.client_name},</div>
          {c.reference_number && <div>CF/{c.reference_number},</div>}
          {q.issue_date && <div>{new Date(q.issue_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}.</div>}
          <div style={{ marginTop: '2mm' }}>Dear Sir/Madam,</div>
        </div>

        {/* RE Line */}
        <div style={{ fontWeight: 800, textTransform: 'uppercase', textDecoration: 'underline', fontSize: '10pt', marginBottom: '2mm', color: '#1f2937' }}>
          RE: QUOTATION FOR {q.project_name}
        </div>
        {q.scope_of_work && (
          <div style={{ fontSize: '9pt', color: '#374151', whiteSpace: 'pre-line', lineHeight: '1.4', marginBottom: '4mm' }}>{q.scope_of_work}</div>
        )}

        {/* Items Table — Flat (Solar style) */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.5pt', marginBottom: '3mm' }}>
          <thead>
            <tr style={{ background: '#fef3c7', color: '#78350f', textAlign: 'left', fontWeight: 700 }}>
              <th style={{ padding: '2.5mm 3mm', width: '8%', textAlign: 'center' }}>QTY</th>
              <th style={{ padding: '2.5mm 3mm', width: '10%', textAlign: 'center' }}>UOM</th>
              <th style={{ padding: '2.5mm 3mm', width: '44%' }}>DESCRIPTION</th>
              <th style={{ padding: '2.5mm 3mm', width: '16%', textAlign: 'right' }}>UNIT COST</th>
              <th style={{ padding: '2.5mm 3mm', width: '16%', textAlign: 'right' }}>TOTAL</th>
              <th style={{ padding: '2.5mm 3mm', width: '6%', textAlign: 'center' }}>D/Note</th>
            </tr>
          </thead>
          <tbody>
            {allItems.map((item, idx) => (
              <tr key={item.id || idx} style={{ borderBottom: '1px solid #e5e7eb', background: idx % 2 === 0 ? 'white' : '#fffbeb' }}>
                <td style={{ padding: '2.5mm 3mm', textAlign: 'center', fontWeight: 600 }}>{item.quantity}</td>
                <td style={{ padding: '2.5mm 3mm', textAlign: 'center' }}>{item.unit || 'PCS'}</td>
                <td style={{ padding: '2.5mm 3mm' }}>{item.description}</td>
                <td style={{ padding: '2.5mm 3mm', textAlign: 'right' }}>{formatCurrency(item.unit_price, q.currency)}</td>
                <td style={{ padding: '2.5mm 3mm', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(item.total, q.currency)}</td>
                <td style={{ padding: '2.5mm 3mm', textAlign: 'center', fontSize: '7pt', color: '#6b7280' }}>{item.d_note || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals Block */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '6mm' }}>
          <table style={{ width: '75mm', fontSize: '9.5pt', borderCollapse: 'collapse' }}>
            <tbody>
              <tr style={{ background: '#f3f4f6' }}>
                <td style={{ padding: '2mm 3mm', color: '#4b5563', fontWeight: 600 }}>SUB TOTAL</td>
                <td style={{ padding: '2mm 3mm', textAlign: 'right', fontWeight: 700 }}>{formatCurrency(q.subtotal, q.currency)}</td>
              </tr>
              {Number(q.labour) > 0 && (
                <tr>
                  <td style={{ padding: '2mm 3mm', color: '#4b5563' }}>Electrical Installation, Commissioning & Testing</td>
                  <td style={{ padding: '2mm 3mm', textAlign: 'right' }}>{formatCurrency(q.labour, q.currency)}</td>
                </tr>
              )}
              {Number(q.discount_amount) > 0 && (
                <tr>
                  <td style={{ padding: '2mm 3mm', color: '#dc2626', fontWeight: 600 }}>DISCOUNT</td>
                  <td style={{ padding: '2mm 3mm', textAlign: 'right', color: '#dc2626', fontWeight: 600 }}>-{formatCurrency(q.discount_amount, q.currency)}</td>
                </tr>
              )}
              {Number(q.transport) > 0 && (
                <tr>
                  <td style={{ padding: '2mm 3mm', color: '#4b5563' }}>Transport/Delivery</td>
                  <td style={{ padding: '2mm 3mm', textAlign: 'right' }}>{formatCurrency(q.transport, q.currency)}</td>
                </tr>
              )}
              <tr>
                <td style={{ padding: '2mm 3mm', color: '#4b5563' }}>V.A.T ({q.tax_rate}%)</td>
                <td style={{ padding: '2mm 3mm', textAlign: 'right' }}>{formatCurrency(q.tax_amount, q.currency)}</td>
              </tr>
              <tr style={{ borderTop: '2px solid #92400e', background: '#fef3c7' }}>
                <td style={{ padding: '3mm', fontWeight: 800, fontSize: '11pt', color: '#78350f' }}>GRAND TOTAL</td>
                <td style={{ padding: '3mm', textAlign: 'right', fontWeight: 800, fontSize: '11pt', color: '#78350f' }}>{formatCurrency(q.grand_total, q.currency)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Business Terms */}
        <div style={{ fontSize: '9pt', color: '#1f2937', marginBottom: '5mm' }}>
          <div style={{ fontWeight: 700, marginBottom: '2mm' }}>Business terms</div>
          <div style={{ lineHeight: '1.6' }}>
            <div><span style={{ fontWeight: 600 }}>Delivery :</span> Immediate upon approval</div>
            <div><span style={{ fontWeight: 600 }}>Quotation validity. :</span> {q.validity_days || 30} working days</div>
            <div><span style={{ fontWeight: 600 }}>Payment terms :</span> {q.payment_terms || '80% upon approval and 20% after installation, commissioning and testing'}</div>
            <div><span style={{ fontWeight: 600 }}>Inquiries. :</span> Undersigned</div>
          </div>
        </div>

        {/* Bank Details */}
        <div style={{ fontSize: '9pt', color: '#1f2937', marginBottom: '5mm' }}>
          <div style={{ fontWeight: 700, fontStyle: 'italic', marginBottom: '1mm' }}>Payment Instructions:</div>
          <div style={{ fontWeight: 700, marginBottom: '1mm' }}>Bank Details:</div>
          <div style={{ fontWeight: 700, fontStyle: 'italic', textDecoration: 'underline', marginBottom: '2mm' }}>ACCOUNT DETAILS:</div>
          <table style={{ fontSize: '9pt', lineHeight: '1.5' }}>
            <tbody>
              <tr><td style={{ width: '42mm', fontStyle: 'italic' }}>BANK NAME</td><td style={{ fontWeight: 600 }}>: {settings?.bank_name || 'COOPERATIVE BANK KENYA'}</td></tr>
              <tr><td style={{ fontStyle: 'italic' }}>ACCOUNT NAME</td><td style={{ fontWeight: 600 }}>: DIOTRANICS ENTERPRISES LTD</td></tr>
              <tr><td style={{ fontStyle: 'italic' }}>ACCOUNT NUMBER</td><td style={{ fontWeight: 600 }}>: {settings?.bank_account || '01192946387900'}</td></tr>
              {settings?.paybill && <tr><td style={{ fontStyle: 'italic' }}>PAYBILL</td><td style={{ fontWeight: 600 }}>: {settings.paybill}</td></tr>}
              {settings?.payment_instructions && (
                <tr><td colSpan={2} style={{ paddingTop: '2mm', whiteSpace: 'pre-line', fontStyle: 'italic' }}>{settings.payment_instructions}</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Signatures + Stamp */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '4mm', marginBottom: '4mm' }}>
          <div style={{ width: '35%' }}>
            <div style={{ borderBottom: '1px solid #1f2937', paddingBottom: '2mm', textAlign: 'center', marginBottom: '2mm' }}></div>
            <div style={{ fontWeight: 700, fontSize: '9pt', textAlign: 'center' }}>Authorized Signature & Name</div>
          </div>
          <div style={{ width: '25%', display: 'flex', justifyContent: 'center' }}>
            <RubberStamp date={q.issue_date} size={150} color="#92400e" style={{ pointerEvents: 'none' }} />
          </div>
          <div style={{ width: '35%' }}>
            <div style={{ borderBottom: '1px solid #1f2937', paddingBottom: '2mm', textAlign: 'center', marginBottom: '2mm' }}></div>
            <div style={{ fontWeight: 700, fontSize: '9pt', textAlign: 'center' }}>Client Signature & Name</div>
          </div>
        </div>

        {/* Partner Brands */}
        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '2mm', marginTop: '2mm', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16mm' }}>
          <img src="/assets/footer icons/free-toshiba-icon-svg-download-png-226434.webp" alt="Toshiba" style={{ height: '40px', objectFit: 'contain', mixBlendMode: 'multiply' }} />
          <img src="/assets/footer icons/Panasonic-logo.png" alt="Panasonic" style={{ height: '28px', objectFit: 'contain', mixBlendMode: 'multiply' }} />
          <img src="/assets/footer icons/lg.svg" alt="LG" style={{ height: '32px', objectFit: 'contain', mixBlendMode: 'multiply' }} />
        </div>
        <div style={{ textAlign: 'center', fontSize: '9pt', fontStyle: 'italic', fontWeight: 700, color: '#1f2937', borderTop: '1px solid #e5e7eb', paddingTop: '2mm', marginTop: '2mm' }}>
          Your Efficient & Reliable Partner in Electrical and Supplies Works.
        </div>

      </div>
    </div>
  )
}

export default SolarPDFTemplate
