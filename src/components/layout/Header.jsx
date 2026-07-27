import { Menu, Search, ShoppingBag, X, Moon, Sun } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useCart } from '../../contexts/CartContext'
import { useTheme } from '../../contexts/ThemeContext'

const links = [['/', 'Accueil'], ['/collections', 'Collection'], ['/galerie', 'Galerie'], ['/a-propos', 'À propos'], ['/contact', 'Contact']]

export default function Header() {
  const [open, setOpen] = useState(false)
  const { itemCount } = useCart()
  const { theme, toggleTheme } = useTheme()
  return <>
    <header className="sticky top-0 z-40 border-b border-rose/15 bg-ivory/90 shadow-sm backdrop-blur-xl dark:bg-plum/90">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link to="/" className="font-display text-2xl tracking-wide">Marlène Shop</Link>
        <nav className="hidden items-center gap-7 lg:flex">{links.map(([to, label]) => <NavLink key={to} to={to} className={({ isActive }) => `text-xs font-semibold uppercase tracking-[.13em] ${isActive ? 'text-gold' : 'hover:text-gold'}`}>{label}</NavLink>)}</nav>
        <div className="flex items-center gap-4">
          <Link to="/collections" aria-label="Rechercher dans la collection"><Search className="h-5 w-5" /></Link>
          <button onClick={toggleTheme} className="grid h-10 w-10 place-items-center rounded-full bg-mist text-gold transition hover:scale-105 dark:bg-white/10" aria-label={theme === 'light' ? 'Activer le mode sombre' : 'Activer le mode clair'}>
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
          <Link to="/panier" className="relative" aria-label={`Panier, ${itemCount} articles`}><ShoppingBag className="h-5 w-5" />{itemCount > 0 && <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-gold px-1 text-[9px] text-white">{itemCount}</span>}</Link>
          <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Ouvrir le menu"><Menu /></button>
        </div>
      </div>
    </header>
    {open && <div className="fixed inset-0 z-50 bg-ivory p-6 dark:bg-plum lg:hidden"><div className="flex items-center justify-between"><span className="font-display text-2xl">Marlène Shop</span><button onClick={() => setOpen(false)} aria-label="Fermer"><X /></button></div><p className="mt-12 text-xs font-bold uppercase tracking-[.25em] text-gold">La maille faite avec amour</p><nav className="mt-8 grid gap-6">{links.map(([to, label]) => <Link className="font-display text-3xl" onClick={() => setOpen(false)} key={to} to={to}>{label}</Link>)}</nav></div>}
  </>
}
