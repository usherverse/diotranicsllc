import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export const useScrollReveal = () => {
  useEffect(() => {
    const reveals = document.querySelectorAll('.reveal')
    
    reveals.forEach((el) => {
      gsap.fromTo(el, 
        { 
          opacity: 0, 
          y: 50,
          clipPath: 'inset(100% 0% 0% 0%)'
        }, 
        {
          opacity: 1,
          y: 0,
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 1.2,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      )
    })

    // Special staggering for grids
    const grids = document.querySelectorAll('.stagger-grid')
    grids.forEach((grid) => {
      const items = grid.children
      gsap.from(items, {
        opacity: 0,
        y: 30,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: grid,
          start: 'top 80%'
        }
      })
    })

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [])
}
