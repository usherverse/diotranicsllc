import React, { useState, useEffect } from 'react'
import DynamicWhiteLogo from './DynamicWhiteLogo'

const Navbar = ({ isAdmin = false }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [sunPos, setSunPos] = useState(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <nav className="navbar no-print" id="navbar" style={{ backgroundColor: scrolled ? 'rgba(17, 19, 23, 0.98)' : 'rgba(17, 19, 23, 0.9)' }}>
      <div className="container nav-container">
        <a href={isAdmin ? '/admin/dashboard' : '#'} className="logo" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', position: 'relative' }}>
          <DynamicWhiteLogo 
            src="/assets/logo/original-logo.png" 
            alt="Diotranics Enterprises Ltd" 
            className="navbar-logo-image"
            onSunFound={setSunPos}
          />
          {sunPos && (
            <span 
              className="brand-sun-dot" 
              style={{ 
                left: `${sunPos.xPerc - 2}%`,
                top: `${sunPos.yPerc - 4}%`,
                background: 'rgba(250, 204, 21, 0.6)'
              }}
            ></span>
          )}
        </a>
        {!isAdmin && (
          <>
            <div className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`} id="navLinks">
              <a href="#home" className="nav-link" onClick={closeMobileMenu}>Home</a>
              <a href="#services" className="nav-link" onClick={closeMobileMenu}>Services</a>
              <a href="#portfolio" className="nav-link" onClick={closeMobileMenu}>Our Projects</a>
              <a href="#about" className="nav-link" onClick={closeMobileMenu}>About Us</a>
            </div>
            <button
              className="btn btn-primary btn-skew"
              onClick={() => window.open('https://wa.me/254721423793', '_blank')}
            >
              <span>Get Quote</span>
            </button>
            <button
              className={`mobile-toggle ${isMobileMenuOpen ? 'active' : ''}`}
              id="mobileToggle"
              aria-label="Toggle menu"
              onClick={toggleMobileMenu}
            >
              <span></span><span></span><span></span>
            </button>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar
