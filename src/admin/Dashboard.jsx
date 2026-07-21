import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../config/supabaseClient'
import { useNavigate } from 'react-router-dom'
import '../styles/admin.css'
import QuotationCenter from './quotations/QuotationCenter'

/* ─────────────────────────── helpers ─────────────────────────────── */
const categoryColors = {
  electrical: 'rgba(37, 99, 235, 0.25)',
  solar:      'rgba(255, 193, 7, 0.2)',
  borehole:   'rgba(0, 229, 255, 0.2)',
}

const categoryTextColors = {
  electrical: '#3b82f6',
  solar:      '#fbbf24',
  borehole:   '#22d3ee',
}

/* ─────────────────────── Lightbox ─────────────────────────────────── */
const Lightbox = ({ src, alt, onClose }) => {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      className="admin-modal-overlay"
      onClick={onClose}
      style={{ zIndex: 300, background: 'rgba(0,0,0,0.92)' }}
    >
      <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }} onClick={(e) => e.stopPropagation()}>
        <img
          src={src}
          alt={alt}
          style={{ maxWidth: '85vw', maxHeight: '85vh', borderRadius: '8px', objectFit: 'contain', boxShadow: '0 0 60px rgba(0,0,0,0.6)' }}
        />
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '-1rem', right: '-1rem', background: '#111', border: '1px solid rgba(255,255,255,0.15)', color: 'white', borderRadius: '50%', width: '2rem', height: '2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          ×
        </button>
      </div>
    </div>
  )
}

