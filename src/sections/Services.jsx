import React, { useState } from 'react'

const Services = () => {
  const [activeTile, setActiveTile] = useState(null)
  // Default first category open on mobile so content is visible immediately
  const [expandedCategory, setExpandedCategory] = useState('borehole')
  
  const categoryLabels = {
    borehole: 'Borehole Services',
    solar: 'Solar Services',
    electrical: 'Electrical Services'
  }

  const boreholeServices = [
    {
      id: 'drilling',
      title: 'Borehole Drilling',
      shortDesc: 'Advanced rotary and percussion drilling techniques to access groundwater at optimal depths.',
      detail: 'We deploy state-of-the-art rotary and percussion rigs to reach water-bearing formations at depths from 30m to 300m. Every borehole is drilled using hydrogeological data to maximise yield. Full casing, gravel packing, and surface sanitation are included as standard.',
      bullets: ['Depths up to 300m', 'Casing & lining included', 'Water yield testing on completion', 'Pump sizing consultation'],
      icon: <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
    },
    {
      id: 'flushing',
      title: 'Borehole Flushing',
      shortDesc: 'High-pressure flushing to remove debris and restore full borehole capacity and water quality.',
      detail: 'High-pressure jetting and airlifting to dislodge sediment, biofilm, and mineral deposits from the borehole casing and screens. Restores full flow rate, removes contamination risk, and extends the operational life of the borehole significantly.',
      bullets: ['Restores original flow capacity', 'Removes sediment & biofilm', 'Chemical disinfection included', 'Post-flush water quality test'],
      icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    },
    {
      id: 'tank',
      title: 'Tower Tank Installation',
      shortDesc: 'Elevated water storage tanks for gravity-fed distribution systems at residential and commercial sites.',
      detail: 'Design and erection of elevated galvanised or stainless steel tank towers, providing gravity-fed water pressure to buildings without relying on pumps. Suitable for homes, schools, farms, and commercial compounds.',
      bullets: ['Capacities from 1,000L to 50,000L', 'Galvanised or stainless steel options', 'Structural engineering included', 'Overflow & float valve fitted'],
      icon: <><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></>
    },
    {
      id: 'plumbing',
      title: 'Plumbing Works',
      shortDesc: 'Full plumbing installations and repairs, from internal piping to water distribution networks.',
      detail: 'Comprehensive internal and external plumbing for new builds and retrofits. We handle everything from underground mains piping to internal fittings, bathroom installations, and full water reticulation layouts for residential and commercial properties.',
      bullets: ['New installations & retrofits', 'PPRC, uPVC & copper piping', 'Bathroom & kitchen fittings', 'Leakage detection & repair'],
      icon: <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    },
    {
      id: 'survey',
      title: 'Geological Survey',
      shortDesc: 'Site assessment and hydrogeological surveys to identify the best drilling locations and water yield potential.',
      detail: 'Before drilling, our geophysical team conducts Vertical Electrical Sounding (VES) and resistivity surveys to map subsurface layers and pinpoint optimal drilling targets. This dramatically reduces dry-hole risk and improves water yield estimates.',
      bullets: ['VES resistivity profiling', 'Aquifer depth & yield prediction', 'Site feasibility report provided', 'Reduces dry-hole risk by 80%+'],
      icon: <><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>
    }
  ]

  const solarServices = [
    {
      id: 'design',
      title: 'Solar System Design',
      shortDesc: 'Custom solar system engineering tailored to your energy needs, budget, and site conditions.',
      detail: 'Our engineers conduct a full site survey — roof orientation, shading analysis, load assessment — and deliver a custom system design. We size panels, inverters, and battery banks precisely for your consumption profile, maximising ROI and energy independence.',
      bullets: ['On-site load & shade analysis', 'Custom single-line diagrams', 'Inverter & battery sizing', 'ROI & payback period report'],
      icon: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M3 15h18M9 3v18M15 3v18" /></>
    },
    {
      id: 'supply',
      title: 'Solar Sales & Supply',
      shortDesc: 'Quality solar panels, inverters, batteries, and accessories sourced from top-tier manufacturers.',
      detail: 'We supply Tier-1 solar panels, hybrid and off-grid inverters, lithium and lead-acid batteries, charge controllers, and full BOS (balance of system) components. All products are sourced from certified manufacturers and come with full warranties.',
      bullets: ['Tier-1 solar panels (Jinko, Longi, etc.)', 'Hybrid & off-grid inverters', 'Lithium LiFePO4 batteries', 'Full BOS components supplied'],
      icon: <><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></>
    },
    {
      id: 'fabrication',
      title: 'Solar Structures & Fabrication',
      shortDesc: 'Custom-fabricated mounting structures and racking systems for rooftop and ground-mount installations.',
      detail: 'We design and fabricate custom mounting structures for pitched roofs, flat roofs, and ground-mount arrays. All metalwork is hot-dip galvanised or powder-coated for Kenya\'s climate. We also build carport canopies and agri-solar shade structures.',
      bullets: ['Hot-dip galvanised mild steel', 'Rooftop, ground & carport mounts', 'Engineered for wind & seismic loads', 'Custom fabrication available'],
      icon: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>
    },
    {
      id: 'lighting',
      title: 'Solar Street Lighting',
      shortDesc: 'Standalone solar-powered street lights for roads, estates, parking areas, and public spaces.',
      detail: 'Fully autonomous solar street lights requiring no grid connection. Each unit integrates a panel, lithium battery, LED luminaire, and smart controller. Programmable dusk-to-dawn or motion-sensor operation. Ideal for estate roads, parking lots, and off-grid communities.',
      bullets: ['All-in-one or split-type units', 'Smart PIR motion sensing', '3–5 night autonomy backup', 'Suitable for off-grid communities'],
      icon: <><circle cx="12" cy="8" r="4" /><line x1="12" y1="12" x2="12" y2="17" /><rect x="9" y="16" width="6" height="2" rx="1" /></>
    }
  ]

  const electricalServices = [
    {
      id: 'gen',
      title: 'Generator Installation & Maintenance',
      shortDesc: 'Standby and prime generators installed and serviced to ensure uninterrupted power supply.',
      detail: 'Supply, installation, and commissioning of diesel and petrol generators from 2kVA to 1MVA for standby and prime power applications. We handle ATS (Automatic Transfer Switch) integration, load testing, and scheduled maintenance contracts.',
      bullets: ['2kVA – 1MVA range', 'ATS / auto-changeover included', 'Load bank testing on handover', 'Annual service contracts available'],
      icon: <><rect x="6" y="2" width="12" height="20" rx="2" /><path d="M10 6h4M10 10h4M10 14h4" /></>
    },
    {
      id: 'wiring',
      title: 'Domestic & Industrial Wiring',
      shortDesc: 'Complete wiring and rewiring for homes, offices, factories, and industrial facilities to code.',
      detail: 'Full electrical wiring for residential homes, apartment blocks, office buildings, warehouses, and factories. We follow Kenya Power standards and IEE wiring regulations, ensuring every installation passes inspection and is safe for occupancy.',
      bullets: ['Residential to heavy industrial', 'Consumer unit & DB installation', 'IEE & KEBS compliant work', 'Completion certificates issued'],
      icon: <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    },
    {
      id: 'control',
      title: 'Power Control Systems',
      shortDesc: 'Design and installation of switchgear, control panels, and distribution boards for power management.',
      detail: 'Design, supply, and installation of LV switchboards, motor control centres (MCCs), PLC panels, and power factor correction units. We serve manufacturing plants, water utilities, and commercial facilities that require precise, reliable power management.',
      bullets: ['LV switchboards & MCCs', 'PLC & SCADA integration', 'Power factor correction units', 'Remote monitoring options'],
      icon: <><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></>
    },
    {
      id: 'pool',
      title: 'Swimming Pool Systems',
      shortDesc: 'Electrical and pump systems for swimming pools including lighting, filtration, and automation.',
      detail: 'Complete electrical and mechanical systems for residential and commercial swimming pools \u2014 circulation pumps, filtration systems, underwater LED lighting, pool heaters, and automated chemical dosing controllers. Full safety bonding and earthing included.',
      bullets: ['Circulation & filtration pumps', 'Underwater LED lighting', 'Automated chemical dosing', 'Safety earthing & bonding'],
      icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    },
    {
      id: 'treatment',
      title: 'Water Treatment Plants',
      shortDesc: 'Electrical systems for water purification, pumping stations, and treatment infrastructure.',
      detail: 'Electrical and control system engineering for water treatment infrastructure including borehole pump stations, chlorination systems, reverse osmosis plants, and sewage treatment works. We integrate control panels, telemetry, and SCADA monitoring.',
      bullets: ['Pump station electrification', 'Chlorination control systems', 'RO plant electrical works', 'SCADA & telemetry integration'],
      icon: <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
    },
    {
      id: 'hvac',
      title: 'Refrigeration & Air Conditioning',
      shortDesc: 'Installation, service, and repair of HVAC, cold rooms, and commercial refrigeration systems.',
      detail: 'Installation, servicing, and repair of split ACs, VRF/VRV systems, centralized HVAC, cold rooms, ice cream parlour chillers, and commercial refrigeration display cases. We are certified to handle R410A, R22, and R134a refrigerants.',
      bullets: ['Split, cassette & VRF systems', 'Cold rooms & walk-in freezers', 'Commercial display chillers', 'Annual service & gas top-up'],
      icon: <><path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" /></>
    }
  ]

  const toggleCategory = (id) => {
    // Only apply accordion on mobile — checked via window.innerWidth or CSS class
    if (window.innerWidth < 1024) {
      setExpandedCategory(expandedCategory === id ? null : id)
    }
  }

  const openTilePanel = (service, category) => {
    setActiveTile({ ...service, category })
    document.body.style.overflow = 'hidden'
  }

  const closeTilePanel = () => {
    setActiveTile(null)
    document.body.style.overflow = ''
  }

  return (
    <section className="services" id="services">
      <div className="services-bg-decor"></div>
      <div className="container">
        <div className="section-header reveal-on-scroll">
          <h2 className="section-subtitle">What We Do</h2>
          <h3 className="section-title">Our Services</h3>
          <div className="section-line"></div>
          <p className="section-description">Comprehensive engineering solutions delivered by certified professionals across Kenya</p>
        </div>

        {/* Borehole Services */}
        <div className={`service-category ${expandedCategory === 'borehole' ? 'is-expanded' : ''}`}>
          <div 
            className="service-category-header clickable-header"
            onClick={() => toggleCategory('borehole')}
            role="button"
            aria-expanded={expandedCategory === 'borehole'}
            aria-controls="borehole-items"
          >
            <div className="service-category-icon-wrapper">
              <div className="service-category-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                </svg>
              </div>
            </div>
            <div className="service-category-info">
              <h3 className="service-category-title">Borehole Services</h3>
              <p className="service-category-desc">Professional water sourcing and management solutions</p>
            </div>
            <div className="service-category-chevron">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
          <div className="service-accordion-content" id="borehole-items">
            <div className={`service-items-grid ${expandedCategory === 'borehole' ? 'revealed' : ''}`}>
              {boreholeServices.map(service => (
                <div 
                  key={service.id} 
                  className={`service-item ${expandedCategory === 'borehole' ? 'revealed' : ''}`}
                  data-tile="true" 
                  data-color="borehole" 
                  onClick={() => openTilePanel(service, 'borehole')}
                >
                  <div className="service-item-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      {service.icon}
                    </svg>
                  </div>
                  <div className="service-item-content">
                    <h5>{service.title}</h5>
                    <p>{service.shortDesc}</p>
                  </div>
                  <div className="tile-expand-hint">
                    <span>Learn More</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>


        {/* Solar Services */}
        <div className={`service-category ${expandedCategory === 'solar' ? 'is-expanded' : ''}`}>
          <div 
            className="service-category-header clickable-header"
            onClick={() => toggleCategory('solar')}
            role="button"
            aria-expanded={expandedCategory === 'solar'}
            aria-controls="solar-items"
          >
            <div className="service-category-icon-wrapper">
              <div className="service-category-icon solar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              </div>
            </div>
            <div className="service-category-info">
              <h3 className="service-category-title">Solar Services</h3>
              <p className="service-category-desc">Harness the power of the sun for clean, reliable energy</p>
            </div>
            <div className="service-category-chevron">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
          <div className="service-accordion-content" id="solar-items">
            <div className={`service-items-grid ${expandedCategory === 'solar' ? 'revealed' : ''}`}>
              {solarServices.map(service => (
                <div 
                  key={service.id} 
                  className={`service-item ${expandedCategory === 'solar' ? 'revealed' : ''}`}
                  data-tile="true" 
                  data-color="solar" 
                  onClick={() => openTilePanel(service, 'solar')}
                >
                  <div className="service-item-icon solar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      {service.icon}
                    </svg>
                  </div>
                  <div className="service-item-content">
                    <h5>{service.title}</h5>
                    <p>{service.shortDesc}</p>
                  </div>
                  <div className="tile-expand-hint">
                    <span>Learn More</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>


        {/* Electrical Services */}
        <div className={`service-category ${expandedCategory === 'electrical' ? 'is-expanded' : ''}`}>
          <div 
            className="service-category-header clickable-header"
            onClick={() => toggleCategory('electrical')}
            role="button"
            aria-expanded={expandedCategory === 'electrical'}
            aria-controls="electrical-items"
          >
            <div className="service-category-icon-wrapper">
              <div className="service-category-icon electrical">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
            </div>
            <div className="service-category-info">
              <h3 className="service-category-title">Electrical Services</h3>
              <p className="service-category-desc">Full-spectrum electrical solutions for every scale of project</p>
            </div>
            <div className="service-category-chevron">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
          <div className="service-accordion-content" id="electrical-items">
            <div className={`service-items-grid ${expandedCategory === 'electrical' ? 'revealed' : ''}`}>
              {electricalServices.map(service => (
                <div 
                  key={service.id} 
                  className={`service-item ${expandedCategory === 'electrical' ? 'revealed' : ''}`}
                  data-tile="true" 
                  data-color="electrical" 
                  onClick={() => openTilePanel(service, 'electrical')}
                >
                  <div className="service-item-icon electrical">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      {service.icon}
                    </svg>
                  </div>
                  <div className="service-item-content">
                    <h5>{service.title}</h5>
                    <p>{service.shortDesc}</p>
                  </div>
                  <div className="tile-expand-hint">
                    <span>Learn More</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Interactive Tile Expansion Panel */}
      <div className={`tile-panel-backdrop ${activeTile ? 'active' : ''}`} onClick={closeTilePanel}></div>
      <div className={`tile-panel ${activeTile ? 'open' : ''}`} data-color={activeTile?.category || 'borehole'} role="dialog" aria-modal="true">
        <button className="tile-panel-close" onClick={closeTilePanel} aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
        <div className="tile-panel-inner">
          <div className="tile-panel-icon-wrap">
            {activeTile && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                {activeTile.icon}
              </svg>
            )}
          </div>
          <div className="tile-panel-body">
            <p className="tile-panel-category">{activeTile ? categoryLabels[activeTile.category] : ''}</p>
            <h2 className="tile-panel-title">{activeTile?.title || ''}</h2>
            <p className="tile-panel-detail">{activeTile?.detail || ''}</p>
            <ul className="tile-panel-bullets">
              {activeTile?.bullets.map((bullet, i) => (
                <li key={i}>{bullet}</li>
              ))}
            </ul>
            <a className="tile-panel-cta" href="https://wa.me/254721423793" target="_blank" rel="noreferrer">
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
              Get a Free Quote
            </a>
          </div>
        </div>
        <div className="tile-panel-glow"></div>
      </div>
    </section>
  )
}

export default Services

