import React, { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../../config/supabaseClient'
import { generateQuotationNumber, calculateQuotationTotals, calculateLineItemTotal, formatCurrency } from './quotationUtils'

const DRAFT_KEY = 'quotation_draft_autosave'

const CreateQuotation = ({ clients, onSaved, editingQuotation = null, onRefreshClients }) => {
  const [loading, setLoading] = useState(false)
  const [services, setServices] = useState([])
  const [draftSavedAt, setDraftSavedAt] = useState(null)
  const [draftRestored, setDraftRestored] = useState(false)

  // Inline client creation state
  const [showAddClientModal, setShowAddClientModal] = useState(false)
  const [clientSaving, setClientSaving] = useState(false)
  const [newClientData, setNewClientData] = useState({
    client_name: '', company: '', email: '', phone: '', address: '', notes: ''
  })

  // Bulk add services state
  const [bulkAddSectionId, setBulkAddSectionId] = useState(null)
  const [bulkSearch, setBulkSearch] = useState('')
  const [bulkCategory, setBulkCategory] = useState('All')
  const [selectedServiceIds, setSelectedServiceIds] = useState([])

  // Template states
  const [templates, setTemplates] = useState([])
  const [saveAsTemplate, setSaveAsTemplate] = useState(false)
  const [templateName, setTemplateName] = useState('')

  const handleBulkAdd = (sectionId) => {
    const selected = services.filter(s => selectedServiceIds.includes(s.id))
    setSections(sections.map(s => {
      if (s.id !== sectionId) return s
      const newItems = selected.map(srv => ({
        id: Date.now().toString() + Math.random(),
        description: srv.name,
        unit: srv.default_unit || 'Item',
        quantity: 1,
        unit_price: srv.default_price || 0,
        discount_type: 'percentage',
        discount_value: 0,
        tax_rate: formData.tax_rate
      }))
      return {
        ...s,
        items: [...s.items, ...newItems]
      }
    }))
    setBulkAddSectionId(null)
    setSelectedServiceIds([])
  }

  const handleAddClient = async (e) => {
    e.preventDefault()
    if (!newClientData.client_name.trim()) return
    setClientSaving(true)
    try {
      const { data, error } = await supabase
        .from('qt_clients')
        .insert([newClientData])
        .select()
        .single()
      if (error) throw error

      if (onRefreshClients) await onRefreshClients()
      setFormData(prev => ({ ...prev, client_id: data.id }))
      setShowAddClientModal(false)
      setNewClientData({ client_name: '', company: '', email: '', phone: '', address: '', notes: '' })
    } catch (err) {
      alert("Error adding client: " + err.message)
    } finally {
      setClientSaving(false)
    }
  }
  
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
    fetchTemplates()
    if (editingQuotation) {
      // populate form from editing quotation (no draft restore when editing)
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
    } else {
      // Check for saved draft
      try {
        const saved = localStorage.getItem(DRAFT_KEY)
        if (saved) {
          const { formData: savedForm, sections: savedSections, savedAt } = JSON.parse(saved)
          const age = (Date.now() - new Date(savedAt).getTime()) / 1000 / 60 // minutes
          if (age < 1440 && window.confirm(`Restore unsaved draft from ${new Date(savedAt).toLocaleString()}?`)) {
            setFormData(savedForm)
            setSections(savedSections)
            setDraftRestored(true)
          } else if (age >= 1440) {
            localStorage.removeItem(DRAFT_KEY)
          }
        }
      } catch (_) {}
    }
  }, [editingQuotation])

  // Auto-save draft every 30s (new quotation only)
  useEffect(() => {
    if (editingQuotation) return
    const id = setInterval(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ formData, sections, savedAt: new Date().toISOString() }))
        setDraftSavedAt(new Date())
        setTimeout(() => setDraftSavedAt(null), 2500)
      } catch (_) {}
    }, 30000)
    return () => clearInterval(id)
  }, [formData, sections, editingQuotation])

  const fetchServices = async () => {
    const { data } = await supabase.from('qt_services').select('*').order('name')
    if (data) setServices(data)
  }

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('quotations')
        .select(`
          *,
          sections:quotation_sections (
            *,
            items:quotation_items (*)
          )
        `)
        .eq('is_template', true)
        .order('template_name', { ascending: true })
      if (error) throw error
      setTemplates(data || [])
    } catch (err) {
      console.error("Error loading templates:", err)
    }
  }

  const handleLoadTemplate = (templateId) => {
    if (!templateId) return
    const tmpl = templates.find(t => t.id === templateId)
    if (!tmpl) return
    if (!window.confirm(`Load template "${tmpl.template_name}"? This will replace any sections/items you've currently built.`)) return

    setFormData(prev => ({
      ...prev,
      project_name: tmpl.project_name || '',
      currency: tmpl.currency || 'KES',
      tax_type: tmpl.tax_type || 'VAT',
      tax_rate: tmpl.tax_rate || 16,
      template_style: tmpl.template_style || 'solar',
      validity_days: tmpl.validity_days || 30,
      discount_type: tmpl.discount_type || 'percentage',
      discount_value: tmpl.discount_value || 0,
      shipping: tmpl.shipping || 0,
      labour: tmpl.labour || 0,
      transport: tmpl.transport || 0,
      other_charges: tmpl.other_charges || 0,
      scope_of_work: tmpl.scope_of_work || '',
      payment_terms: tmpl.payment_terms || '',
      notes: tmpl.notes || '',
      terms_conditions: tmpl.terms_conditions || '',
    }))

    if (tmpl.sections && tmpl.sections.length > 0) {
      const sortedSections = [...tmpl.sections].sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
      setSections(sortedSections.map(s => {
        const sortedItems = s.items ? [...s.items].sort((a, b) => (a.order_index || 0) - (b.order_index || 0)) : []
        return {
          id: Date.now().toString() + Math.random(),
          title: s.title,
          items: sortedItems.map(it => ({
            id: Date.now().toString() + Math.random(),
            description: it.description,
            unit: it.unit,
            quantity: it.quantity,
            unit_price: it.unit_price,
            discount_type: it.discount_type,
            discount_value: it.discount_value,
            tax_rate: it.tax_rate
          }))
        }
      }))
    }
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
    // Coerce any empty-string numeric field to 0
    const safeNum = (v) => { const n = parseFloat(v); return isNaN(n) ? 0 : n }
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

      // Helper to save sections & items
      const saveSectionsAndItems = async (targetQId, sectionsToSave) => {
        for (let sIdx = 0; sIdx < sectionsToSave.length; sIdx++) {
          const sec = sectionsToSave[sIdx]
          const { data: secData, error: secErr } = await supabase.from('quotation_sections').insert([{
            quotation_id: targetQId,
            title: sec.title,
            order_index: sIdx
          }]).select().single()
          if (secErr) throw secErr

          if (sec.items && sec.items.length > 0) {
            const itemsToInsert = sec.items.map((it, iIdx) => ({
              section_id: secData.id,
              quotation_id: targetQId,
              description: it.description || '',
              unit: it.unit || 'Item',
              quantity: safeNum(it.quantity) || 1,
              unit_price: safeNum(it.unit_price),
              discount_type: it.discount_type || 'percentage',
              discount_value: safeNum(it.discount_value),
              tax_rate: safeNum(it.tax_rate),
              total: safeNum(calculateLineItemTotal(it)),
              order_index: iIdx
            }))
            const { error: itErr } = await supabase.from('quotation_items').insert(itemsToInsert)
            if (itErr) throw itErr
          }
        }
      }

      // 3. Save Master Record
      const masterData = {
        ...formData,
        // Sanitise all numeric fields — empty string '' breaks Postgres numeric columns
        tax_rate: safeNum(formData.tax_rate),
        validity_days: safeNum(formData.validity_days),
        discount_value: safeNum(formData.discount_value),
        shipping: safeNum(formData.shipping),
        labour: safeNum(formData.labour),
        transport: safeNum(formData.transport),
        other_charges: safeNum(formData.other_charges),
        quotation_number: qNum,
        subtotal: safeNum(totals.subtotal),
        discount_amount: safeNum(totals.discountAmount),
        tax_amount: safeNum(totals.taxAmount),
        grand_total: safeNum(totals.grandTotal),
        updated_at: new Date().toISOString()
      }

      let qId = editingQuotation?.id
      if (qId) {
        const { error } = await supabase.from('quotations').update(masterData).eq('id', qId)
        if (error) throw error
        await supabase.from('quotation_sections').delete().eq('quotation_id', qId)
      } else {
        const { data, error } = await supabase.from('quotations').insert([masterData]).select().single()
        if (error) throw error
        qId = data.id
      }

      // 4. Save Sections & Items
      await saveSectionsAndItems(qId, sections)

      // 5. Save as Template if checked
      if (saveAsTemplate && templateName.trim() && !editingQuotation?.is_template) {
        const { id, quotation_number, created_at, updated_at, ...rest } = masterData
        const templateMaster = {
          ...rest,
          quotation_number: `TEMPLATE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          is_template: true,
          template_name: templateName,
          client_id: null,
          status: 'draft',
          updated_at: new Date().toISOString()
        }
        const { data: tData, error: tErr } = await supabase.from('quotations').insert([templateMaster]).select().single()
        if (!tErr) {
          await saveSectionsAndItems(tData.id, sections)
        }
      }

      // 6. Activity log
      await supabase.from('quotation_activity').insert([{
        quotation_id: qId,
        action: editingQuotation ? 'Edited' : 'Created',
        description: `Quotation ${qNum} ${editingQuotation ? 'updated' : 'created'} manually.`
      }])

      // Clear draft on success
      try { localStorage.removeItem(DRAFT_KEY) } catch (_) {}
      onSaved()
    } catch (err) {
      alert(`Error saving: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Sticky floating live-total widget */}
      <div style={{
        position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 100,
        background: 'linear-gradient(135deg, rgba(10,20,40,0.97) 0%, rgba(0,20,50,0.97) 100%)',
        border: '1px solid rgba(0,229,255,0.25)', borderRadius: '16px',
        padding: '1rem 1.5rem', minWidth: '220px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,229,255,0.08)',
        backdropFilter: 'blur(16px)',
        display: 'flex', flexDirection: 'column', gap: '0.35rem'
      }}>
        <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', marginBottom: '0.25rem' }}>Live Total</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)' }}>
          <span>Subtotal</span><span>{formatCurrency(totals.subtotal, formData.currency)}</span>
        </div>
        {totals.discountAmount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#ff4b4b' }}>
            <span>Discount</span><span>-{formatCurrency(totals.discountAmount, formData.currency)}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)' }}>
          <span>Tax</span><span>{formatCurrency(totals.taxAmount, formData.currency)}</span>
        </div>
        <div style={{ borderTop: '1px solid rgba(0,229,255,0.2)', marginTop: '0.25rem', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>TOTAL</span>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#00e5ff', letterSpacing: '-0.02em' }}>{formatCurrency(totals.grandTotal, formData.currency)}</span>
        </div>
        <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)', textAlign: 'right' }}>{getAllItems().length} item{getAllItems().length !== 1 ? 's' : ''}</div>
        {draftSavedAt && (
          <div style={{ fontSize: '0.62rem', color: '#34d399', textAlign: 'right', marginTop: '0.2rem', animation: 'fadeIn 0.3s ease' }}>✓ Draft auto-saved</div>
        )}
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Details Card */}
      <div className="admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', color: 'white', margin: 0 }}>Quotation Details</h2>
          {templates.length > 0 && !editingQuotation && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Load Template:</span>
              <select
                className="admin-input"
                defaultValue=""
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.7rem', minWidth: '200px' }}
                onChange={e => handleLoadTemplate(e.target.value)}
              >
                <option value="">-- Choose Template --</option>
                {templates.map(t => <option key={t.id} value={t.id}>{t.template_name}</option>)}
              </select>
            </div>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="admin-input-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="admin-label" style={{ marginBottom: 0 }}>Client</label>
              <button
                type="button"
                onClick={() => setShowAddClientModal(true)}
                style={{
                  background: 'none', border: 'none', color: '#00e5ff',
                  fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', padding: 0,
                  textTransform: 'uppercase', letterSpacing: '0.05em'
                }}
              >
                + Add Client
              </button>
            </div>
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
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" onClick={() => addItem(sec.id)} className="btn" style={{ flex: 1, background: 'transparent', color: 'rgba(255,255,255,0.6)', border: '1px dashed rgba(255,255,255,0.2)', padding: '0.5rem 1rem', fontSize: '0.75rem', borderRadius: '4px', cursor: 'pointer' }}>
                    + Add Custom Item
                  </button>
                  <button type="button" onClick={() => setBulkAddSectionId(sec.id)} className="btn btn-skew" style={{ flex: 1, background: 'rgba(0,229,255,0.08)', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.25)', padding: '0.5rem 1rem', fontSize: '0.75rem', borderRadius: '4px', cursor: 'pointer' }}>
                    <span>⚡ Bulk Add from Library</span>
                  </button>
                </div>
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
              <input
                type="number" min="0" className="summary-input"
                style={{ width: '100px', textAlign: 'right' }}
                value={formData.transport}
                onChange={e => setFormData({...formData, transport: e.target.value === '' ? '' : parseFloat(e.target.value) || 0})}
                onBlur={e => setFormData(prev => ({...prev, transport: parseFloat(e.target.value) || 0}))}
              />
            </div>

            <div className="summary-row">
              <span className="summary-label">Installation</span>
              <input
                type="number" min="0" className="summary-input"
                style={{ width: '100px', textAlign: 'right' }}
                value={formData.labour}
                onChange={e => setFormData({...formData, labour: e.target.value === '' ? '' : parseFloat(e.target.value) || 0})}
                onBlur={e => setFormData(prev => ({...prev, labour: parseFloat(e.target.value) || 0}))}
              />
            </div>

            <div className="summary-row total-row">
              <span className="summary-label" style={{ color: '#00e5ff', fontSize: '1.2rem', fontWeight: 700 }}>GRAND TOTAL</span>
              <span className="summary-value grand-total">{formatCurrency(totals.grandTotal, formData.currency)}</span>
            </div>
          </div>

          {!editingQuotation && (
            <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '0.85rem 1rem', marginTop: '0.5rem', background: 'rgba(0,0,0,0.2)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', marginBottom: saveAsTemplate ? '0.75rem' : 0 }}>
                <input
                  type="checkbox"
                  checked={saveAsTemplate}
                  onChange={e => setSaveAsTemplate(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#00e5ff' }}
                />
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
                  Save as reusable template
                </span>
              </label>
              {saveAsTemplate && (
                <input
                  type="text"
                  className="admin-input"
                  placeholder="Template name, e.g. Standard House Wiring"
                  value={templateName}
                  onChange={e => setTemplateName(e.target.value)}
                  style={{ marginTop: 0 }}
                  required={saveAsTemplate}
                />
              )}
            </div>
          )}

          <button type="submit" className="btn-premium-create" disabled={loading}>
            {loading ? 'Saving...' : (editingQuotation ? 'Update Quotation' : 'Create Quotation')}
          </button>
        </div>
      </div>
    </form>

    {/* Inline Add Client Modal */}
    {showAddClientModal && (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000,
        background: 'rgba(5, 10, 20, 0.85)', backdropFilter: 'blur(8px)',
        display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(20,25,40,0.98) 0%, rgba(10,15,30,0.98) 100%)',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px',
          width: '100%', maxWidth: '560px', padding: '2rem',
          boxShadow: '0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,229,255,0.1)',
          display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'scaleUp 0.25s ease-out'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'white', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Create New Client</h3>
            <button
              type="button"
              onClick={() => setShowAddClientModal(false)}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '1.5rem', cursor: 'pointer', padding: 0 }}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleAddClient} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="admin-input-group">
                <label className="admin-label">Full Name</label>
                <input
                  type="text"
                  className="admin-input"
                  required
                  value={newClientData.client_name}
                  onChange={e => setNewClientData({...newClientData, client_name: e.target.value})}
                  placeholder="e.g. John Doe"
                />
              </div>
              <div className="admin-input-group">
                <label className="admin-label">Company (Optional)</label>
                <input
                  type="text"
                  className="admin-input"
                  value={newClientData.company}
                  onChange={e => setNewClientData({...newClientData, company: e.target.value})}
                  placeholder="e.g. Diotranics Ltd"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="admin-input-group">
                <label className="admin-label">Email</label>
                <input
                  type="email"
                  className="admin-input"
                  value={newClientData.email}
                  onChange={e => setNewClientData({...newClientData, email: e.target.value})}
                  placeholder="name@domain.com"
                />
              </div>
              <div className="admin-input-group">
                <label className="admin-label">Phone</label>
                <input
                  type="text"
                  className="admin-input"
                  value={newClientData.phone}
                  onChange={e => setNewClientData({...newClientData, phone: e.target.value})}
                  placeholder="+254..."
                />
              </div>
            </div>

            <div className="admin-input-group">
              <label className="admin-label">Address</label>
              <input
                type="text"
                className="admin-input"
                value={newClientData.address}
                onChange={e => setNewClientData({...newClientData, address: e.target.value})}
                placeholder="e.g. P.O Box 123, Nairobi"
              />
            </div>

            <div className="admin-input-group">
              <label className="admin-label">Notes (Internal)</label>
              <textarea
                className="admin-input"
                rows="2"
                value={newClientData.notes}
                onChange={e => setNewClientData({...newClientData, notes: e.target.value})}
                placeholder="Client notes..."
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem' }}>
              <button
                type="button"
                onClick={() => setShowAddClientModal(false)}
                className="btn btn-skew"
                style={{ flex: 1, background: 'rgba(255,255,255,0.06)' }}
              >
                <span>Cancel</span>
              </button>
              <button
                type="submit"
                disabled={clientSaving}
                className="btn btn-primary btn-skew"
                style={{ flex: 1 }}
              >
                <span>{clientSaving ? 'Saving...' : 'Save Client'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* Bulk Add Services Modal */}
    {bulkAddSectionId && (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000,
        background: 'rgba(5, 10, 20, 0.85)', backdropFilter: 'blur(8px)',
        display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(20,25,40,0.98) 0%, rgba(10,15,30,0.98) 100%)',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px',
          width: '100%', maxWidth: '640px', padding: '2rem',
          boxShadow: '0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,229,255,0.1)',
          display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '90vh'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'white', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Bulk Add from Service Library
            </h3>
            <button
              type="button"
              onClick={() => { setBulkAddSectionId(null); setSelectedServiceIds([]) }}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '1.5rem', cursor: 'pointer', padding: 0 }}
            >
              ×
            </button>
          </div>

          {/* Search and filter category chips */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input
              type="text"
              className="admin-input"
              placeholder="Search library..."
              value={bulkSearch}
              onChange={e => setBulkSearch(e.target.value)}
              style={{ padding: '0.5rem 1rem', width: '100%' }}
            />
            
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {['All', 'Electrical', 'Solar', 'Borehole', 'Civil', 'Other'].map(cat => {
                const active = bulkCategory === cat
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setBulkCategory(cat)}
                    style={{
                      padding: '0.2rem 0.65rem', borderRadius: '99px', fontSize: '0.65rem', fontWeight: 700,
                      cursor: 'pointer', border: active ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
                      background: active ? 'rgba(0,229,255,0.12)' : 'transparent',
                      color: active ? 'var(--primary)' : 'rgba(255,255,255,0.5)',
                      textTransform: 'uppercase'
                    }}
                  >
                    {cat}
                  </button>
                )
              })}
            </div>
          </div>

          {/* List of services with checkboxes */}
          <div style={{ overflowY: 'auto', flex: 1, border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', background: 'rgba(0,0,0,0.2)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', color: 'white' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', textAlign: 'left', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.6rem 1rem', width: '40px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      style={{ cursor: 'pointer' }}
                      checked={
                        services.length > 0 &&
                        services.filter(s =>
                          (bulkCategory === 'All' || s.category === bulkCategory) &&
                          s.name.toLowerCase().includes(bulkSearch.toLowerCase())
                        ).every(s => selectedServiceIds.includes(s.id))
                      }
                      onChange={(e) => {
                        const itemsInFilter = services.filter(s =>
                          (bulkCategory === 'All' || s.category === bulkCategory) &&
                          s.name.toLowerCase().includes(bulkSearch.toLowerCase())
                        )
                        if (e.target.checked) {
                          setSelectedServiceIds(prev => Array.from(new Set([...prev, ...itemsInFilter.map(x => x.id)])))
                        } else {
                          setSelectedServiceIds(prev => prev.filter(id => !itemsInFilter.some(x => x.id === id)))
                        }
                      }}
                    />
                  </th>
                  <th style={{ padding: '0.6rem 1rem' }}>Service Name</th>
                  <th style={{ padding: '0.6rem 1rem' }}>Category</th>
                  <th style={{ padding: '0.6rem 1rem', textAlign: 'right' }}>Default Price</th>
                </tr>
              </thead>
              <tbody>
                {services
                  .filter(s =>
                    (bulkCategory === 'All' || s.category === bulkCategory) &&
                    (s.name.toLowerCase().includes(bulkSearch.toLowerCase()) || (s.description || '').toLowerCase().includes(bulkSearch.toLowerCase()))
                  )
                  .map(s => (
                    <tr
                      key={s.id}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', cursor: 'pointer' }}
                      onClick={() => {
                        setSelectedServiceIds(prev =>
                          prev.includes(s.id) ? prev.filter(x => x !== s.id) : [...prev, s.id]
                        )
                      }}
                    >
                      <td style={{ padding: '0.6rem 1rem', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          style={{ cursor: 'pointer' }}
                          checked={selectedServiceIds.includes(s.id)}
                          onChange={() => {
                            setSelectedServiceIds(prev =>
                              prev.includes(s.id) ? prev.filter(x => x !== s.id) : [...prev, s.id]
                        )
                      }}
                    />
                  </td>
                  <td style={{ padding: '0.6rem 1rem', fontWeight: 600 }}>{s.name}</td>
                  <td style={{ padding: '0.6rem 1rem', color: 'var(--primary)' }}>{s.category}</td>
                  <td style={{ padding: '0.6rem 1rem', textAlign: 'right' }}>KES {Number(s.default_price).toLocaleString()}</td>
                </tr>
              ))}
                {services.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>
                      No services in library.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={() => { setBulkAddSectionId(null); setSelectedServiceIds([]) }}
              className="btn btn-skew"
              style={{ flex: 1, background: 'rgba(255,255,255,0.06)' }}
            >
              <span>Cancel</span>
            </button>
            <button
              type="button"
              onClick={() => handleBulkAdd(bulkAddSectionId)}
              disabled={selectedServiceIds.length === 0}
              className="btn btn-primary btn-skew"
              style={{ flex: 1 }}
            >
              <span>Add Selected ({selectedServiceIds.length})</span>
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
  )
}

export default CreateQuotation
