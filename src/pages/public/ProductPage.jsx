import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Minus, Plus, MessageCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import SEO from '../../components/common/SEO'
import Button from '../../components/common/Button'
import ProductCard from '../../components/products/ProductCard'
import { products } from '../../data/products'
import { formatCurrency } from '../../utils/formatCurrency'
import { useCart } from '../../contexts/CartContext'
import { siteConfig } from '../../config/siteConfig'

export default function ProductPage() {
  const { slug } = useParams()
  const product = products.find(p => p.slug === slug)
  const { addItem } = useCart()
  const [activeImage, setActiveImage] = useState(0)
  const [size, setSize] = useState('')
  const [color, setColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [measurements, setMeasurements] = useState('')
  const [note, setNote] = useState('')
  if (!product) return <div className="px-5 py-32 text-center"><h1 className="font-display text-4xl">Création introuvable</h1><Button to="/collections" className="mt-6">Retour à la collection</Button></div>
  const validate = () => {
    if (product.sizes.length && !size) { toast.error('Veuillez choisir une taille.'); return false }
    if (product.colors.length && !color) { toast.error('Veuillez choisir une couleur.'); return false }
    return true
  }
  const add = () => validate() && addItem(product, { size, color, quantity, measurements, note })
  return <><SEO title={`${product.name} | Marlène Shop`} /><div className="mx-auto max-w-7xl px-5 py-8 lg:px-8"><nav className="mb-8 text-xs text-black/50"><Link to="/">Accueil</Link> / <Link to="/collections">Collection</Link> / {product.name}</nav>
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-16"><div><div className="aspect-[4/5] overflow-hidden bg-mist"><img src={product.images[activeImage]} alt={product.name} className="h-full w-full object-cover" /></div><div className="mt-3 flex gap-3">{product.images.map((image,i)=><button key={image} onClick={()=>setActiveImage(i)} className={`h-24 w-20 overflow-hidden border-2 ${activeImage===i?'border-gold':'border-transparent'}`}><img src={image} alt={`${product.name}, vue ${i+1}`} className="h-full w-full object-cover" /></button>)}</div></div>
    <div className="lg:py-6"><p className="text-xs font-bold uppercase tracking-[.2em] text-gold">{product.category}</p><h1 className="mt-3 font-display text-4xl md:text-5xl">{product.name}</h1><p className="mt-4 text-xl font-semibold">{formatCurrency(product.price)}</p><p className="mt-6 leading-8 text-black/60">{product.description}</p>
      {product.colors.length>0&&<fieldset className="mt-8"><legend className="mb-3 text-sm font-bold">Couleur <span className="font-normal text-black/45">{color}</span></legend><div className="flex flex-wrap gap-2">{product.colors.map(c=><button key={c} onClick={()=>setColor(c)} className={`border px-4 py-2 text-sm ${color===c?'border-ink bg-ink text-white':'border-black/20'}`}>{c}</button>)}</div></fieldset>}
      {product.sizes.length>0&&<fieldset className="mt-7"><legend className="mb-3 text-sm font-bold">Taille</legend><div className="flex flex-wrap gap-2">{product.sizes.map(s=><button key={s} onClick={()=>setSize(s)} className={`grid h-11 min-w-11 place-items-center border px-3 text-sm ${size===s?'border-ink bg-ink text-white':'border-black/20'}`}>{s}</button>)}</div></fieldset>}
      {product.customizable&&<div className="mt-7 grid gap-4"><label className="text-sm font-bold">Mensurations <input value={measurements} onChange={e=>setMeasurements(e.target.value)} placeholder="Poitrine, taille, hanches, longueur…" className="mt-2 w-full border border-black/20 bg-white px-4 py-3 font-normal outline-none focus:border-gold" /></label><label className="text-sm font-bold">Note de personnalisation <textarea value={note} onChange={e=>setNote(e.target.value)} rows="3" placeholder="Décrivez votre souhait" className="mt-2 w-full resize-none border border-black/20 bg-white px-4 py-3 font-normal outline-none focus:border-gold" /></label></div>}
      <div className="mt-8 flex gap-3"><div className="flex items-center border border-black/20"><button onClick={()=>setQuantity(Math.max(1,quantity-1))} className="p-3" aria-label="Diminuer"><Minus className="h-4 w-4" /></button><span className="w-8 text-center text-sm">{quantity}</span><button onClick={()=>setQuantity(quantity+1)} className="p-3" aria-label="Augmenter"><Plus className="h-4 w-4" /></button></div><Button className="flex-1" onClick={add}>Ajouter au panier</Button></div>
      <a href={`https://wa.me/${siteConfig.whatsapp}`} target="_blank" rel="noreferrer" className="mt-3 flex min-h-12 items-center justify-center gap-2 border border-ink text-sm font-semibold"><MessageCircle className="h-4 w-4" /> Commander directement sur WhatsApp</a>
      <div className="mt-8 divide-y border-y text-sm"><div className="py-4"><b>Délai de confection :</b> {product.productionTime}</div><div className="py-4"><b>Matières :</b> {product.materials}</div><div className="py-4"><b>Entretien :</b> {product.careInstructions}</div></div>
    </div></div>
    <section className="py-24"><h2 className="mb-8 font-display text-3xl">Vous aimerez aussi</h2><div className="grid grid-cols-2 gap-5 md:grid-cols-4">{products.filter(p=>p.categorySlug===product.categorySlug&&p.id!==product.id).slice(0,4).map(p=><ProductCard key={p.id} product={p}/>)}</div></section></div></>
}
