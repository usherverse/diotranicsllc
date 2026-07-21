import React, { useState } from 'react'
import PDFTemplate from './PDFTemplate'

/**
 * SampleQuotationPreview
 * 
 * A self-contained demo that renders the PDFTemplate with a realistic 
 * Diotranics quotation sample — an Electrical Installation project.
 * This lets you visually verify the PDF template without a live database record.
 */

const SAMPLE_QUOTATION = {
  quotation_number: 'DIO-QT-2026-0012',
  reference_number: 'REF/NBO/2026/EL/042',
  issue_date: '2026-06-27',
  valid_until: '2026-07-27',
  currency: 'KES',
  project_name: 'ELECTRICAL INSTALLATION — WESTLANDS OFFICE COMPLEX',
  project_location: 'Westlands, Nairobi',
  scope_of_work: `We hereby submit our quotation for the supply and installation of complete electrical works at the above-mentioned premises. The scope covers wiring, distribution boards, lighting, sockets, and all associated electrical accessories as detailed below.`,
  status: 'approved',
  subtotal: 786000,
  discount_amount: 0,
  discount_value: 0,
  discount_type: 'percentage',
  tax_rate: 16,
  tax_amount: 125760,
  transport: 25000,
  labour: 0,
  grand_total: 936760,
  terms_conditions: `1. All materials supplied are brand new and shall meet Kenya Bureau of Standards (KEBS) requirements.\n2. Works to be carried out during normal business hours unless otherwise agreed.\n3. Client to ensure site accessibility and provide a safe working environment.\n4. Diotranics Enterprises Ltd shall not be liable for pre-existing faults or conditions.\n5. Any changes to the scope of work will be subject to a revised quotation.`,
  payment_terms: `• 60% deposit upon acceptance of this quotation and before mobilization.\n• 30% upon completion of rough-in works and inspection.\n• 10% upon final commissioning and client sign-off.`,
  client: {
    client_name: 'Mr. James Kariuki',
    company: 'Kariuki & Associates Ltd',
    email: 'jkariuki@kna.co.ke',
    phone: '+254 722 456 789',
    address: 'P.O. Box 45231 – 00100\nNairobi, Kenya',
  },
  sections: [
    {
      id: 's1',
      title: 'Main Distribution Board (MDB) & Sub-Distribution',
      order_index: 0,
      items: [
        { id: 'i1', description: 'Supply & install 3-phase 200A main DB complete with RCCB, MCBs and surge protection', quantity: 1, unit: 'Set', unit_price: 145000, total: 145000, order_index: 0 },
        { id: 'i2', description: 'Supply & install 63A single-phase sub-distribution board (8-way) complete with MCBs', quantity: 4, unit: 'Set', unit_price: 28000, total: 112000, order_index: 1 },
        { id: 'i3', description: '35mm² armoured power cable (main feed from utility meter to MDB)', quantity: 25, unit: 'Meters', unit_price: 1200, total: 30000, order_index: 2 },
        { id: 'i4', description: '10mm² PVC insulated cable for sub-circuits (supply & installation)', quantity: 120, unit: 'Meters', unit_price: 380, total: 45600, order_index: 3 },
      ]
    },
    {
      id: 's2',
      title: 'Lighting Installation',
      order_index: 1,
      items: [
        { id: 'i5', description: 'Supply & install LED recessed panel lights 60x60cm 40W (offices)', quantity: 48, unit: 'Pcs', unit_price: 3800, total: 182400, order_index: 0 },
        { id: 'i6', description: 'Supply & install LED strip lighting (corridors & reception)', quantity: 80, unit: 'Meters', unit_price: 1200, total: 96000, order_index: 1 },
        { id: 'i7', description: 'Supply & install waterproof LED battens 36W (ablutions & store)', quantity: 12, unit: 'Pcs', unit_price: 2200, total: 26400, order_index: 2 },
        { id: 'i8', description: '2.5mm² wiring for lighting circuits (supply & installation)', quantity: 200, unit: 'Meters', unit_price: 180, total: 36000, order_index: 3 },
      ]
    },
    {
      id: 's3',
      title: 'Power Sockets & Accessories',
      order_index: 2,
      items: [
        { id: 'i9', description: 'Supply & install 13A double switched socket outlets (office use)', quantity: 60, unit: 'Pcs', unit_price: 950, total: 57000, order_index: 0 },
        { id: 'i10', description: 'Supply & install 13A single switched socket outlets (general areas)', quantity: 20, unit: 'Pcs', unit_price: 650, total: 13000, order_index: 1 },
        { id: 'i11', description: 'Supply & install USB-A/C combination socket outlets (workstations)', quantity: 24, unit: 'Pcs', unit_price: 1800, total: 43200, order_index: 2 },
      ]
    },
  ]
}

const SampleQuotationPreview = () => {
  const [style, setStyle] = useState('solar')

  return (
    <>
      <PDFTemplate 
        quotation={{ ...SAMPLE_QUOTATION, template_style: style }} 
        onClose={() => window.history.back()} 
        _overrideSettings={{
          address: 'Westlands Business Park, 3rd Floor, Nairobi',
          kra_pin: 'P051234567M',
          bank_name: 'COOPERATIVE BANK OF KENYA',
          bank_account: '01192946387900',
          bank_branch: 'Westlands Branch',
          bank_code: '11000',
          payment_instructions: 'BRANCH CODE: 11087\nBANK CODE: 11000\n\nPlease include the quotation number as the payment reference.',
          footer_disclaimer: 'Prices are subject to change based on prevailing market rates for materials, especially in the event of delays in project execution.',
        }}
      />
      
      {/* Template Switcher (Sticky at bottom, hidden when printing) */}
      <div className="no-print" style={{
        position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
        padding: '0.5rem', borderRadius: '50px', display: 'flex', gap: '0.5rem', zIndex: 10000,
        boxShadow: '0 10px 25px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)'
      }}>
        {['solar', 'borehole'].map(s => (
          <button
            key={s}
            onClick={() => setStyle(s)}
            style={{
              padding: '0.5rem 1.5rem', borderRadius: '40px', border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: '0.85rem', textTransform: 'capitalize',
              background: style === s ? '#3b82f6' : 'transparent',
              color: style === s ? 'white' : 'rgba(255,255,255,0.7)',
              transition: 'all 0.2s'
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </>
  )
}

export default SampleQuotationPreview
