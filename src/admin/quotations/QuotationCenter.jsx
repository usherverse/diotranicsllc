import React, { useState } from 'react'
import { supabase } from '../../config/supabaseClient'
import { generateQuotationNumber } from './quotationUtils'
import { useQuotations } from './useQuotations'
import { useClients } from './useClients'
import QDashboard from './QDashboard'
import QuotationList from './QuotationList'
import CreateQuotation from './CreateQuotation'
import QuotationDetail from './QuotationDetail'
import ClientManager from './ClientManager'
import ServiceLibrary from './ServiceLibrary'
import QSettings from './QSettings'
import '../../styles/admin-qc.css'

const QuotationCenter = ({ session }) => {
  const { quotations, loading: qLoading, refreshQuotations } = useQuotations()
  const { clients, loading: cLoading, refreshClients } = useClients()
  
  const [activeView, setActiveView] = useState('dashboard') // dashboard | create | list | settings | clients | services | detail
  const [selectedQuotationId, setSelectedQuotationId] = useState(null)
  const [editingQuotation, setEditingQuotation] = useState(null)

  const handleSaved = () => {
    refreshQuotations()
    setActiveView('list')
    setEditingQuotation(null)
  }

  const handleEdit = (q) => {
    setEditingQuotation(q)
    setActiveView('create')
  }

  const handleDuplicate = async (quotationId) => {
    try {
      // Fetch full quotation with sections & items
      const { data: original, error } = await supabase
        .from('quotations')
        .select('*, sections:quotation_sections(*, items:quotation_items(*))')
        .eq('id', quotationId)
        .single()
      if (error) throw error

      // Generate new number
      const { data: settings } = await supabase.from('company_settings').select('quotation_prefix').single()
      const prefix = settings?.quotation_prefix || 'DIO-QT'
      const { count } = await supabase.from('quotations').select('*', { count: 'exact', head: true })
      const newNumber = generateQuotationNumber(prefix, count || 0)

      // Insert cloned master (strip id, quotation_number, timestamps)
      const { id, quotation_number, created_at, updated_at, issue_date, sections, client, activity, ...rest } = original
      const { data: newQ, error: insertErr } = await supabase
        .from('quotations')
        .insert([{ ...rest, quotation_number: newNumber, status: 'draft', updated_at: new Date().toISOString() }])
        .select()
        .single()
      if (insertErr) throw insertErr

      // Clone sections & items
      if (sections && sections.length > 0) {
        for (let sIdx = 0; sIdx < sections.length; sIdx++) {
          const sec = sections[sIdx]
          const { data: newSec, error: secErr } = await supabase
            .from('quotation_sections')
            .insert([{ quotation_id: newQ.id, title: sec.title, order_index: sec.order_index }])
            .select()
            .single()
          if (secErr) throw secErr

          if (sec.items && sec.items.length > 0) {
            const itemsToInsert = sec.items.map(it => ({
              section_id: newSec.id,
              quotation_id: newQ.id,
              description: it.description,
              unit: it.unit,
              quantity: it.quantity,
              unit_price: it.unit_price,
              discount_type: it.discount_type,
              discount_value: it.discount_value,
              tax_rate: it.tax_rate,
              total: it.total,
              order_index: it.order_index
            }))
            await supabase.from('quotation_items').insert(itemsToInsert)
          }
        }
      }

      // Log activity
      await supabase.from('quotation_activity').insert([{
        quotation_id: newQ.id,
        action: 'Duplicated',
        description: `Duplicated from ${quotation_number}`
      }])

      refreshQuotations()
      setSelectedQuotationId(newQ.id)
      setActiveView('detail')
    } catch (err) {
      alert('Error duplicating: ' + err.message)
    }
  }

  // When switching views, refresh clients so the dropdown is always current
  const handleNavChange = (id) => {
    if (id === 'create') refreshClients()
    setActiveView(id)
    setEditingQuotation(null)
    setSelectedQuotationId(null)
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <path d="M3 3v18h18M18 17l-5-5-4 4-5-5" /> },
    { id: 'create', label: 'Create Quotation', icon: <path d="M12 5v14M5 12h14" /> },
    { id: 'list', label: 'All Quotations', icon: <path d="M4 6h16M4 12h16M4 18h16" /> },
    { id: 'clients', label: 'Client Database', icon: <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" /> },
    { id: 'services', label: 'Service Library', icon: <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /> },
    { id: 'settings', label: 'Settings', icon: <circle cx="12" cy="12" r="3" /> },
  ]

  return (
    <div className="qc-layout">
      {/* Secondary Sidebar */}
      <div className="qc-sidebar no-print">
        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', marginBottom: '1rem', paddingLeft: '1rem' }}>Quotation Menu</div>
        <div className="qc-sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeView === item.id ? 'active' : ''}`}
              onClick={() => handleNavChange(item.id)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                {item.icon}
              </svg>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {activeView === 'dashboard' && <QDashboard quotations={quotations} clients={clients} />}
        {activeView === 'list' && <QuotationList quotations={quotations} loading={qLoading} onViewQuotation={(id) => { setSelectedQuotationId(id); setActiveView('detail') }} onDuplicate={handleDuplicate} />}
        {activeView === 'create' && <CreateQuotation clients={clients} onSaved={handleSaved} editingQuotation={editingQuotation} onRefreshClients={refreshClients} />}
        {activeView === 'clients' && <ClientManager />}
        {activeView === 'services' && <ServiceLibrary />}
        {activeView === 'settings' && <QSettings />}
        
        {activeView === 'detail' && selectedQuotationId && (
          <QuotationDetail 
            quotationId={selectedQuotationId} 
            onBack={() => setActiveView('list')} 
            onEdit={handleEdit}
            onDuplicate={handleDuplicate}
            onRefreshRequired={refreshQuotations}
          />
        )}
      </div>
    </div>
  )
}

export default QuotationCenter
