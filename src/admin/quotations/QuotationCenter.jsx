import React, { useState } from 'react'
import { useQuotations } from './useQuotations'
import { useClients } from './useClients'
import QDashboard from './QDashboard'
import QuotationList from './QuotationList'
import CreateQuotation from './CreateQuotation'
import QuotationDetail from './QuotationDetail'
import ClientManager from './ClientManager'
import ServiceLibrary from './ServiceLibrary'
import QSettings from './QSettings'

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
    <div style={{ display: 'flex', gap: '2rem', height: '100%', alignItems: 'flex-start' }}>
      {/* Secondary Sidebar */}
      <div className="admin-card no-print" style={{ width: '250px', padding: '1rem', flexShrink: 0, position: 'sticky', top: '100px' }}>
        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', marginBottom: '1rem', paddingLeft: '1rem' }}>Quotation Menu</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeView === item.id ? 'active' : ''}`}
              onClick={() => handleNavChange(item.id)}
              style={{ padding: '0.75rem 1rem', fontSize: '0.75rem' }}
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
        {activeView === 'list' && <QuotationList quotations={quotations} loading={qLoading} onViewQuotation={(id) => { setSelectedQuotationId(id); setActiveView('detail') }} />}
        {activeView === 'create' && <CreateQuotation clients={clients} onSaved={handleSaved} editingQuotation={editingQuotation} />}
        {activeView === 'clients' && <ClientManager />}
        {activeView === 'services' && <ServiceLibrary />}
        {activeView === 'settings' && <QSettings />}
        
        {activeView === 'detail' && selectedQuotationId && (
          <QuotationDetail 
            quotationId={selectedQuotationId} 
            onBack={() => setActiveView('list')} 
            onEdit={handleEdit}
            onRefreshRequired={refreshQuotations}
          />
        )}
      </div>
    </div>
  )
}

export default QuotationCenter
