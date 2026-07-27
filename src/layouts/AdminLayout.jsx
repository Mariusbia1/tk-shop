import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, Shapes, ShoppingCart, Images, Quote,
  FileText, Settings, User, LogOut, Search, Bell, Menu, X, ChevronRight,
} from 'lucide-react'
import { useAdminAuth } from '../contexts/AdminAuthContext'
import InstallAppButton from '../components/common/InstallAppButton'

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
        <p className="font-display text-2xl text-white">Marlène Shop</p>
        <p className="mt-1 text-[9px] font-bold uppercase tracking-[.28em] text-[#ff9fc3]">Espace administration</p>
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
                ? 'bg-gradient-to-r from-[#ef4f8b] to-[#d83e78] font-semibold text-white shadow-lg shadow-pink-950/20'
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
      <div className="mb-3 rounded-2xl border border-white/10 bg-white/5 p-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#ff9fc3] to-[#ef4f8b] font-display text-lg text-white">M</div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">Marlène</p>
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
  const { pathname } = useLocation()
  const current = nav.find(([to]) => to === pathname)?.[2] || 'Administration'

  return (
    <div className="admin-shell min-h-screen bg-[#fff3f8] text-ink dark:bg-[#1f0d18]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[272px] flex-col overflow-y-auto bg-gradient-to-b from-[#50172f] via-[#3c1226] to-[#250b18] lg:flex">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-[#1b0813]/65 backdrop-blur-sm" onClick={() => setMobileOpen(false)} aria-label="Fermer le menu" />
          <aside className="relative flex h-full w-[290px] flex-col overflow-y-auto bg-gradient-to-b from-[#50172f] to-[#250b18] shadow-2xl">
            <button onClick={() => setMobileOpen(false)} className="absolute right-4 top-5 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white" aria-label="Fermer">
              <X className="h-5 w-5" />
            </button>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="min-h-screen lg:pl-[272px]">
        <header className="admin-topbar sticky top-0 z-30 flex h-20 items-center justify-between border-b border-[#f4c9d9] bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8 dark:border-white/10 dark:bg-[#2c1221]/90">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="grid h-11 w-11 place-items-center rounded-2xl bg-[#fff0f6] text-[#d83e78] lg:hidden" aria-label="Ouvrir le menu">
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#d84b7f]">Marlène Shop</p>
              <h1 className="font-display text-xl sm:text-2xl">{current}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <label className="hidden h-11 min-w-64 items-center gap-3 rounded-2xl border border-[#f3d2df] bg-[#fff8fb] px-4 xl:flex dark:border-white/10 dark:bg-white/5">
              <Search className="h-4 w-4 text-[#d84b7f]" />
              <input placeholder="Rechercher dans l’administration" className="w-full bg-transparent text-xs outline-none" />
            </label>
            <InstallAppButton compact manifestHref="/admin-manifest.webmanifest" label="Installer Marlène Admin" />
            <button className="relative grid h-11 w-11 place-items-center rounded-2xl border border-[#f3d2df] bg-white dark:border-white/10 dark:bg-white/5" aria-label="Notifications">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full border-2 border-white bg-[#ef4f8b]" />
            </button>
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#ff9fc3] to-[#e84f8a] font-display text-lg text-white shadow-md">M</div>
          </div>
        </header>

        <main className="admin-content p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
