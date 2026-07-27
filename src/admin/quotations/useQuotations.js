import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../config/supabaseClient'

export function useQuotations() {
  const [quotations, setQuotations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchQuotations = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('quotations')
        .select(`
          *,
          client:client_id (*)
        `)
        .order('created_at', { ascending: false })
      
      if (err) throw err
      setQuotations(data || [])
    } catch (err) {
      setError(err.message)
      console.error("Error fetching quotations:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchQuotations()
  }, [fetchQuotations])

  const getQuotationById = async (id) => {
    try {
      const { data, error } = await supabase
        .from('quotations')
        .select(`
          *,
          client:client_id (*),
          sections:quotation_sections (
            *,
            items:quotation_items (*)
          )
        `)
        .eq('id', id)
        .single()
      
      if (error) throw error
      // Sort sections and items by order_index
      if (data && data.sections) {
        data.sections.sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
        data.sections.forEach(sec => {
          if (sec.items) {
            sec.items.sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
          }
        })
      }
      return data
    } catch (err) {
      console.error("Error fetching quotation details:", err)
      throw err
    }
  }

  const deleteQuotation = async (id) => {
    try {
      // Clean up child tables explicitly in case ON DELETE CASCADE is missing
      await supabase.from('quotation_signatures').delete().eq('quotation_id', id)
      await supabase.from('quotation_activity').delete().eq('quotation_id', id)
      await supabase.from('quotation_items').delete().eq('quotation_id', id)
      await supabase.from('quotation_sections').delete().eq('quotation_id', id)

      const { error } = await supabase
        .from('quotations')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      setQuotations(prev => prev.filter(q => q.id !== id))
      return true
    } catch (err) {
      console.error("Error deleting quotation:", err)
      throw err
    }
  }

  return {
    quotations,
    loading,
    error,
    refreshQuotations: fetchQuotations,
    getQuotationById,
    deleteQuotation
  }
}
