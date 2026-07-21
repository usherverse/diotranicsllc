import React from 'react'

const About = () => {
  return (
    <section className="about" id="about">
      <div className="container">
        <div className="about-grid">
          <div className="about-content reveal-on-scroll">
            <h2 className="section-subtitle">Who We Are</h2>
            <h3 className="section-title">Powering Kenya's Future</h3>
            <p className="about-text-lg">Diotranics Enterprises Limited is a premier engineering solutions provider
              specializing in Electrical, Solar, and Borehole services. Located in Kitengela, we serve clients across
              Kenya with a commitment to quality, safety, and sustainable innovation.</ p>
            <p className="about-text">Our team of certified engineers and technicians ensures that every project—whether
              residential, commercial, or industrial—is executed to the highest international standards. We believe in
              building lasting relationships through reliability and excellence.</p>
            <div className="contact-cards">
              <a href="https://www.google.com/maps/dir/-1.492293,36.95226/GXG5%2B4F2+Tarino" target="_blank" rel="noreferrer"
                className="contact-card">
                <div className="contact-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg></div>
                <div>
                  <h5>Visit Us</h5>
                  <p>Kitengela Tarino Building,<br />Namanga Road</p>
                </div>
              </a>
              <a href="mailto:info@diotranics.co.ke" className="contact-card">
                <div className="contact-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg></div>
                <div>
                  <h5>Email Us</h5>
                  <p>info@diotranics.co.ke</p>
                </div>
              </a>
              <div className="contact-card">
                <div className="contact-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path
                      d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg></div>
                <div>
                  <h5>Call Us</h5>
                  <p><a href="tel:+254721423793" className="phone-link">+254 721 423 793</a><br /><a href="tel:+254799524922"
                      className="phone-link">+254 799 524 922</a></p>
                </div>
              </div>
              <a href="https://wa.me/254721423793" target="_blank" rel="noreferrer" className="contact-card">
                <div className="contact-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path
                      d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg></div>
                <div>
                  <h5>WhatsApp</h5>
                  <p>+254 721 423 793</p>
                </div>
              </a>
            </div>
            <div className="social-buttons">
              <a href="https://facebook.com/yourpage" target="_blank" rel="noreferrer" className="btn btn-facebook">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
                Facebook
              </a>
              <a href="https://tiktok.com/@yourprofile" target="_blank" rel="noreferrer" className="btn btn-dark">TikTok</a>
            </div>
          </div>
          <div className="about-map reveal-on-scroll">
            <div className="map-border-1"></div>
            <div className="map-border-2"></div>
            <div className="map-container">
              <iframe
                title="Location Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15953.585573456883!2d36.9534927!3d-1.5303644!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f70b77626359d%3A0x6b4f741639d7328d!2sKitengela!5e0!3m2!1sen!2ske!4v1715942857431!5m2!1sen!2ske"
                width="100%" height="500" style={{ border: 0, filter: 'grayscale(100%) invert(90%) contrast(120%)' }}
                allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About

