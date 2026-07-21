import React, { useState, useEffect } from 'react'
import { supabase } from '../../config/supabaseClient'
import { generateQuotationNumber, calculateQuotationTotals, calculateLineItemTotal, formatCurrency } from './quotationUtils'

const CreateQuotation = ({ clients, onSaved, editingQuotation = null }) => {
  const [loading, setLoading] = useState(false)
  const [services, setServices] = useState([])
  
  const [formData, setFormData] = useState({
    client_id: '',
    project_name: '',
    project_location: '',
    reference_number: '',
    prepared_by: '',
    sales_rep: '',
    currency: 'KES',
    tax_type: 'VAT',
    tax_rate: 16,
    status: 'draft',
    template_style: 'solar',
    validity_days: 30,
    discount_type: 'percentage',
    discount_value: 0,
    shipping: 0,
    labour: 0,
    transport: 0,
    other_charges: 0,
    scope_of_work: '',
    payment_terms: '',
    notes: '',
    terms_conditions: '1. Quotation is valid for 30 days.\n2. 60% deposit required to commence work.\n3. Balance upon completion.',
  })

  const [sections, setSections] = useState([
    {
      id: Date.now().toString(),
      title: 'Main Services',
      items: [
        { id: Date.now().toString() + 'i', description: '', unit: 'Item', quantity: 1, unit_price: 0, discount_type: 'percentage', discount_value: 0, tax_rate: 16 }
      ]
    }
  ])

  useEffect(() => {
    fetchServices()
    if (editingQuotation) {
      // populate form
      setFormData({
        client_id: editingQuotation.client_id || '',
        project_name: editingQuotation.project_name || '',
        project_location: editingQuotation.project_location || '',
        reference_number: editingQuotation.reference_number || '',
        prepared_by: editingQuotation.prepared_by || '',
        sales_rep: editingQuotation.sales_rep || '',
        currency: editingQuotation.currency || 'KES',
        tax_type: editingQuotation.tax_type || 'VAT',
        tax_rate: editingQuotation.tax_rate || 16,
        status: editingQuotation.status || 'draft',
        template_style: editingQuotation.template_style || 'solar',
        validity_days: editingQuotation.validity_days || 30,
        discount_type: editingQuotation.discount_type || 'percentage',
        discount_value: editingQuotation.discount_value || 0,
        shipping: editingQuotation.shipping || 0,
        labour: editingQuotation.labour || 0,
        transport: editingQuotation.transport || 0,
        other_charges: editingQuotation.other_charges || 0,
        scope_of_work: editingQuotation.scope_of_work || '',
        payment_terms: editingQuotation.payment_terms || '',
        notes: editingQuotation.notes || '',
        terms_conditions: editingQuotation.terms_conditions || '',
      })
      if (editingQuotation.sections && editingQuotation.sections.length > 0) {
        setSections(editingQuotation.sections.map(s => ({
          ...s,
          id: s.id || Date.now().toString() + Math.random(),
          items: s.items ? s.items.map(i => ({...i, id: i.id || Date.now().toString() + Math.random()})) : []
        })))
      }
    }
  }, [editingQuotation])

  const fetchServices = async () => {
    const { data } = await supabase.from('qt_services').select('*').order('name')
    if (data) setServices(data)
  }

  const handleTemplateStyleChange = (e) => {
    const style = e.target.value
    let newTerms = formData.terms_conditions
    let newPayment = formData.payment_terms
    let newValidity = formData.validity_days

    if (style === 'solar') {
      newTerms = ''
      newPayment = '80% upon approval and 20% after installation, commissioning and testing'
      newValidity = 30
    } else if (style === 'borehole') {
      newTerms = "1. The Authority to Drill Borehole from Water Resources Management Authority (WRMA) and NEMA License are pre-requisites for commencement of Borehole Drilling.\n2. Site preparation for accessibility by the machines is the client's responsibility.\n3. All quoted depths are estimated; actual depth may vary based on geological conditions.\n4. Water quality testing shall be done upon successful drilling."
      newPayment = "The payment structure is as follows:\n• 80% of the total contract sum to be paid for the mobilization of the drilling equipment and personnel to the site.\n• 20% of the total contract sum to be paid upon completion of borehole drilling works and before the installation of casings."
      newValidity = 30
    }

    setFormData({
      ...formData,
      template_style: style,
      terms_conditions: newTerms,
      payment_terms: newPayment,
      validity_days: newValidity
    })
  }

  const handleSectionChange = (sectionId, field, value) => {
    setSections(sections.map(s => s.id === sectionId ? { ...s, [field]: value } : s))
  }

  const handleItemChange = (sectionId, itemId, field, value) => {
    setSections(sections.map(s => {
      if (s.id !== sectionId) return s
      return {
        ...s,
        items: s.items.map(i => i.id === itemId ? { ...i, [field]: value } : i)
      }
    }))
  }

  const addSection = () => {
    setSections([...sections, { id: Date.now().toString(), title: 'New Section', items: [] }])
  }

  const addItem = (sectionId) => {
    setSections(sections.map(s => {
      if (s.id !== sectionId) return s
      return {
        ...s,
        items: [...s.items, { id: Date.now().toString() + Math.random(), description: '', unit: 'Item', quantity: 1, unit_price: 0, discount_type: 'percentage', discount_value: 0, tax_rate: formData.tax_rate }]
      }
    }))
  }

  const removeSection = (sectionId) => {
    setSections(sections.filter(s => s.id !== sectionId))
  }

  const removeItem = (sectionId, itemId) => {
    setSections(sections.map(s => {
      if (s.id !== sectionId) return s
      return { ...s, items: s.items.filter(i => i.id !== itemId) }
    }))
  }

  const applyServiceToItem = (sectionId, itemId, service) => {
    handleItemChange(sectionId, itemId, 'description', service.name)
    handleItemChange(sectionId, itemId, 'unit', service.default_unit)
    handleItemChange(sectionId, itemId, 'unit_price', service.default_price)
  }

  const getAllItems = () => sections.flatMap(s => s.items)
  const totals = calculateQuotationTotals(
    getAllItems(), 
    formData.tax_rate, 
    formData.discount_type, 
    formData.discount_value, 
    formData.shipping, 
    formData.labour, 
    formData.transport, 
    formData.other_charges
  )

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // 1. Get Settings for prefix
      const { data: settings } = await supabase.from('company_settings').select('quotation_prefix').single()
      const prefix = settings?.quotation_prefix || 'DIO-QT'

      // 2. Generate Number if new
      let qNum = editingQuotation?.quotation_number
      if (!qNum) {
        const { count } = await supabase.from('quotations').select('*', { count: 'exact', head: true })
        qNum = generateQuotationNumber(prefix, count || 0)
      }

      // 3. Save Master Record
      const masterData = {
        ...formData,
        quotation_number: qNum,
        subtotal: totals.subtotal,
        discount_amount: totals.discountAmount,
        tax_amount: totals.taxAmount,
        grand_total: totals.grandTotal,
        updated_at: new Date().toISOString()
      }

      let qId = editingQuotation?.id
      if (qId) {
        const { error } = await supabase.from('quotations').update(masterData).eq('id', qId)
        if (error) throw error
        // delete old sections & items (cascade handles items usually if set up, but let's be safe)
        await supabase.from('quotation_sections').delete().eq('quotation_id', qId)
      } else {
        const { data, error } = await supabase.from('quotations').insert([masterData]).select().single()
        if (error) throw error
        qId = data.id
      }

      // 4. Save Sections & Items
      for (let sIdx = 0; sIdx < sections.length; sIdx++) {
        const sec = sections[sIdx]
        const { data: secData, error: secErr } = await supabase.from('quotation_sections').insert([{
          quotation_id: qId,
          title: sec.title,
          order_index: sIdx
        }]).select().single()
        if (secErr) throw secErr

        if (sec.items && sec.items.length > 0) {
          const itemsToInsert = sec.items.map((it, iIdx) => ({
            section_id: secData.id,
            quotation_id: qId,
            description: it.description,
            unit: it.unit,
            quantity: it.quantity,
            unit_price: it.unit_price,
            discount_type: it.discount_type,
            discount_value: it.discount_value,
            tax_rate: it.tax_rate,
            total: calculateLineItemTotal(it),
            order_index: iIdx
          }))
          const { error: itErr } = await supabase.from('quotation_items').insert(itemsToInsert)
          if (itErr) throw itErr
        }
      }

      // 5. Activity log
      await supabase.from('quotation_activity').insert([{
        quotation_id: qId,
        action: editingQuotation ? 'Edited' : 'Created',
        description: `Quotation ${qNum} ${editingQuotation ? 'updated' : 'created'} manually.`
      }])

      onSaved()
    } catch (err) {
      alert(`Error saving: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Details Card */}
      <div className="admin-card">
        <h2 style={{ fontSize: '1.25rem', color: 'white', marginBottom: '1.5rem' }}>Quotation Details</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="admin-input-group">
            <label className="admin-label">Client</label>
            <select className="admin-input" required value={formData.client_id} onChange={e => setFormData({...formData, client_id: e.target.value})}>
              <option value="">-- Select Client --</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.client_name} {c.company ? `(${c.company})` : ''}</option>)}
            </select>
          </div>
          <div className="admin-input-group">
            <label className="admin-label">Project Name</label>
            <input type="text" className="admin-input" required value={formData.project_name} onChange={e => setFormData({...formData, project_name: e.target.value})} />
          </div>
          <div className="admin-input-group">
            <label className="admin-label">Project Location <span style={{ opacity: 0.4, fontSize: '0.65rem' }}>(optional)</span></label>
            <input type="text" className="admin-input" value={formData.project_location} onChange={e => setFormData({...formData, project_location: e.target.value})} placeholder="e.g. Westlands, Nairobi" />
          </div>
          <div className="admin-input-group">
            <label className="admin-label">Reference Number <span style={{ opacity: 0.4, fontSize: '0.65rem' }}>(optional)</span></label>
            <input type="text" className="admin-input" value={formData.reference_number} onChange={e => setFormData({...formData, reference_number: e.target.value})} placeholder="e.g. REF/NBO/2026/EL/042" />
          </div>
          <div className="admin-input-group">
            <label className="admin-label">Currency</label>
            <select className="admin-input" value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})}>
              <option value="KES">KES – Kenyan Shilling</option>
              <option value="USD">USD – US Dollar</option>
              <option value="EUR">EUR – Euro</option>
              <option value="GBP">GBP – British Pound</option>
            </select>
          </div>
          <div className="admin-input-group">
            <label className="admin-label">Validity (Days) <span style={{ opacity: 0.4, fontSize: '0.65rem' }}>(optional)</span></label>
            <input type="number" className="admin-input" value={formData.validity_days} onChange={e => setFormData({...formData, validity_days: e.target.value})} placeholder="30" />
          </div>
          <div className="admin-input-group">
            <label className="admin-label">Status</label>
            <select className="admin-input" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
              <option value="draft">Draft</option>
              <option value="pending approval">Pending Approval</option>
              <option value="sent">Sent</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="admin-input-group">
            <label className="admin-label">Template Style</label>
            <select className="admin-input" value={formData.template_style} onChange={handleTemplateStyleChange}>
              <option value="solar">Solar & Electrical</option>
              <option value="borehole">Borehole Drilling</option>
            </select>
          </div>
        </div>

        {/* Scope of Work */}
        <div className="admin-input-group" style={{ marginTop: '1.25rem' }}>
          <label className="admin-label">Scope of Work <span style={{ opacity: 0.4, fontSize: '0.65rem' }}>(optional — appears as intro paragraph on PDF)</span></label>
          <textarea
            className="admin-input"
            rows="3"
            value={formData.scope_of_work}
            onChange={e => setFormData({...formData, scope_of_work: e.target.value})}
            placeholder="e.g. We hereby submit our quotation for the supply and installation of complete electrical works..."
            style={{ resize: 'vertical' }}
          />
        </div>
      </div>

      {/* Sections & Items Builder */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', color: 'white', margin: 0 }}>Service Builder</h2>
          <button type="button" onClick={addSection} className="btn btn-skew" style={{ background: 'rgba(255,255,255,0.1)', padding: '0.5rem 1rem', fontSize: '0.75rem' }}>
            <span>+ Add Section</span>
          </button>
        </div>

        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {sections.map((sec, sIdx) => (
            <div key={sec.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
                <input type="text" className="admin-input" style={{ flex: 1, fontSize: '1rem', fontWeight: 600, padding: '0.5rem' }} value={sec.title} onChange={e => handleSectionChange(sec.id, 'title', e.target.value)} />
                <button type="button" onClick={() => removeSection(sec.id)} className="btn" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '0.5rem', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Remove</button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <th style={{ padding: '0.5rem' }}>Description</th>
                      <th style={{ padding: '0.5rem', width: '80px' }}>Qty</th>
                      <th style={{ padding: '0.5rem', width: '80px' }}>Unit</th>
                      <th style={{ padding: '0.5rem', width: '120px' }}>Unit Price</th>
                      <th style={{ padding: '0.5rem', width: '100px' }}>Tax %</th>
                      <th style={{ padding: '0.5rem', width: '120px', textAlign: 'right' }}>Total</th>
                      <th style={{ padding: '0.5rem', width: '40px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sec.items.map((item, iIdx) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '0.5rem' }}>
                          <input type="text" className="admin-input" style={{ width: '100%', padding: '0.4rem' }} value={item.description} onChange={e => handleItemChange(sec.id, item.id, 'description', e.target.value)} placeholder="Item description" required />
                          {services.length > 0 && (
                            <select className="admin-input" style={{ width: '100%', padding: '0.2rem', marginTop: '0.25rem', fontSize: '0.7rem', background: 'transparent' }} onChange={e => {
                              const srv = services.find(s => s.id === e.target.value)
                              if (srv) applyServiceToItem(sec.id, item.id, srv)
                            }}>
                              <option value="">Load from library...</option>
                              {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                          )}
                        </td>
                        <td style={{ padding: '0.5rem' }}><input type="number" step="0.01" className="admin-input" style={{ width: '100%', padding: '0.4rem' }} value={item.quantity} onChange={e => handleItemChange(sec.id, item.id, 'quantity', e.target.value)} required /></td>
                        <td style={{ padding: '0.5rem' }}><input type="text" className="admin-input" style={{ width: '100%', padding: '0.4rem' }} value={item.unit} onChange={e => handleItemChange(sec.id, item.id, 'unit', e.target.value)} /></td>
                        <td style={{ padding: '0.5rem' }}><input type="number" step="0.01" className="admin-input" style={{ width: '100%', padding: '0.4rem' }} value={item.unit_price} onChange={e => handleItemChange(sec.id, item.id, 'unit_price', e.target.value)} required /></td>
                        <td style={{ padding: '0.5rem' }}><input type="number" step="0.01" className="admin-input" style={{ width: '100%', padding: '0.4rem' }} value={item.tax_rate} onChange={e => handleItemChange(sec.id, item.id, 'tax_rate', e.target.value)} /></td>
                        <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 600, color: 'white' }}>{formatCurrency(calculateLineItemTotal(item), formData.currency)}</td>
                        <td style={{ padding: '0.5rem' }}><button type="button" onClick={() => removeItem(sec.id, item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem' }}>×</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button type="button" onClick={() => addItem(sec.id)} className="btn" style={{ background: 'transparent', color: 'var(--primary)', border: '1px dashed var(--primary)', padding: '0.5rem 1rem', fontSize: '0.75rem', marginTop: '1rem', width: '100%', borderRadius: '4px', cursor: 'pointer' }}>+ Add Item to Section</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals & Notes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
        <div className="terms-premium-panel">
          <div className="admin-input-group">
            <label className="summary-label">Terms & Conditions</label>
            <textarea className="terms-premium-textarea" rows="4" value={formData.terms_conditions} onChange={e => setFormData({...formData, terms_conditions: e.target.value})} />
          </div>
          <div className="admin-input-group">
            <label className="summary-label">Payment Terms <span style={{ opacity: 0.5, fontSize: '0.75rem' }}>(optional — overrides company default on PDF)</span></label>
            <textarea
              className="terms-premium-textarea"
              rows="3"
              value={formData.payment_terms}
              onChange={e => setFormData({...formData, payment_terms: e.target.value})}
              placeholder="e.g. • 60% deposit upon acceptance&#10;• 40% upon completion"
              style={{ resize: 'vertical' }}
            />
          </div>
          <div className="admin-input-group">
            <label className="summary-label">Notes / Exclusions <span style={{ opacity: 0.5, fontSize: '0.75rem' }}>(optional)</span></label>
            <textarea className="terms-premium-textarea" rows="3" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
          </div>
        </div>

        <div className="summary-premium-card">
          <h3 className="summary-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            Summary
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="summary-row">
              <span className="summary-label">Subtotal</span>
              <span className="summary-value">{formatCurrency(totals.subtotal, formData.currency)}</span>
            </div>
            
            <div className="summary-row">
              <div className="summary-label" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', alignItems: 'center' }}>
                Discount
                <input type="number" className="summary-input" style={{ width: '65px' }} value={formData.discount_value} onChange={e => setFormData({...formData, discount_value: e.target.value})} />
                <select className="summary-input" value={formData.discount_type} onChange={e => setFormData({...formData, discount_type: e.target.value})}><option value="percentage">%</option><option value="fixed">Amt</option></select>
              </div>
              <span className="summary-value" style={{ color: '#ff4b4b' }}>-{formatCurrency(totals.discountAmount, formData.currency)}</span>
            </div>
            
            <div className="summary-row">
              <span className="summary-label">Tax</span>
              <span className="summary-value">{formatCurrency(totals.taxAmount, formData.currency)}</span>
            </div>
            
            <div className="summary-row">
              <span className="summary-label">Shipping</span>
              <input type="number" className="summary-input" style={{ width: '100px', textAlign: 'right' }} value={formData.transport} onChange={e => setFormData({...formData, transport: e.target.value})} />
            </div>
            
            <div className="summary-row">
              <span className="summary-label">Installation</span>
              <input type="number" className="summary-input" style={{ width: '100px', textAlign: 'right' }} value={formData.labour} onChange={e => setFormData({...formData, labour: e.target.value})} />
            </div>

            <div className="summary-row total-row">
              <span className="summary-label" style={{ color: '#00e5ff', fontSize: '1.2rem', fontWeight: 700 }}>GRAND TOTAL</span>
              <span className="summary-value grand-total">{formatCurrency(totals.grandTotal, formData.currency)}</span>
            </div>
          </div>

          <button type="submit" className="btn-premium-create" disabled={loading}>
            {loading ? 'Saving...' : (editingQuotation ? 'Update Quotation' : 'Create Quotation')}
          </button>
        </div>
      </div>
    </form>
  )
}

export default CreateQuotation
