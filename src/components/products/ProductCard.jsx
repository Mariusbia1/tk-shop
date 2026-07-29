import { Heart, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatCurrency } from '../../utils/formatCurrency'
import { useCart } from '../../contexts/CartContext'
export default function ProductCard({ product }) {
  const { addItem } = useCart()
  const unavailable = product.stockStatus === 'Indisponible'
  const canQuickAdd = !unavailable && !product.sizes.length && !product.colors.length
  return <article className="group rounded-[1.75rem] bg-white p-2 shadow-soft transition duration-500 hover:-translate-y-1 dark:bg-white/5">
    <div className="relative aspect-[3/4] overflow-hidden rounded-[1.35rem] bg-mist"><Link to={`/collections/${product.slug}`}>{product.images[0]?<img loading="lazy" src={product.images[0]} alt={product.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />:product.media?.[0]?.type==='video'?<video src={product.media[0].url} muted playsInline preload="metadata" className="h-full w-full object-cover transition duration-700 group-hover:scale-105"/>:<span className="grid h-full place-items-center text-xs text-black/45">Aucun média</span>}</Link>
      <span className="absolute left-3 top-3 rounded-full bg-ivory/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gold backdrop-blur">{product.stockStatus === 'Disponible' ? 'Disponible immédiatement' : product.stockStatus}</span>
      <button aria-label="Ajouter aux favoris" className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90"><Heart className="h-4 w-4" /></button>
      <button disabled={unavailable} onClick={() => canQuickAdd ? addItem(product) : null} className="absolute bottom-3 left-3 right-3 flex translate-y-14 items-center justify-center gap-2 rounded-full bg-plum/90 py-3 text-xs font-semibold text-white backdrop-blur transition group-hover:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70">{unavailable?'Indisponible':canQuickAdd ? <><Plus className="h-4 w-4" /> Ajouter au panier</> : <Link to={`/collections/${product.slug}`}>Choisir les options</Link>}</button>
    </div>
    <div className="px-2 pb-3 pt-4"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-gold">{product.category} au crochet</p><Link to={`/collections/${product.slug}`} className="mt-1 block font-display text-xl">{product.name}</Link><p className="mt-1 text-sm font-semibold text-gold">{formatCurrency(product.price)}</p></div>
  </article>
}