/* ─────────────────────── Media Panel Modal ─────────────────────────── */
const MediaPanel = ({ project, onClose, onRefresh }) => {
  const [lightboxSrc, setLightboxSrc] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [pendingFiles, setPendingFiles] = useState([]) // { id, blobUrl, file }
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [deleteSuccess, setDeleteSuccess] = useState(false)
  const fileRef = useRef(null)

  const images = project.images || []

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    
    const newItems = files.map(file => ({
      id: Math.random().toString(36).slice(2),
      blobUrl: URL.createObjectURL(file),
      file,
      status: 'pending' // 'pending' | 'uploading' | 'error'
    }))
    
    setPendingFiles(prev => [...prev, ...newItems])
    setUploadError('')
    setUploadSuccess(false)
    // Clear input so same file can be picked again if removed
    if (fileRef.current) fileRef.current.value = ''
  }

  const removePending = (id) => {
    setPendingFiles(prev => {
      const item = prev.find(p => p.id === id)
      if (item) URL.revokeObjectURL(item.blobUrl)
      return prev.filter(p => p.id !== id)
    })
  }

  const handleConfirmUpload = async () => {
    if (!pendingFiles.length) return
    setUploading(true)
    setUploadError('')
    
    try {
      const results = []
      // We process sequentially so we can update UI/status per file if needed
      for (const item of pendingFiles) {
        // Update status to uploading
        setPendingFiles(prev => prev.map(p => p.id === item.id ? { ...p, status: 'uploading' } : p))
        
        const { file, id } = item
        const ext = file.name.split('.').pop()
        const fileName = `${project.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

        // 1. Storage Upload
        const { error: storageError } = await supabase
          .storage
          .from('project-media')
          .upload(fileName, file, { upsert: false })

        if (storageError) {
          setPendingFiles(prev => prev.map(p => p.id === id ? { ...p, status: 'error' } : p))
          throw new Error(`Upload failed for ${file.name}: ${storageError.message}`)
        }

        const { data: { publicUrl } } = supabase
          .storage
          .from('project-media')
          .getPublicUrl(fileName)

        // 2. Database Insert
        const { error: dbError } = await supabase.from('images').insert([{
          project_id: project.id,
          url: publicUrl,
        }])

        if (dbError) throw dbError
        results.push(id)
      }

      // Success cleanup
      pendingFiles.forEach(item => URL.revokeObjectURL(item.blobUrl))
      setPendingFiles([])
      setUploadSuccess(true)
      onRefresh()
      
      // Auto-hide success message
      setTimeout(() => setUploadSuccess(false), 4000)
      
    } catch (err) {
      setUploadError(err.message)
    } finally {
      setUploading(false)
    }
  }



  const handleDeleteImage = async (imgId) => {
    if (!window.confirm('Remove this image from project library?')) return
    try {
      console.log('Initiating image delete for ID:', imgId)
      const imgToDelete = images.find(i => i.id === imgId)
      
      if (imgToDelete && imgToDelete.url) {
        // Extract storage path from public URL
        const urlParts = imgToDelete.url.split('project-media/')
        if (urlParts.length > 1) {
          const storagePath = urlParts[1]
          console.log('Removing from storage:', storagePath)
          const { error: storageError } = await supabase.storage.from('project-media').remove([storagePath])
          if (storageError) console.warn('Storage cleanup failed (non-critical):', storageError.message)
        }
      }

      const { error } = await supabase.from('images').delete().eq('id', imgId)
      if (error) {
        alert(`Database Error: ${error.message}`)
        throw error
      }
      
      setDeleteSuccess(true)
      onRefresh()
      setTimeout(() => setDeleteSuccess(false), 3500)
    } catch (err) {
      setUploadError(err.message)
      alert(`Deletion Failed: ${err.message}`)
    }
  }


  return (
    <div className="admin-modal-overlay" style={{ zIndex: 200 }}>
      <div className="admin-modal admin-card" style={{ maxWidth: '720px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <div style={{ fontSize: '0.65rem', color: categoryTextColors[project.category] || 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '0.25rem' }}>
              Media Library
            </div>
            <h2 style={{ fontSize: '1.25rem', color: 'white', margin: 0 }}>{project.title}</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1 }}>×</button>
        </div>

        {/* Upload zone */}
        <div
          onClick={() => fileRef.current?.click()}
          style={{ border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '8px', padding: '2rem', textAlign: 'center', cursor: 'pointer', marginBottom: '1.5rem', transition: 'border-color 0.3s', background: 'rgba(255,255,255,0.02)' }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(37,99,235,0.5)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
          <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" width="32" height="32" style={{ marginBottom: '0.75rem' }}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Click to select images</div>
        </div>

        {uploadSuccess && (
          <div className="success-notification">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Upload successful! images added to library.
          </div>
        )}

        {uploadError && <div style={{ color: '#f87171', fontSize: '0.75rem', marginBottom: '1.5rem', background: 'rgba(239,68,68,0.05)', padding: '0.75rem', borderRadius: '4px' }}>{uploadError}</div>}

        {/* Pending Review Section */}
        {pendingFiles.length > 0 && (
          <div style={{ marginBottom: '2.5rem', background: 'rgba(37, 99, 235, 0.03)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(37, 99, 235, 0.1)' }}>
            <div className="review-header" style={{ borderTop: 'none', marginTop: 0, paddingTop: 0 }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--primary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                Pending Review ({pendingFiles.length})
              </div>
              <button 
                onClick={handleConfirmUpload} 
                disabled={uploading}
                className="btn btn-primary btn-skew" 
                style={{ fontSize: '0.65rem', padding: '0.5rem 1.25rem' }}
              >
                <span>{uploading ? 'Processing…' : `Confirm & Upload All`}</span>
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1rem' }}>
              {pendingFiles.map((item) => (
                <div key={item.id} className="pending-thumb">
                  <img src={item.blobUrl} alt="Pending" style={{ opacity: item.status === 'uploading' ? 0.4 : 1 }} />
                  {item.status === 'uploading' ? (
                    <div className="media-preview-overlay">
                      <div className="spinner"></div>
                    </div>
                  ) : (
                    <button 
                      className="img-delete-btn" 
                      style={{ opacity: 1, top: '0.5rem', right: '0.5rem' }}
                      onClick={() => removePending(item.id)}
                    >
                      ×
                    </button>
                  )}
                  {item.status === 'error' && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(239,68,68,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {deleteSuccess && (
          <div className="delete-notification">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Image successfully removed
          </div>
        )}

        {images.map((img) => {
          // Normalize relative paths — "assets/x" becomes "/assets/x"
          const raw = img.url || ''
          const src = raw && !raw.startsWith('http') && !raw.startsWith('/')
            ? `/${raw}`
            : raw
          return (
            <div
              key={img.id}
              className="media-thumb"
              onClick={() => { if (src) setLightboxSrc({ src, alt: img.alt_text || project.title }) }}
            >
              {src ? (
                <img
                  src={src}
                  alt={img.alt_text || project.title}
                  onError={(e) => { e.currentTarget.style.opacity = '0.2' }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '0.65rem' }}>No URL</div>
              )}
              <button
                className="img-delete-btn"
                title="Delete Image"
                onClick={(e) => { e.stopPropagation(); handleDeleteImage(img.id) }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          )
        })}



        <div style={{ textAlign: 'right', marginTop: '2rem' }}>
          <button onClick={onClose} className="btn btn-skew" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>
            <span>Close</span>
          </button>
        </div>
      </div>

      {lightboxSrc && <Lightbox src={lightboxSrc.src} alt={lightboxSrc.alt} onClose={() => setLightboxSrc(null)} />}
    </div>
  )
}

/* ─────────────────────── Edit Project Modal ─────────────────────────── */
const EditModal = ({ project, onClose, onSave }) => {
  const [form, setForm] = useState({
    title: project.title || '',
    description: project.description || '',
    category: project.category || 'electrical',
    location: project.location || '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const { data, error } = await supabase
        .from('projects')
        .update(form)
        .eq('id', project.id)
        .select()
      if (error) throw error
      onSave(data[0])
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-modal-overlay" style={{ zIndex: 200 }}>
      <div className="admin-modal admin-card" style={{ maxWidth: '560px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <div style={{ fontSize: '0.65rem', color: categoryTextColors[form.category] || 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '0.25rem' }}>
              Edit Project
            </div>
            <h2 style={{ fontSize: '1.25rem', color: 'white', margin: 0 }}>{project.title}</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1 }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="admin-input-group">
            <label className="admin-label">Project Title</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="admin-input" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="admin-input-group">
              <label className="admin-label">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="admin-input" style={{ appearance: 'none' }}>
                <option value="electrical">Electrical</option>
                <option value="solar">Solar</option>
                <option value="borehole">Borehole</option>
              </select>
            </div>
            <div className="admin-input-group">
              <label className="admin-label">Location</label>
              <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required className="admin-input" />
            </div>
          </div>

          <div className="admin-input-group">
            <label className="admin-label">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows="4" className="admin-input" style={{ resize: 'none' }} />
          </div>

          {error && <div style={{ color: '#f87171', fontSize: '0.75rem' }}>{error}</div>}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-skew" style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>
              <span>Cancel</span>
            </button>
            <button type="submit" className="btn btn-primary btn-skew" style={{ flex: 1, fontSize: '0.75rem' }} disabled={saving}>
              <span>{saving ? 'Saving…' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ─────────────────────── Project Card ─────────────────────────────── */
const ProjectCard = ({ project, onDelete, onEdit, onMedia, isArchived, onRestore }) => {
  const cardRef = useRef(null)

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    cardRef.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`)
    cardRef.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`)
  }

  // Normalize a stored URL: relative paths like "assets/x" become "/assets/x"
  const normalizeUrl = (raw) => {
    if (!raw) return ''
    if (raw.startsWith('http') || raw.startsWith('/')) return raw
    return `/${raw}`
  }

  const fallbackSrc = `/assets/${project.category}/1.jpeg`
  const thumbSrc = (() => {
    const imgs = project.images || []
    const first = imgs[0]
    if (!first) return fallbackSrc
    const resolved = normalizeUrl(first.url)
    return resolved || fallbackSrc
  })()

  const accentColor = categoryTextColors[project.category] || 'var(--primary)'

  return (
    <div
      ref={cardRef}
      className={`project-card-admin spotlight-card ${project.category}`}
      onMouseMove={handleMouseMove}
      style={{ opacity: isArchived ? 0.65 : 1, outline: isArchived ? '1px solid rgba(239,68,68,0.2)' : 'none' }}
    >
      <div className="project-thumb">
        <img
          src={thumbSrc}
          alt={project.title}
          onError={(e) => { e.currentTarget.src = fallbackSrc }}
        />
        {isArchived && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.65rem', fontFamily: 'Rajdhani', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#f87171', border: '1px solid rgba(239,68,68,0.4)', padding: '0.3rem 0.75rem', borderRadius: '3px' }}>Archived</span>
          </div>
        )}
        <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => onDelete(project.id)}
            title={isArchived ? "Permanently Delete" : "Archive Project"}
            style={{ 
              background: isArchived ? 'rgba(239,68,68,0.4)' : 'rgba(239,68,68,0.2)', 
              border: '1px solid rgba(239,68,68,0.4)', 
              color: '#ef4444', 
              padding: '0.4rem', 
              borderRadius: '4px', 
              cursor: 'pointer', 
              display: 'flex',
              boxShadow: isArchived ? '0 0 15px rgba(239,68,68,0.2)' : 'none'
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>

      <div className="project-info">
        <div className="project-meta">
          <span className="project-cat-badge" style={{ color: accentColor }}>{project.category}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: 0.4 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="11" height="11">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span style={{ fontSize: '0.62rem' }}>{new Date(project.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        <h3 className="project-title-admin">{project.title}</h3>
        <p className="project-loc-admin">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="11" height="11">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {project.location}
        </p>

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
          {isArchived ? (
            <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
              <button
                onClick={() => onRestore(project.id)}
                className="btn btn-primary btn-skew"
                style={{ flex: 1, fontSize: '0.7rem', padding: '0.5rem' }}
              >
                <span>Restore</span>
              </button>
              <button
                onClick={() => onDelete(project.id)}
                className="btn btn-skew"
                style={{ flex: 1, fontSize: '0.7rem', padding: '0.5rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
              >
                <span>Delete Permanently</span>
              </button>
            </div>
          ) : (
            <>
              <button onClick={() => onEdit(project)} className="btn btn-primary" style={{ flex: 1, fontSize: '0.7rem', padding: '0.5rem' }}>
                <span>Edit Data</span>
              </button>
              <button onClick={() => onMedia(project)} className="btn btn-skew" style={{ flex: 1, fontSize: '0.7rem', padding: '0.5rem' }}>
                <span>Media ({(project.images || []).length})</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────── Analytics View ─────────────────────────────── */
const AnalyticsView = ({ projects }) => {
  const active = projects.filter(p => !p.deleted_at)
  const archived = projects.filter(p => p.deleted_at)
  const byCategory = ['electrical', 'solar', 'borehole'].map(cat => ({
    cat,
    count: active.filter(p => p.category === cat).length,
    color: categoryTextColors[cat],
  }))
  const maxCount = Math.max(...byCategory.map(c => c.count), 1)

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {[
          { label: 'Total Projects', value: active.length, color: '#3b82f6' },
          { label: 'Archived', value: archived.length, color: '#f87171' },
          { label: 'Categories', value: 3, color: '#22d3ee' },
          { label: 'Electrical', value: byCategory[0].count, color: '#3b82f6' },
          { label: 'Solar', value: byCategory[1].count, color: '#fbbf24' },
          { label: 'Borehole', value: byCategory[2].count, color: '#22d3ee' },
        ].map(stat => (
          <div key={stat.label} className="admin-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: stat.color, fontFamily: 'Rajdhani', lineHeight: 1 }}>{stat.value}</div>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.5rem' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <h3 style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '1rem' }}>Category Breakdown</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {byCategory.map(({ cat, count, color }) => (
          <div key={cat}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.35rem' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)', textTransform: 'capitalize', fontFamily: 'Rajdhani', fontWeight: 600 }}>{cat}</span>
              <span style={{ color }}>{count}</span>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(count / maxCount) * 100}%`, background: color, borderRadius: '99px', transition: 'width 0.8s ease' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────── System View ─────────────────────────────────── */
const SystemView = ({ session, onLogout }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '480px' }}>
    <div className="admin-card" style={{ padding: '1.5rem' }}>
      <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Session Info</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {[
          { label: 'Email',  value: session?.user?.email },
          { label: 'Role',   value: session?.user?.role || 'authenticated' },
          { label: 'User ID',value: session?.user?.id?.slice(0, 18) + '…' },
        ].map(row => (
          <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>{row.label}</span>
            <span style={{ color: 'white', fontFamily: 'monospace' }}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
    <button
      onClick={onLogout}
      className="btn btn-skew"
      style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: '0.75rem', padding: '0.75rem 1.5rem', width: 'fit-content' }}
    >
      <span>Terminate Session</span>
    </button>
  </div>
)

/* ─────────────────────── Main Dashboard ─────────────────────────────── */
const Dashboard = () => {
  const [session, setSession]           = useState(null)
  const [projects, setProjects]         = useState([])
  const [loading, setLoading]           = useState(true)
  const [activeSection, setActiveSection] = useState('projects')  // 'projects' | 'analytics' | 'system'
  const [showArchive, setShowArchive]   = useState(false)
  const [isAddingProject, setIsAddingProject] = useState(false)
  const [addingLoading, setAddingLoading] = useState(false) // For deployment progress
  const [newProject, setNewProject]     = useState({ title: '', description: '', category: 'electrical', location: '' })
  const [newProjectFiles, setNewProjectFiles] = useState([]) // Files selected for a new project
  const [addError, setAddError]         = useState('')
  const [editingProject, setEditingProject] = useState(null)
  const [mediaProject, setMediaProject] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { navigate('/admin/login') } else {
        setSession(session)
        fetchProjects()
      }
    }
    checkAuth()

    /* ── Inactivity Timeout (15 mins) ── */
    let timeoutId
    const TIMEOUT_DURATION = 15 * 60 * 1000 // 15 minutes

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        console.warn('Session expired due to inactivity.')
        handleLogout()
      }, TIMEOUT_DURATION)
    }

    // Set up listeners for common interactions
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    events.forEach(name => document.addEventListener(name, resetTimer))
    
    // Initial timer start
    resetTimer()

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      events.forEach(name => document.removeEventListener(name, resetTimer))
    }
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('projects')
        .select('*, images(*)')
        .order('created_at', { ascending: false })
      if (error) throw error
      setProjects(data || [])
      return data || []
    } catch (err) {
      console.error('fetchProjects error:', err)
      return []
    } finally {
      setLoading(false)
    }
  }


  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  /* ── Add project ── */
  const handleAddProject = async (e) => {
    e.preventDefault()
    setAddError('')
    setAddingLoading(true)
    try {
      // 1. Create project
      const { data, error: prjError } = await supabase
        .from('projects')
        .insert([newProject])
        .select()
      
      if (prjError) throw prjError
      const createdProject = data[0]

      // 2. Upload images if many
      if (newProjectFiles.length > 0) {
        for (const file of newProjectFiles) {
          const ext = file.name.split('.').pop()
          const fileName = `${createdProject.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

          const { error: storageError } = await supabase.storage
            .from('project-media')
            .upload(fileName, file)

          if (!storageError) {
            const { data: { publicUrl } } = supabase.storage
              .from('project-media')
              .getPublicUrl(fileName)

            await supabase.from('images').insert([{
              project_id: createdProject.id,
              url: publicUrl
            }])
          }
        }
      }

      // Success
      await fetchProjects() // Refresh all
      setIsAddingProject(false)
      setNewProject({ title: '', description: '', category: 'electrical', location: '' })
      setNewProjectFiles([])
      
    } catch (err) {
      setAddError(err.message)
    } finally {
      setAddingLoading(false)
    }
  }


  /* ── Soft delete (archive) or Hard delete (permanent) ── */
  const handleDeleteProject = async (id) => {
    const project = projects.find(p => p.id === id)
    if (!project) return

    if (project.deleted_at) {
      // PERMANENT DELETE
      if (!window.confirm('⚠️ PERMANENTLY DELETE project? This clears all data and storage files.')) return
      try {
        console.log('Initiating permanent delete for project:', id)
        
        // 1. Storage Cleanup (Recursive)
        const projectImages = project.images || []
        if (projectImages.length > 0) {
          const paths = projectImages.map(img => {
            const parts = (img.url || '').split('project-media/')
            return parts.length > 1 ? parts[1] : null
          }).filter(p => p !== null)
          
          if (paths.length > 0) {
            console.log('Cleaning up project storage files...', paths)
            await supabase.storage.from('project-media').remove(paths)
          }
        }

        // 2. Database Delete
        const { error } = await supabase.from('projects').delete().eq('id', id)
        if (error) {
          alert(`Failed to delete project: ${error.message}`)
          throw error
        }
        
        setProjects(projects.filter(p => p.id !== id))
        alert('Project and all associated media permanently deleted.')
      } catch (err) {
        console.error('Permanent delete failed:', err)
        alert(`Permanent delete failed: ${err.message}`)
      }
    } else {
      // ARCHIVE
      if (!window.confirm('Archive this project?')) return
      try {
        const { error } = await supabase
          .from('projects')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', id)
          
        if (error) {
          // Check for missing column
          if (error.message.includes('column "deleted_at" of relation "projects" does not exist')) {
            if (window.confirm('Soft delete column is missing. Perform permanent delete instead?')) {
              // Forced hard delete via recursive call helper
              const forceProject = { ...project, deleted_at: 'forced' }
              setProjects(projects.map(p => p.id === id ? forceProject : p))
              handleDeleteProject(id)
              return
            }
          }
          alert(`Archive failed: ${error.message}`)
          throw error
        }
        setProjects(projects.map(p => p.id === id ? { ...p, deleted_at: new Date().toISOString() } : p))
      } catch (err) {
        console.error('Archive error:', err)
      }
    }
  }

  /* ── Restore ── */
  const handleRestoreProject = async (id) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ deleted_at: null })
        .eq('id', id)
      if (error) throw error
      setProjects(projects.map(p => p.id === id ? { ...p, deleted_at: null } : p))
    } catch (err) {
      alert(err.message)
    }
  }

  /* ── Edit save ── */
  const handleEditSave = (updated) => {
    setProjects(projects.map(p => p.id === updated.id ? { ...p, ...updated } : p))
    setEditingProject(null)
  }

  /* ── Media refresh ── */
  const handleMediaRefresh = async () => {
    const freshData = await fetchProjects()
    // Re-open the updated media project
    if (mediaProject) {
      const updated = freshData.find(p => p.id === mediaProject.id)
      if (updated) setMediaProject(updated)
    }
  }


  const activeProjects   = projects.filter(p => !p.deleted_at)
  const archivedProjects = projects.filter(p => p.deleted_at)
  const displayedProjects = showArchive ? archivedProjects : activeProjects

  const sectionTitles = {
    projects:  { label: 'Production Overview', sub: `${activeProjects.length} nodes active` },
    analytics: { label: 'Analytics', sub: 'Project distribution & statistics' },
    quotations:{ label: 'Quotation Center', sub: 'Manage clients, services, and quotes' },
    system:    { label: 'System', sub: 'Session and account settings' },
  }

  return (
    <div className="admin-layout">

      {/* ── Sidebar ── */}
      <aside className="admin-sidebar" style={{ paddingTop: '2rem' }}>
        <div style={{ padding: '0 2rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ color: 'var(--primary)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <h2 style={{ fontSize: '0.9rem', color: 'white', letterSpacing: '0.1rem', margin: 0 }}>Control Center</h2>
          </div>
        </div>

        <nav className="sidebar-nav">
          <a href="/" className="nav-item" style={{ textDecoration: 'none' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            View Website
          </a>

          {[
            { id: 'projects',  label: 'Projects',
              icon: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></> },
            { id: 'quotations', label: 'Quotations',
              icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></> },
            { id: 'analytics', label: 'Analytics',
              icon: <path d="M12 20v-6M6 20V10M18 20V4"/> },
            { id: 'system',    label: 'System',
              icon: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></> },
          ].map(({ id, label, icon }) => (
            <button
              key={id}
              className={`nav-item ${activeSection === id ? 'active' : ''}`}
              onClick={() => setActiveSection(id)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                {icon}
              </svg>
              {label}
            </button>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', padding: '1.5rem 2rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', opacity: 0.45 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span style={{ fontSize: '0.68rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session?.user?.email}</span>
          </div>
          <button
            onClick={handleLogout}
            style={{ background: 'none', border: 'none', color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontFamily: 'Rajdhani', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1rem' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Terminate Session
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="admin-main">
        <header className="admin-header">
          <div className="admin-title-wrap">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', marginBottom: '0.4rem' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              <span style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12rem' }}>Project Management</span>
            </div>
            <h1 style={{ color: 'white' }}>{sectionTitles[activeSection].label}</h1>
            <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1rem', marginTop: '0.35rem' }}>
              {sectionTitles[activeSection].sub}
            </p>
          </div>

          {activeSection === 'projects' && (
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => setShowArchive(!showArchive)}
                className="btn btn-skew"
                style={{
                  fontSize: '0.72rem', padding: '0.6rem 1.25rem',
                  background: showArchive ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.05)',
                  color: showArchive ? '#f87171' : 'rgba(255,255,255,0.55)',
                  border: showArchive ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <span>{showArchive ? `Active (${activeProjects.length})` : `Archive (${archivedProjects.length})`}</span>
              </button>
              {!showArchive && (
                <button onClick={() => setIsAddingProject(true)} className="btn btn-primary btn-skew">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <span>Deploy Project</span>
                </button>
              )}
            </div>
          )}
        </header>

        {/* ── Section Content ── */}
        {activeSection === 'analytics' && <AnalyticsView projects={projects} />}
        {activeSection === 'system'    && <SystemView session={session} onLogout={handleLogout} />}
        {activeSection === 'quotations' && <QuotationCenter session={session} />}
        {activeSection === 'projects'  && (
          loading ? (
            <div className="project-grid-admin">
              {[1, 2, 3].map(i => (
                <div key={i} className="admin-card" style={{ height: '260px', opacity: 0.25, animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          ) : displayedProjects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'rgba(255,255,255,0.2)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" width="48" height="48" style={{ marginBottom: '1rem', opacity: 0.3 }}>
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
              <p style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                {showArchive ? 'No archived projects' : 'No projects deployed yet'}
              </p>
            </div>
          ) : (
            <div className="project-grid-admin">
              {displayedProjects.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isArchived={!!project.deleted_at}
                  onDelete={handleDeleteProject}
                  onRestore={handleRestoreProject}
                  onEdit={setEditingProject}
                  onMedia={setMediaProject}
                />
              ))}
            </div>
          )
        )}

        {/* ── Add Project Modal ── */}
        {isAddingProject && (
          <div className="admin-modal-overlay">
            <div className="admin-modal admin-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.4rem', color: 'white', margin: 0 }}>Deploy New Project</h2>
                <button onClick={() => setIsAddingProject(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1 }}>×</button>
              </div>
              <form onSubmit={handleAddProject} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="admin-input-group">
                  <label className="admin-label">Project Title</label>
                  <input type="text" value={newProject.title} onChange={(e) => setNewProject({ ...newProject, title: e.target.value })} required className="admin-input" placeholder="e.g. Solar Grid Nairobi" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="admin-input-group">
                    <label className="admin-label">Category</label>
                    <select value={newProject.category} onChange={(e) => setNewProject({ ...newProject, category: e.target.value })} className="admin-input" style={{ appearance: 'none' }}>
                      <option value="electrical">Electrical</option>
                      <option value="solar">Solar</option>
                      <option value="borehole">Borehole</option>
                    </select>
                  </div>
                  <div className="admin-input-group">
                    <label className="admin-label">Location</label>
                    <input type="text" value={newProject.location} onChange={(e) => setNewProject({ ...newProject, location: e.target.value })} required className="admin-input" placeholder="e.g. Nairobi, KE" />
                  </div>
                </div>
                <div className="admin-input-group">
                  <label className="admin-label">Description</label>
                  <textarea value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} rows="4" className="admin-input" placeholder="Enter project specifications…" style={{ resize: 'none' }} />
                </div>

                <div className="admin-input-group">
                  <label className="admin-label">Project Media (Optional)</label>
                  <div 
                    onClick={() => document.getElementById('new-project-media-input')?.click()}
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '4px', cursor: 'pointer', textAlign: 'center' }}
                  >
                    <input 
                      id="new-project-media-input"
                      type="file" 
                      accept="image/*" 
                      multiple 
                      style={{ display: 'none' }} 
                      onChange={(e) => setNewProjectFiles(prev => [...prev, ...Array.from(e.target.files)])}
                    />
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {newProjectFiles.length > 0 ? `${newProjectFiles.length} images selected` : 'Click to select media'}
                    </div>
                  </div>
                  {newProjectFiles.length > 0 && (
                    <div className="deploy-thumb-grid">
                      {newProjectFiles.map((file, idx) => (
                        <div key={idx} style={{ position: 'relative' }}>
                          <img src={URL.createObjectURL(file)} className="deploy-thumb" alt="Preview" />
                          <button 
                            type="button"
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setNewProjectFiles(prev => prev.filter((_, i) => i !== idx));
                            }}
                            style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.3)', zIndex: 2 }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {addError && <div style={{ color: '#f87171', fontSize: '0.75rem' }}>{addError}</div>}
                
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <button type="button" onClick={() => { setIsAddingProject(false); setNewProjectFiles([]); }} className="btn btn-skew" disabled={addingLoading} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>
                    <span>Abort</span>
                  </button>
                  <button type="submit" className="btn btn-primary btn-skew" style={{ flex: 1, fontSize: '0.75rem' }} disabled={addingLoading}>
                    <span>{addingLoading ? 'Processing…' : 'Confirm Deployment'}</span>
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}
      </main>

      {/* ── Edit Modal ── */}
      {editingProject && (
        <EditModal project={editingProject} onClose={() => setEditingProject(null)} onSave={handleEditSave} />
      )}

      {/* ── Media Panel ── */}
      {mediaProject && (
        <MediaPanel project={mediaProject} onClose={() => setMediaProject(null)} onRefresh={handleMediaRefresh} />
      )}
    </div>
  )
}

export default Dashboard
