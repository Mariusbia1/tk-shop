import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { isSupabaseConfigured } from '../../lib/supabase'
import { recordPageVisit } from '../../services/catalogService'

export default function TrafficTracker() {
  const { pathname } = useLocation()

  useEffect(() => {
    if (!isSupabaseConfigured || pathname.startsWith('/admin')) return
    recordPageVisit(pathname).catch(() => {})
  }, [pathname])

  return null
}
