import { Link } from 'react-router-dom'
import { Instagram, Facebook } from 'lucide-react'
import { useCatalog } from '../../contexts/CatalogContext'

const safeSocialUrl = (value) => {
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : null
  } catch { return null }
}

const PinterestIcon = () => <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 fill-current"><path d="M12 2a10 10 0 0 0-3.64 19.31c-.09-1.64-.02-3.6.41-5.45l1.29-5.46s-.32-.66-.32-1.63c0-1.53.89-2.67 1.99-2.67.94 0 1.39.7 1.39 1.55 0 .94-.6 2.35-.91 3.66-.26 1.09.55 1.98 1.63 1.98 1.95 0 3.45-2.06 3.45-5.03 0-2.63-1.89-4.47-4.59-4.47-3.13 0-4.96 2.35-4.96 4.77 0 .95.36 1.96.82 2.51.09.11.1.2.08.31l-.31 1.26c-.05.2-.16.25-.37.15-1.38-.64-2.24-2.66-2.24-4.28 0-3.49 2.53-6.69 7.3-6.69 3.83 0 6.81 2.73 6.81 6.38 0 3.81-2.4 6.87-5.73 6.87-1.12 0-2.17-.58-2.53-1.27l-.69 2.62c-.25.96-.92 2.16-1.37 2.89A10 10 0 1 0 12 2Z"/></svg>
export default function Footer() {
  const { settings } = useCatalog()
  const instagram=safeSocialUrl(settings.instagram),facebook=safeSocialUrl(settings.facebook),pinterest=safeSocialUrl(settings.pinterest)
  return <footer className="bg-gradient-to-br from-[#413416] via-plum to-ink text-white"><div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-4 lg:px-8">
    <div className="md:col-span-2"><p className="mb-3 text-[10px] font-bold uppercase tracking-[.25em] text-sand">Crocheté avec passion à Cotonou</p><h2 className="font-display text-3xl">{settings.shop_name}</h2><p className="mt-2 text-[9px] font-semibold uppercase tracking-[.24em] text-sand">{settings.full_name}</p><p className="mt-4 max-w-md text-sm leading-7 text-white/60">Des pièces en crochet uniques, élégantes et personnalisables, réalisées point après point à la main.</p></div>
    <div><h3 className="text-xs font-bold uppercase tracking-[.18em] text-sand">Explorer</h3><div className="mt-5 grid gap-3 text-sm text-white/70"><Link to="/collections">Collection</Link><Link to="/a-propos">Notre histoire</Link><Link to="/faq">Questions fréquentes</Link><Link to="/livraison-et-retours">Livraison et retours</Link></div></div>
    <div><h3 className="text-xs font-bold uppercase tracking-[.18em] text-sand">Nous contacter</h3><div className="mt-5 grid gap-3 text-sm text-white/70"><span>{settings.phone}</span><span>{settings.email}</span><span>{settings.address}</span><div className="flex gap-4">{instagram&&<a href={instagram} target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram /></a>}{facebook&&<a href={facebook} target="_blank" rel="noreferrer" aria-label="Facebook"><Facebook /></a>}{pinterest&&<a href={pinterest} target="_blank" rel="noreferrer" aria-label="Pinterest"><PinterestIcon/></a>}</div></div></div>
  </div><nav className="mx-auto grid max-w-4xl grid-cols-3 border-t border-white/10 px-4 py-5 text-center text-[10px] font-semibold uppercase tracking-[.08em] text-white/60 sm:text-xs sm:tracking-[.14em]"><Link to="/conditions-generales" className="px-2 transition hover:text-sand">Conditions générales</Link><Link to="/politique-de-confidentialite" className="border-x border-white/10 px-2 transition hover:text-sand">Confidentialité</Link><Link to="/mentions-legales" className="px-2 transition hover:text-sand">Mentions légales</Link></nav><div className="border-t border-white/10 px-5 py-5 text-center text-xs text-white/45">© 2026 TK SHOP. Tous droits réservés. <span className="mx-2 text-white/20">•</span><a href="https://wa.me/2290157888284" target="_blank" rel="noreferrer" className="font-semibold text-sand transition hover:text-white">Réalisé par Mermouz</a></div></footer>
}
