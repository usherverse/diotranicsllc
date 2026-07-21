import React, { useEffect, useState } from 'react'
import { formatCurrency } from './quotationUtils'
import { supabase } from '../../config/supabaseClient'
import RubberStamp from '../../components/RubberStamp'
import SolarPDFTemplate from './SolarPDFTemplate'
import BoreholePDFTemplate from './BoreholePDFTemplate'

// Smart router — picks the right template based on quotation.template_style
// Supported values: 'solar' | 'borehole'
const PDFTemplate = ({ quotation, onClose, _overrideSettings }) => {
  const [fetchedSettings, setFetchedSettings] = useState(null)

  useEffect(() => {
    if (_overrideSettings) {
      setFetchedSettings(_overrideSettings)
      return
    }
    const fetchSettings = async () => {
      const { data } = await supabase.from('company_settings').select('*').single()
      if (data) setFetchedSettings(data)
    }
    fetchSettings()
  }, [_overrideSettings])

  const settings = _overrideSettings
    ? { ...fetchedSettings, ..._overrideSettings }
    : fetchedSettings

  if (!quotation || !settings) return <div className="admin-card"><div className="spinner"></div></div>

  const style = (quotation.template_style || 'solar').toLowerCase()

  if (style === 'borehole' || style === 'drilling') {
    return <BoreholePDFTemplate quotation={quotation} settings={settings} onClose={onClose} />
  }

  // Default: Solar
  return <SolarPDFTemplate quotation={quotation} settings={settings} onClose={onClose} />
}

export default PDFTemplate
