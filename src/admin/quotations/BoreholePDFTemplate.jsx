import React from 'react'
import { formatCurrency } from './quotationUtils'
import RubberStamp from '../../components/RubberStamp'

/**
 * BoreholePDFTemplate
 *
 * Matches the "MR. CAXTON KILONZI DRILLING QUOTE" format:
 * - Sectioned table with per-section sub-totals
 * - Borehole-specific conditions: WRMA / NEMA licensing clause
 * - 80/20 drilling-specific payment terms
 * - Separate mobilization / casing / completion breakdown
 */
const BoreholePDFTemplate = ({ quotation: q, settings, onClose }) => {
  const c = q.client || {}

  const handlePrint = () => window.print()

  return (
    <div className="pdf-overlay" style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#525659', overflowY: 'auto' }}>

      {/* Controls */}
      <div className="no-print" style={{ background: '#323639', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ fontFamily: 'Rajdhani', fontWeight: 600, letterSpacing: '0.05em' }}>Borehole Quotation Preview — {q.quotation_number}</div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={handlePrint} className="btn btn-primary btn-skew" style={{ fontSize: '0.75rem', padding: '0.5rem 1.5rem' }}><span>Print / Save PDF</span></button>
          <button onClick={onClose} className="btn btn-skew" style={{ background: 'rgba(255,255,255,0.1)', fontSize: '0.75rem', padding: '0.5rem 1.5rem' }}><span>Close Preview</span></button>
        </div>
      </div>

      {/* A4 Page */}
      <div className="pdf-page" style={{ width: '210mm', background: 'white', margin: '2rem auto 4rem auto', padding: '12mm', boxSizing: 'border-box', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', color: '#111827', fontFamily: 'Inter, sans-serif', fontSize: '10pt' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #0e4f8b', paddingBottom: '3mm', marginBottom: '5mm' }}>
          <img src="/assets/logo/original-logo.png" alt="Diotranics Enterprises" style={{ height: '130px', objectFit: 'contain', display: 'block' }} />
          <div style={{ textAlign: 'right', fontSize: '8pt', color: '#4b5563', lineHeight: '1.5' }}>
            <div style={{ fontWeight: 800, fontSize: '11pt', color: '#0e4f8b' }}>{q.quotation_number}</div>
            <div>Date: {new Date(q.issue_date).toLocaleDateString('en-GB')}</div>
            {settings?.address && <div>{settings.address}</div>}
            <div>info@diotranics.co.ke</div>
            <div>+254 721 423 793 / +254 799 524 922</div>
            {settings?.kra_pin && <div>KRA PIN: {settings.kra_pin}</div>}
          </div>
        </div>

        {/* Addressed To */}
        <div style={{ marginBottom: '4mm', fontSize: '9pt' }}>
          <div><span style={{ fontWeight: 700 }}>To:</span> {c.company || c.client_name}</div>
          {q.reference_number && <div><span style={{ fontWeight: 700 }}>Ref:</span> {q.reference_number}</div>}
          {c.email && <div><span style={{ fontWeight: 700 }}>Email:</span> {c.email}</div>}
          {c.phone && <div><span style={{ fontWeight: 700 }}>Tel:</span> {c.phone}</div>}
        </div>

        {/* RE Line */}
        <div style={{ fontWeight: 800, textTransform: 'uppercase', textDecoration: 'underline', fontSize: '10pt', marginBottom: '2mm', color: '#1f2937' }}>
          RE: QUOTATION FOR {q.project_name}
        </div>
        {q.project_location && (
          <div style={{ fontSize: '9pt', color: '#4b5563', marginBottom: '1mm' }}>Location: {q.project_location}</div>
        )}
        {q.scope_of_work && (
          <div style={{ fontSize: '9pt', color: '#374151', whiteSpace: 'pre-line', lineHeight: '1.4', marginBottom: '4mm' }}>{q.scope_of_work}</div>
        )}

        {/* Sectioned Items Tables */}
        {(q.sections || []).map((sec, idx) => (
          <div key={sec.id} style={{ marginBottom: '6mm' }}>
            <div style={{ fontSize: '10.5pt', fontWeight: 700, color: '#0e4f8b', borderBottom: '2px solid #0e4f8b', paddingBottom: '1.5mm', marginBottom: '2mm' }}>
              {idx + 1}.0 {sec.title}
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.5pt' }}>
              <thead>
                <tr style={{ background: '#dbeafe', color: '#1e3a8a', fontWeight: 700, textAlign: 'left' }}>
                  <th style={{ padding: '2.5mm 3mm', width: '8%', textAlign: 'center' }}>Item</th>
                  <th style={{ padding: '2.5mm 3mm', width: '44%' }}>Description</th>
                  <th style={{ padding: '2.5mm 3mm', width: '8%', textAlign: 'center' }}>Qty</th>
                  <th style={{ padding: '2.5mm 3mm', width: '10%', textAlign: 'center' }}>Unit</th>
                  <th style={{ padding: '2.5mm 3mm', width: '15%', textAlign: 'right' }}>Rate ({q.currency})</th>
                  <th style={{ padding: '2.5mm 3mm', width: '15%', textAlign: 'right' }}>Amount ({q.currency})</th>
                </tr>
              </thead>
              <tbody>
                {(sec.items || []).map((item, iIdx) => (
                  <tr key={item.id || iIdx} style={{ borderBottom: '1px solid #e5e7eb', background: iIdx % 2 === 0 ? 'white' : '#eff6ff' }}>
                    <td style={{ padding: '2.5mm 3mm', textAlign: 'center', fontWeight: 600 }}>
                      {['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV'][iIdx] || iIdx + 1}.
                    </td>
                    <td style={{ padding: '2.5mm 3mm' }}>{item.description}</td>
                    <td style={{ padding: '2.5mm 3mm', textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ padding: '2.5mm 3mm', textAlign: 'center' }}>{item.unit || 'Item'}</td>
                    <td style={{ padding: '2.5mm 3mm', textAlign: 'right' }}>{formatCurrency(item.unit_price, q.currency)}</td>
                    <td style={{ padding: '2.5mm 3mm', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(item.total, q.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '5mm', marginBottom: '6mm' }}>
          <table style={{ width: '75mm', fontSize: '9.5pt', borderCollapse: 'collapse' }}>
            <tbody>
              <tr style={{ background: '#f3f4f6' }}>
                <td style={{ padding: '2mm 3mm', color: '#4b5563', fontWeight: 600 }}>Subtotal:</td>
                <td style={{ padding: '2mm 3mm', textAlign: 'right', fontWeight: 700 }}>{formatCurrency(q.subtotal, q.currency)}</td>
              </tr>
              {Number(q.discount_amount) > 0 && (
                <tr>
                  <td style={{ padding: '2mm 3mm', color: '#dc2626' }}>Discount:</td>
                  <td style={{ padding: '2mm 3mm', textAlign: 'right', color: '#dc2626' }}>-{formatCurrency(q.discount_amount, q.currency)}</td>
                </tr>
              )}
              {Number(q.transport) > 0 && (
                <tr>
                  <td style={{ padding: '2mm 3mm', color: '#4b5563' }}>Transport/Mobilization:</td>
                  <td style={{ padding: '2mm 3mm', textAlign: 'right' }}>{formatCurrency(q.transport, q.currency)}</td>
                </tr>
              )}
              {Number(q.labour) > 0 && (
                <tr>
                  <td style={{ padding: '2mm 3mm', color: '#4b5563' }}>Labour/Installation:</td>
                  <td style={{ padding: '2mm 3mm', textAlign: 'right' }}>{formatCurrency(q.labour, q.currency)}</td>
                </tr>
              )}
              <tr>
                <td style={{ padding: '2mm 3mm', color: '#4b5563' }}>Tax ({q.tax_rate}%):</td>
                <td style={{ padding: '2mm 3mm', textAlign: 'right' }}>{formatCurrency(q.tax_amount, q.currency)}</td>
              </tr>
              <tr style={{ borderTop: '2px solid #0e4f8b', background: '#dbeafe' }}>
                <td style={{ padding: '3mm', fontWeight: 800, fontSize: '11pt', color: '#0e4f8b' }}>Grand Total:</td>
                <td style={{ padding: '3mm', textAlign: 'right', fontWeight: 800, fontSize: '11pt', color: '#0e4f8b' }}>{formatCurrency(q.grand_total, q.currency)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Borehole Conditions */}
        <div style={{ fontSize: '9pt', color: '#1f2937', marginBottom: '5mm' }}>
          <div style={{ fontWeight: 700, textDecoration: 'underline', marginBottom: '2mm' }}>A. CONDITIONS OF CONTRACT</div>
          <div style={{ whiteSpace: 'pre-line', paddingLeft: '4mm', marginBottom: '4mm', lineHeight: '1.5' }}>
            {q.terms_conditions ||
              `1. The Authority to Drill Borehole from Water Resources Management Authority (WRMA) and NEMA License are pre-requisites for commencement of Borehole Drilling.\n2. Site preparation for accessibility by the machines is the client's responsibility.\n3. All quoted depths are estimated; actual depth may vary based on geological conditions.\n4. Water quality testing shall be done upon successful drilling.`}
          </div>

          <div style={{ fontWeight: 700, textDecoration: 'underline', marginBottom: '2mm' }}>B. TERMS OF PAYMENT</div>
          <div style={{ whiteSpace: 'pre-line', paddingLeft: '4mm', lineHeight: '1.5', marginBottom: '4mm' }}>
            {q.payment_terms ||
              `The payment structure is as follows:\n• 80% of the total contract sum to be paid for the mobilization of the drilling equipment and personnel to the site.\n• 20% of the total contract sum to be paid upon completion of borehole drilling works and before the installation of casings.`}
          </div>

          <div style={{ fontWeight: 700, fontStyle: 'italic' }}>
            Disclaimer: {settings?.footer_disclaimer || "The price is subject to changes based on the day's pricing of casing materials, especially in the event of delays in the execution of this project."}
          </div>
        </div>

        {/* Bank Details */}
        <div style={{ fontSize: '9pt', color: '#1f2937', marginBottom: '5mm' }}>
          <div style={{ fontWeight: 700, fontStyle: 'italic', marginBottom: '1mm' }}>Payment Instructions:</div>
          <div style={{ fontWeight: 700, fontStyle: 'italic', textDecoration: 'underline', marginBottom: '2mm' }}>ACCOUNT DETAILS:</div>
          <table style={{ fontSize: '9pt', lineHeight: '1.5' }}>
            <tbody>
              <tr><td style={{ width: '42mm', fontStyle: 'italic' }}>BANK NAME</td><td style={{ fontWeight: 600 }}>: {settings?.bank_name || 'COOPERATIVE BANK OF KENYA'}</td></tr>
              <tr><td style={{ fontStyle: 'italic' }}>ACCOUNT NAME</td><td style={{ fontWeight: 600 }}>: DIOTRANICS ENTERPRISES LTD</td></tr>
              <tr><td style={{ fontStyle: 'italic' }}>ACCOUNT NUMBER</td><td style={{ fontWeight: 600 }}>: {settings?.bank_account || '01192946387900'}</td></tr>
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
            <RubberStamp date={q.issue_date} size={150} color="#0e4f8b" style={{ pointerEvents: 'none' }} />
          </div>
          <div style={{ width: '35%' }}>
            <div style={{ borderBottom: '1px solid #1f2937', paddingBottom: '2mm', textAlign: 'center', marginBottom: '2mm' }}></div>
            <div style={{ fontWeight: 700, fontSize: '9pt', textAlign: 'center' }}>Client Signature & Name</div>
          </div>
        </div>

        {/* Footer */}
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

export default BoreholePDFTemplate
