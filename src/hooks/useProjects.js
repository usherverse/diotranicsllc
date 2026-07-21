import { useState, useEffect } from 'react'
import { supabase } from '../config/supabaseClient'

// Final project categories
const CATEGORIES = ['electrical', 'solar', 'borehole']

export const useProjects = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('projects')
          .select('*, images(*)')
          .is('deleted_at', null)
          .order('created_at', { ascending: false })

        if (error) throw error

        if (data) {
          setProjects(data)
        }

      } catch (err) {
        console.error("Error fetching projects:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  return { projects, loading, error }
}
