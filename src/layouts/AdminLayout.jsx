import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, Shapes, ShoppingCart, Images, Quote,
  FileText, Settings, User, LogOut, Search, Bell, Menu, X, ChevronRight, ExternalLink, ShieldCheck,
} from 'lucide-react'
import { useAdminAuth } from '../contexts/AdminAuthContext'
import InstallAppButton from '../components/common/InstallAppButton'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '../services/notificationService'

const nav = [
  ['/admin', LayoutDashboard, 'Tableau de bord'],
  ['/admin/produits', Package, 'Produits'],
  ['/admin/categories', Shapes, 'Catégories'],
  ['/admin/commandes', ShoppingCart, 'Commandes'],
  ['/admin/galerie', Images, 'Galerie'],
  ['/admin/temoignages', Quote, 'Témoignages'],
  ['/admin/contenus', FileText, 'Contenus'],
  ['/admin/parametres', Settings, 'Paramètres'],
  ['/admin/activite', ShieldCheck, 'Journal de sécurité'],
  ['/admin/profil', User, 'Profil'],
]

function SidebarContent({ onNavigate }) {
  const { logout } = useAdminAuth()
  const navigate = useNavigate()

  const signOut = () => {
    logout()
    navigate('/admin/connexion')
  }

  return <>
    <div className="flex h-24 items-center border-b border-white/10 px-6">
      <div>
        <p className="font-display text-2xl text-white">TK SHOP</p>
        <p className="mt-1 text-[9px] font-bold uppercase tracking-[.28em] text-[#d7b65e]">Espace administration</p>
      </div>
    </div>

    <div className="px-4 py-6">
      <p className="mb-3 px-3 text-[9px] font-bold uppercase tracking-[.22em] text-white/35">Navigation</p>
      <nav className="grid gap-1.5">
        {nav.map(([to, Icon, label]) => (
          <NavLink
            end={to === '/admin'}
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) => `group flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm transition ${
              isActive
                ? 'bg-gradient-to-r from-[#b88b22] to-[#96701c] font-semibold text-white shadow-lg shadow-black/20'
                : 'text-white/60 hover:bg-white/8 hover:text-white'
            }`}
          >
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/8 group-hover:bg-white/12">
              <Icon className="h-4 w-4" />
            </span>
            <span className="flex-1">{label}</span>
            <ChevronRight className="h-3.5 w-3.5 opacity-40" />
          </NavLink>
        ))}
      </nav>
    </div>

    <div className="mt-auto p-4">
      <Link to="/" onClick={onNavigate} className="mb-3 flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/75 transition hover:bg-white/10 hover:text-white">
        <ExternalLink className="h-4 w-4 text-[#d7b65e]" />
        Voir le site
      </Link>
      <div className="mb-3 rounded-2xl border border-white/10 bg-white/5 p-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#d7b65e] to-[#b88b22] font-display text-xs font-bold text-white">TK</div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">TK</p>
            <p className="truncate text-[10px] text-white/45">Administratrice</p>
          </div>
        </div>
      </div>
      <button onClick={signOut} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm text-white/55 transition hover:bg-white/8 hover:text-white">
        <LogOut className="h-4 w-4" />
        Déconnexion
      </button>
    </div>
  </>
}

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState(() => 'Notification' in window ? Notification.permission : 'unsupported')
  const notificationPanel = useRef(null)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const current = nav.find(([to]) => to === pathname)?.[2] || 'Administration'

  useEffect(() => {
    if (!supabase) return undefined
    getNotifications().then(setNotifications).catch(() => {})
    const channel = supabase.channel('admin-notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'admin_notifications' }, ({ new: notification }) => {
        setNotifications((current) => [notification, ...current].slice(0, 20))
        toast.success(notification.title, { duration: 7000 })
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(notification.title, { body: notification.message, icon: '/app-icon-192.png' })
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  useEffect(() => {
    const close = (event) => {
      if (notificationPanel.current && !notificationPanel.current.contains(event.target)) setNotificationsOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const unreadCount = notifications.filter((item) => !item.read_at).length
  const openNotification = async (notification) => {
    if (!notification.read_at) {
      const readAt = new Date().toISOString()
      setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, read_at: readAt } : item))
      try { await markNotificationRead(notification.id) } catch { toast.error('Impossible de marquer la notification comme lue.') }
    }
    setNotificationsOpen(false)
    if (notification.target_path) navigate(notification.target_path)
  }
  const markAllRead = async () => {
    const readAt = new Date().toISOString()
    setNotifications((current) => current.map((item) => ({ ...item, read_at: item.read_at || readAt })))
    try { await markAllNotificationsRead() } catch { toast.error('Impossible de mettre les notifications à jour.') }
  }
  const enableBrowserNotifications = async () => {
    if (!('Notification' in window)) return
    const permission = await Notification.requestPermission()
    setNotificationPermission(permission)
    if (permission === 'granted') toast.success('Notifications du navigateur activées.')
  }

  return (
    <div className="admin-shell min-h-screen bg-[#faf5ea] text-ink dark:bg-[#17140f]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[272px] flex-col overflow-y-auto bg-gradient-to-b from-[#302712] via-[#241d0e] to-[#171109] lg:flex">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-[#171109]/65 backdrop-blur-sm" onClick={() => setMobileOpen(false)} aria-label="Fermer le menu" />
          <aside className="relative flex h-full w-[290px] flex-col overflow-y-auto bg-gradient-to-b from-[#302712] to-[#171109] shadow-2xl">
            <button onClick={() => setMobileOpen(false)} className="absolute right-4 top-5 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white" aria-label="Fermer">
              <X className="h-5 w-5" />
            </button>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="min-h-screen min-w-0 overflow-x-hidden lg:pl-[272px]">
        <header className="admin-topbar sticky top-0 z-30 flex h-20 items-center justify-between border-b border-[#e2d4b3] bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8 dark:border-white/10 dark:bg-[#241d0e]/90">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="grid h-11 w-11 place-items-center rounded-2xl bg-[#faf5ea] text-[#96701c] lg:hidden" aria-label="Ouvrir le menu">
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#a67b20]">TK SHOP</p>
              <h1 className="font-display text-xl sm:text-2xl">{current}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <label className="admin-search hidden h-11 min-w-64 items-center gap-3 rounded-2xl border border-[#e3d3ad] bg-[#fffdf7] px-4 transition focus-within:border-gold focus-within:ring-4 focus-within:ring-gold/10 xl:flex dark:border-goldSoft/25 dark:bg-[#2d271b]">
              <Search className="h-4 w-4 shrink-0 text-[#a67b20] dark:text-[#e2c778]" />
              <input placeholder="Rechercher dans l’administration" className="w-full bg-transparent text-xs text-ink outline-none placeholder:text-black/45 dark:text-[#fffdf7] dark:placeholder:text-[#bcb3a0]" />
            </label>
            <InstallAppButton compact manifestHref="/admin-manifest.webmanifest" label="Installer TK Admin" />
            <div className="relative" ref={notificationPanel}>
              <button onClick={() => setNotificationsOpen((open) => !open)} className="relative grid h-11 w-11 place-items-center rounded-2xl border border-[#e3d3ad] bg-white dark:border-white/10 dark:bg-white/5" aria-label={`${unreadCount} notifications non lues`} aria-expanded={notificationsOpen}>
                <Bell className="h-4 w-4" />
                {unreadCount>0&&<span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#b88b22] px-1 text-[9px] font-bold text-white">{unreadCount>9?'9+':unreadCount}</span>}
              </button>
              {notificationsOpen&&<div className="absolute right-0 top-14 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[#e3d3ad] bg-white shadow-2xl dark:border-white/10 dark:bg-[#241d0e]">
                <div className="flex items-center justify-between border-b border-[#eadfc5] p-4 dark:border-white/10"><div><p className="font-display text-lg">Notifications</p><p className="text-[10px] text-black/45 dark:text-white/45">{unreadCount ? `${unreadCount} non lue${unreadCount>1?'s':''}` : 'Tout est à jour'}</p></div>{unreadCount>0&&<button onClick={markAllRead} className="text-[10px] font-bold text-gold">Tout marquer comme lu</button>}</div>
                <div className="max-h-80 overflow-y-auto">{notifications.map((notification)=><button key={notification.id} onClick={()=>openNotification(notification)} className={`block w-full border-b border-[#f0e8d5] p-4 text-left transition hover:bg-mist/60 dark:border-white/5 dark:hover:bg-white/5 ${notification.read_at?'opacity-60':'bg-[#fffaf0] dark:bg-white/5'}`}><span className="flex items-start gap-3"><span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${notification.read_at?'bg-black/15':'bg-gold'}`}/><span><b className="block text-sm">{notification.title}</b><span className="mt-1 block text-xs leading-5 text-black/55 dark:text-white/55">{notification.message}</span><span className="mt-2 block text-[9px] text-black/35 dark:text-white/35">{new Date(notification.created_at).toLocaleString('fr-FR')}</span></span></span></button>)}{!notifications.length&&<p className="p-8 text-center text-xs text-black/45 dark:text-white/45">Aucune notification pour le moment.</p>}</div>
                {notificationPermission==='default'&&<button onClick={enableBrowserNotifications} className="w-full border-t border-[#eadfc5] p-3 text-xs font-semibold text-gold dark:border-white/10">Activer les alertes du navigateur</button>}
              </div>}
            </div>
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#d7b65e] to-[#B38A2C] font-display text-xs font-bold text-white shadow-md">TK</div>
          </div>
        </header>

        <main className="admin-content min-w-0 max-w-full overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
