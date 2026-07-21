import React, { useState, useEffect } from 'react'
import { useProjects } from '../hooks/useProjects'
import { useScrollReveal } from '../hooks/useScrollReveal'

const Portfolio = () => {
  const { projects, loading } = useProjects()
  const [expandedSections, setExpandedSections] = useState({})
  const [lightbox, setLightbox] = useState({ isOpen: false, index: 0, categoryProjects: [] })

  // Trigger scroll reveal when projects change
  useScrollReveal([projects, loading])

  const toggleExpand = (category) => {
    setExpandedSections(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  const openLightbox = (index, categoryProjects) => {
    setLightbox({ isOpen: true, index, categoryProjects })
    document.body.style.overflow = 'hidden'
  }

  const closeLightbox = () => {
    setLightbox({ isOpen: false, index: 0, categoryProjects: [] })
    document.body.style.overflow = ''
  }

  const nextSlide = (e) => {
    e.stopPropagation()
    setLightbox(prev => ({
      ...prev,
      index: (prev.index + 1) % prev.categoryProjects.length
    }))
  }

  const prevSlide = (e) => {
    e.stopPropagation()
    setLightbox(prev => ({
      ...prev,
      index: (prev.index - 1 + prev.categoryProjects.length) % prev.categoryProjects.length
    }))
  }

  const categories = [
    { id: 'electrical', title: 'Electrical Projects' },
    { id: 'solar', title: 'Solar Projects' },
    { id: 'borehole', title: 'Borehole Projects' }
  ]

  const getProjectsByCategory = (catId) => {
    return projects.filter(p => p.category?.toLowerCase() === catId.toLowerCase())
  }

  // Normalize stored URLs: "assets/x/y.jpeg" → "/assets/x/y.jpeg"
  const normalizeImgUrl = (raw, category) => {
    if (!raw) return `/assets/${category}/1.jpeg`
    if (raw.startsWith('http') || raw.startsWith('/')) return raw
    return `/${raw}`
  }

  return (
    <section className="portfolio" id="portfolio">
      <div className="container">
        <div className="section-header reveal-on-scroll">
          <h2 className="section-subtitle">Our Portfolio</h2>
          <h3 className="section-title">Recent Projects</h3>
          <div className="section-line"></div>
        </div>

        <div className="service-portfolios">
          {loading ? (
            <div className="portfolio-loading">Loading projects...</div>
          ) : (
            categories.map((cat) => {
              const categoryProjects = getProjectsByCategory(cat.id)
              const isExpanded = expandedSections[cat.id]
              
              if (categoryProjects.length === 0) return null

              return (
                <div key={cat.id} className="service-portfolio reveal-on-scroll" data-service={cat.id}>
                  <div className="portfolio-header">
                    <h4 className="portfolio-title">{cat.title}</h4>
                    <button 
                      className={`expand-btn ${isExpanded ? 'expanded' : ''}`} 
                      onClick={() => toggleExpand(cat.id)}
                    >
                      <span className="expand-text">{isExpanded ? 'View Less' : 'View More Projects'}</span>
                      <svg className="expand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                  </div>
                  <div className={`portfolio-grid ${isExpanded ? 'expanded' : 'collapsed'}`} data-service={cat.id}>
                    {categoryProjects.map((project, index) => (
                      <div 
                        key={project.id} 
                        className="project-card" 
                        data-lightbox="true"
                        onClick={() => openLightbox(index, categoryProjects)}
                      >
                        <img 
                          src={normalizeImgUrl(project.images?.[0]?.url, cat.id)} 
                          alt={project.title} 
                          loading="lazy" 
                        />
                        <div className="project-overlay">
                          <span className="project-service">{cat.id}</span>
                          <h4 className="project-title">{project.title}</h4>
                          <p className="project-location">{project.location}</p>
                        </div>
                        <div className="lightbox-trigger-hint">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* LIGHTBOX MODAL */}
      <div className={`lightbox-overlay ${lightbox.isOpen ? 'active' : ''}`} id="lightboxOverlay" role="dialog" aria-modal="true" aria-label="Image viewer" onClick={closeLightbox}>
        <button className="lightbox-close" onClick={closeLightbox} aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
        <button className="lightbox-nav lightbox-prev" onClick={prevSlide} aria-label="Previous image">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        
        <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
          <img 
            src={normalizeImgUrl(
              lightbox.categoryProjects[lightbox.index]?.images?.[0]?.url,
              lightbox.categoryProjects[lightbox.index]?.category
            )} 
            alt={lightbox.categoryProjects[lightbox.index]?.title} 
            id="lightboxImg" 
            className="lightbox-image" 
          />
          <div className="lightbox-caption">
            <span className="lightbox-category" id="lightboxCategory">{lightbox.categoryProjects[lightbox.index]?.category}</span>
            <h4 id="lightboxTitle">{lightbox.categoryProjects[lightbox.index]?.title}</h4>
            <p id="lightboxLocation">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span id="lightboxLocationText">{lightbox.categoryProjects[lightbox.index]?.location}</span>
            </p>
          </div>
        </div>
        
        <button className="lightbox-nav lightbox-next" onClick={nextSlide} aria-label="Next image">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
        <div className="lightbox-counter" id="lightboxCounter">
          {lightbox.index + 1} / {lightbox.categoryProjects.length}
        </div>
      </div>
    </section>
  )
}

export default Portfolio


