import React from 'react'
import Hero from './Hero'
import Services from './Services'
import Portfolio from './Portfolio'
import About from './About'
import Footer from '../components/layout/Footer'

const Home = () => {
  return (
    <>
      <Hero />
      <Services />
      <Portfolio />
      <About />
      <Footer />
    </>
  )
}

export default Home
