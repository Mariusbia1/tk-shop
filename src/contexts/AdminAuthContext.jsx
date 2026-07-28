import { createContext, useContext, useEffect, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

const AdminAuthContext = createContext(null)
export function AdminAuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return undefined
    }

    const loadSession = async (nextSession) => {
      setSession(nextSession)
      if (!nextSession?.user) {
        setProfile(null)
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .eq('id', nextSession.user.id)
        .maybeSingle()

      setProfile(data)
      setLoading(false)
    }

    supabase.auth.getSession().then(({ data }) => loadSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      if (!nextSession) {
        setProfile(null)
        setLoading(false)
        return
      }

      // Supabase déconseille les requêtes asynchrones directement dans ce callback.
      // On les décale pour éviter de bloquer signInWithPassword.
      setTimeout(() => loadSession(nextSession), 0)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const login = async (email, password) => {
    if (!supabase) throw new Error('Supabase n’est pas encore configuré.')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error

    const { data: adminProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('id', data.user.id)
      .maybeSingle()

    if (profileError) throw profileError
    if (adminProfile?.role !== 'admin') {
      await supabase.auth.signOut()
      throw new Error('Ce compte ne possède pas encore le rôle administrateur.')
    }

    setSession(data.session)
    setProfile(adminProfile)
    return { ...data, profile: adminProfile }
  }

  const logout = async () => {
    if (supabase) await supabase.auth.signOut()
  }

  const isAuthenticated = Boolean(session && profile?.role === 'admin')
  return <AdminAuthContext.Provider value={{ isAuthenticated, session, profile, loading, login, logout, isSupabaseConfigured }}>{children}</AdminAuthContext.Provider>
}
export const useAdminAuth = () => useContext(AdminAuthContext)
