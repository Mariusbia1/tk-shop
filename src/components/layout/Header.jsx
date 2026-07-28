import { LayoutDashboard, Menu, Search, ShoppingBag, X, Moon, Sun } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useCart } from '../../contexts/CartContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useAdminAuth } from '../../contexts/AdminAuthContext'
import { useCatalog } from '../../contexts/CatalogContext'

const links = [['/', 'Accueil'], ['/collections', 'Collection'], ['/galerie', 'Galerie'], ['/a-propos', 'À propos'], ['/contact', 'Contact']]

export default function Header() {
  const [open, setOpen] = useState(false)
  const { itemCount } = useCart()
  const { theme, toggleTheme } = useTheme()
  const { isAuthenticated } = useAdminAuth()
  const { settings } = useCatalog()
  return <>
    <header className="sticky top-0 z-40 border-b border-goldSoft/15 bg-ivory/90 shadow-sm backdrop-blur-xl dark:bg-plum/90">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-2.5 sm:gap-3" aria-label="TK SHOP — Taye et Kinde Shop, accueil">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-gold font-display text-base font-semibold text-gold sm:h-12 sm:w-12 sm:text-lg">TK</span>
          <span className="leading-none">
            <span className="block whitespace-nowrap font-display text-lg tracking-[.1em] sm:text-2xl sm:tracking-[.12em]">{settings.shop_name}</span>
            <span className="mt-1.5 block whitespace-nowrap text-[6px] font-semibold uppercase tracking-[.14em] text-ink/65 sm:text-[8px] sm:tracking-[.22em] lg:text-[9px]">{settings.full_name}</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-7 lg:flex">{links.map(([to, label]) => <NavLink key={to} to={to} className={({ isActive }) => `text-xs font-semibold uppercase tracking-[.13em] ${isActive ? 'text-gold' : 'hover:text-gold'}`}>{label}</NavLink>)}{isAuthenticated&&<Link to="/admin" className="flex items-center gap-2 rounded-full border border-gold/30 bg-mist px-4 py-2 text-[10px] font-bold uppercase tracking-[.1em] text-gold transition hover:bg-gold hover:text-white"><LayoutDashboard className="h-3.5 w-3.5"/>Tableau de bord</Link>}</nav>
        <div className="flex items-center gap-2.5 sm:gap-4">
          <Link to="/collections" className="hidden sm:block" aria-label="Rechercher dans la collection"><Search className="h-5 w-5" /></Link>
          <button onClick={toggleTheme} className="grid h-10 w-10 place-items-center rounded-full bg-mist text-gold transition hover:scale-105 dark:bg-white/10" aria-label={theme === 'light' ? 'Activer le mode sombre' : 'Activer le mode clair'}>
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
          <Link to="/panier" className="relative" aria-label={`Panier, ${itemCount} articles`}><ShoppingBag className="h-5 w-5" />{itemCount > 0 && <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-gold px-1 text-[9px] text-white">{itemCount}</span>}</Link>
          <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Ouvrir le menu"><Menu /></button>
        </div>
      </div>
    </header>
    {open && <div className="fixed inset-0 z-50 bg-ivory p-6 dark:bg-plum lg:hidden"><div className="flex items-start justify-between"><span className="flex items-center gap-3"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 border-gold font-display text-lg text-gold">TK</span><span className="leading-none"><span className="block font-display text-2xl tracking-[.12em]">TK SHOP</span><span className="mt-2 block text-[8px] font-semibold uppercase tracking-[.18em] text-ink/60 dark:text-white/60">Taye &amp; Kinde Shop</span></span></span><button onClick={() => setOpen(false)} aria-label="Fermer"><X /></button></div><p className="mt-12 text-xs font-bold uppercase tracking-[.25em] text-gold">Le crochet fait avec amour</p><nav className="mt-8 grid gap-6">{links.map(([to, label]) => <Link className="font-display text-3xl" onClick={() => setOpen(false)} key={to} to={to}>{label}</Link>)}{isAuthenticated&&<Link to="/admin" onClick={() => setOpen(false)} className="mt-2 flex items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-bold uppercase tracking-[.1em] text-white"><LayoutDashboard className="h-4 w-4"/>Tableau de bord</Link>}</nav></div>}
  </>
}
