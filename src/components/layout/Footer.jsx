import React from 'react'
import DynamicWhiteLogo from './DynamicWhiteLogo'

const Footer = () => {
  const [sunPos, setSunPos] = React.useState(null)
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="logo" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', marginBottom: '1rem', position: 'relative' }}>
              <DynamicWhiteLogo 
                src="/assets/logo/original-logo.png" 
                alt="Diotranics Enterprises Ltd" 
                style={{ height: '110px', width: 'auto', objectFit: 'contain', marginBottom: '1rem', marginTop: '0.5rem' }}
                className="logo-img"
                onSunFound={setSunPos}
              />
              {sunPos && (
                <span 
                  className="brand-sun-dot" 
                  style={{ 
                    left: `${sunPos.xPerc - 5}%`,
                    top: `${sunPos.yPerc - 6}%`,
                    background: 'rgba(250, 204, 21, 0.6)'
                  }}
                ></span>
              )}
            </div>
            <p>Leading provider of electrical, solar, and borehole solutions in Kenya. Committed to quality, safety, and
              innovation.</p>
          </div>
          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#home">Home</a></li>
              <li><a href="#services">Services</a></li>
              <li><a href="#portfolio">Our Projects</a></li>
              <li><a href="#about">About Us</a></li>
              <li><a href="/admin/login">Admin Portal</a></li>
            </ul>
          </div>
          <div className="footer-services">
            <h4>Services</h4>
            <ul>
              <li>Electrical Installation</li>
              <li>Solar Systems</li>
              <li>Borehole Drilling</li>
              <li>Generator Services</li>
              <li>Water Treatment</li>
              <li>AC &amp; Refrigeration</li>
            </ul>
          </div>
          <div className="footer-contact">
            <h4>Contact Us</h4>
            <ul>
              <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg><span>Kitengela Tarino Building,<br />Namanga Road</span></li>
              <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path
                    d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72" />
                </svg>
                <div><a href="tel:+254721423793">+254 721 423 793</a><br /><a href="tel:+254799524922">+254 799 524 922</a>
                </div>
              </li>
              <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg><a href="mailto:info@diotranics.co.ke">info@diotranics.co.ke</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Diotranics Enterprises Limited. All rights reserved.</p>
          <div className="footer-social">
            <a href="" target="_blank" rel="noreferrer" className="social-icon"><svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg></a>
            <a href="" target="_blank" rel="noreferrer" className="social-icon">TT</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
