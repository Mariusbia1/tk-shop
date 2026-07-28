import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, Shapes, ShoppingCart, Images, Quote,
  FileText, Settings, User, LogOut, Search, Bell, Menu, X, ChevronRight, ExternalLink,
} from 'lucide-react'
import { useAdminAuth } from '../contexts/AdminAuthContext'
import InstallAppButton from '../components/common/InstallAppButton'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'

const nav = [
  ['/admin', LayoutDashboard, 'Tableau de bord'],
  ['/admin/produits', Package, 'Produits'],
  ['/admin/categories', Shapes, 'Catégories'],
  ['/admin/commandes', ShoppingCart, 'Commandes'],
  ['/admin/galerie', Images, 'Galerie'],
  ['/admin/temoignages', Quote, 'Témoignages'],
  ['/admin/contenus', FileText, 'Contenus'],
  ['/admin/parametres', Settings, 'Paramètres'],
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
  const [newOrders, setNewOrders] = useState(0)
  const { pathname } = useLocation()
  const current = nav.find(([to]) => to === pathname)?.[2] || 'Administration'

  useEffect(() => {
    if (!supabase) return undefined
    const channel = supabase.channel('admin-new-orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, ({ new: order }) => {
        setNewOrders((count) => count + 1)
        toast.success(`Nouvelle commande ${order.order_number || ''}`, { duration: 7000 })
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Nouvelle commande TK SHOP', { body: `${order.customer_name} vient de passer une commande.` })
        }
      })
      .subscribe()
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission()
    return () => { supabase.removeChannel(channel) }
  }, [])

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
            <label className="hidden h-11 min-w-64 items-center gap-3 rounded-2xl border border-[#e3d3ad] bg-[#fffdf7] px-4 xl:flex dark:border-white/10 dark:bg-white/5">
              <Search className="h-4 w-4 text-[#a67b20]" />
              <input placeholder="Rechercher dans l’administration" className="w-full bg-transparent text-xs outline-none" />
            </label>
            <InstallAppButton compact manifestHref="/admin-manifest.webmanifest" label="Installer TK Admin" />
            <Link to="/admin/commandes" onClick={()=>setNewOrders(0)} className="relative grid h-11 w-11 place-items-center rounded-2xl border border-[#e3d3ad] bg-white dark:border-white/10 dark:bg-white/5" aria-label={`${newOrders} nouvelles commandes`}>
              <Bell className="h-4 w-4" />
              {newOrders>0&&<span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#b88b22] px-1 text-[9px] font-bold text-white">{newOrders}</span>}
            </Link>
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
