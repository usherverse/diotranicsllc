import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../config/supabaseClient'

export function useClients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchClients = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error: err } = await supabase
        .from('qt_clients')
        .select('*')
        .order('client_name', { ascending: true })
      
      if (err) throw err
      setClients(data || [])
    } catch (err) {
      setError(err.message)
      console.error("Error fetching clients:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  const createClient = async (clientData) => {
    try {
      const { data, error: err } = await supabase
        .from('qt_clients')
        .insert([clientData])
        .select()
        .single()
      
      if (err) throw err
      setClients(prev => [...prev, data].sort((a, b) => a.client_name.localeCompare(b.client_name)))
      return data
    } catch (err) {
      console.error("Error creating client:", err)
      throw err
    }
  }

  const updateClient = async (id, clientData) => {
    try {
      const { data, error: err } = await supabase
        .from('qt_clients')
        .update({ ...clientData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      
      if (err) throw err
      setClients(prev => prev.map(c => c.id === id ? data : c))
      return data
    } catch (err) {
      console.error("Error updating client:", err)
      throw err
    }
  }

  return {
    clients,
    loading,
    error,
    refreshClients: fetchClients,
    createClient,
    updateClient
  }
}
