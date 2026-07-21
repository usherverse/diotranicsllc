import React, { useState, useEffect } from 'react'

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const slides = [
    {
      img: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1920&q=80",
      badge: "Industrial \u2022 Commercial \u2022 Residential",
      title: "Expert Electrical Solutions",
      p: "Professional wiring, maintenance, and installation services tailored to your needs.",
      btnText: "Our Services",
      target: "#services"
    },
    {
      img: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1920&q=80",
      badge: "Go Green \u2022 Save Money",
      title: "Sustainable Solar Power",
      p: "Complete solar system design, installation, and maintenance for energy independence.",
      btnText: "View Projects",
      target: "#portfolio"
    },
    {
      img: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1920&q=80",
      badge: "Borehole Drilling \u2022 Pump Installation",
      title: "Reliable Water Solutions",
      p: "Ensuring consistent water supply with professional borehole and pump services.",
      btnText: "Contact Us",
      target: "#about"
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [slides.length])

  const scrollToSection = (id) => {
    const el = document.querySelector(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="hero" id="home">
      <div className="hero-overlay"></div>
      <div className="carousel" id="carousel">
        <div 
          className="carousel-track" 
          id="carouselTrack" 
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div key={index} className="carousel-slide">
              <img src={slide.img} alt={slide.title} loading="lazy" />
              <div className="slide-content container">
                <span className="slide-badge">{slide.badge}</span>
                <h1>{slide.title}</h1>
                <p>{slide.p}</p>
                <button 
                  className="btn btn-primary btn-skew btn-lg" 
                  onClick={() => scrollToSection(slide.target)}
                >
                  <span>
                    {slide.btnText}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="carousel-dots" id="carouselDots">
        {slides.map((_, index) => (
          <button 
            key={index} 
            className={`carousel-dot ${currentSlide === index ? 'active' : ''}`} 
            onClick={() => setCurrentSlide(index)}
          ></button>
        ))}
      </div>
    </section>
  )
}

export default Hero

