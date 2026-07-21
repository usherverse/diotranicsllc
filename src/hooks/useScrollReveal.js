import { useEffect } from 'react'

export const useScrollReveal = (deps = []) => {
  useEffect(() => {
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed')
          
          // Stagger service items per grid if applicable
          if (entry.target.classList.contains('service-items-grid')) {
            entry.target.querySelectorAll('.service-item').forEach((item, i) => {
              setTimeout(() => item.classList.add('revealed'), i * 75)
            })
          }
          
          revealObs.unobserve(entry.target)
        }
      })
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' })

    const elements = document.querySelectorAll('.reveal-on-scroll, .service-items-grid')
    elements.forEach(el => revealObs.observe(el))

    return () => {
      elements.forEach(el => revealObs.unobserve(el))
    }
  }, deps)
}
