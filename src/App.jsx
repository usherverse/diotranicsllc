import React from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Home from './sections/Home'
import Login from './admin/Login'
import Dashboard from './admin/Dashboard'
import ResetPassword from './admin/ResetPassword'
import SampleQuotationPreview from './admin/quotations/SampleQuotationPreview'
import { useScrollReveal } from './hooks/useScrollReveal'

function AppInner() {
  useScrollReveal()
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  return (
    <div className="app-wrapper min-h-screen">
      <Navbar isAdmin={isAdmin} />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/reset-password" element={<ResetPassword />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/sample-quotation" element={<SampleQuotationPreview />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppInner />
    </Router>
  )
}

export default App


