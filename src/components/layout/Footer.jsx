import { Link } from 'react-router-dom'
import { Instagram, Facebook } from 'lucide-react'
import { siteConfig } from '../../config/siteConfig'
export default function Footer() {
  return <footer className="bg-gradient-to-br from-[#7c204a] via-plum to-ink text-white"><div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-4 lg:px-8">
    <div className="md:col-span-2"><p className="mb-3 text-[10px] font-bold uppercase tracking-[.25em] text-sand">Tricoté avec douceur à Cotonou</p><h2 className="font-display text-3xl">{siteConfig.name}</h2><p className="mt-4 max-w-md text-sm leading-7 text-white/60">{siteConfig.description}</p></div>
    <div><h3 className="text-xs font-bold uppercase tracking-[.18em] text-sand">Explorer</h3><div className="mt-5 grid gap-3 text-sm text-white/70"><Link to="/collections">Collection</Link><Link to="/a-propos">Notre histoire</Link><Link to="/faq">Questions fréquentes</Link><Link to="/livraison-et-retours">Livraison et retours</Link></div></div>
    <div><h3 className="text-xs font-bold uppercase tracking-[.18em] text-sand">Nous contacter</h3><div className="mt-5 grid gap-3 text-sm text-white/70"><span>{siteConfig.phone}</span><span>{siteConfig.email}</span><span>{siteConfig.address}</span><div className="flex gap-4"><a href={siteConfig.instagram} aria-label="Instagram"><Instagram /></a><a href={siteConfig.facebook} aria-label="Facebook"><Facebook /></a></div></div></div>
  </div><div className="border-t border-white/10 px-5 py-5 text-center text-xs text-white/45">© 2026 Marlène Shop. Tous droits réservés.</div></footer>
}
