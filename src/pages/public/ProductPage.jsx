import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, MessageCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import SEO from '../../components/common/SEO'
import Button from '../../components/common/Button'
import ProductCard from '../../components/products/ProductCard'
import { useCatalog } from '../../contexts/CatalogContext'
import { formatCurrency } from '../../utils/formatCurrency'
import { useCart } from '../../contexts/CartContext'

export default function ProductPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { products } = useCatalog()
  const product = products.find(p => p.slug === slug)
  const { addItem } = useCart()
  const [activeImage, setActiveImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [colors, setColors] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [variantSizes, setVariantSizes] = useState({})
  const [variantQuantities, setVariantQuantities] = useState({})
  const [measurements, setMeasurements] = useState('')
  const [note, setNote] = useState('')
  if (!product) return <div className="px-5 py-32 text-center"><h1 className="font-display text-4xl">Création introuvable</h1><Button to="/collections" className="mt-6">Retour à la collection</Button></div>
  const validate = () => {
    if (product.stockStatus === 'Indisponible') { toast.error('Cette création est actuellement indisponible.'); return false }
    if (product.colors.length && !colors.length) { toast.error('Veuillez choisir au moins une couleur.'); return false }
    if (product.sizes.length && colors.length && colors.some(color=>!variantSizes[color])) { toast.error('Veuillez choisir une taille pour chaque couleur.'); return false }
    if (product.sizes.length && !colors.length && !selectedSize) { toast.error('Veuillez choisir une taille.'); return false }
    return true
  }
  const toggleColor = value => {
    const removing=colors.includes(value)
    const nextColors = removing ? colors.filter(item=>item!==value) : [...colors,value]
    setColors(nextColors)
    setVariantQuantities(current=>{const next={...current};if(removing)delete next[value];else next[value]=1;return next})
    setVariantSizes(current=>{const next={...current};if(removing)delete next[value];return next})
  }
  const changeVariantQuantity=(color,difference)=>setVariantQuantities(current=>({...current,[color]:Math.max(1,(current[color]||1)+difference)}))
  const variants=colors.length
    ? colors.map(color=>({color,size:variantSizes[color]||'',quantity:variantQuantities[color]||1,measurements,note}))
    : [{color:'',size:selectedSize,quantity,measurements,note}]
  const totalQuantity=variants.reduce((total,variant)=>total+variant.quantity,0)
  const add = () => {
    if(!validate())return
    variants.forEach(options=>addItem(product,options))
  }
  const orderNow = () => {
    if (!validate()) return
    variants.forEach(options=>addItem(product,options))
    navigate('/commande')
  }
  const media=product.media?.length?product.media:product.images.map((url,index)=>({id:`image-${index}`,url,type:'image'}))
  const activeMedia=media[activeImage]||media[0]
  return <><SEO title={`${product.name} | TK SHOP`} /><div className="mx-auto max-w-7xl px-5 py-8 lg:px-8"><nav className="mb-8 text-xs text-black/50"><Link to="/">Accueil</Link> / <Link to="/collections">Collection</Link> / {product.name}</nav>
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-16"><div><div className="aspect-[4/5] overflow-hidden bg-mist">{activeMedia?.type==='video'?<video key={activeMedia.url} src={activeMedia.url} controls playsInline preload="metadata" className="h-full w-full bg-black object-contain">Votre navigateur ne prend pas en charge cette vidéo.</video>:<img src={activeMedia?.url} alt={product.name} className="h-full w-full object-cover" />}</div><div className="mt-3 flex gap-3 overflow-x-auto pb-2">{media.map((item,i)=><button key={item.id||item.url} onClick={()=>setActiveImage(i)} className={`relative h-24 w-20 shrink-0 overflow-hidden border-2 ${activeImage===i?'border-gold':'border-transparent'}`}>{item.type==='video'?<><video src={item.url} muted playsInline preload="metadata" className="h-full w-full bg-black object-cover"/><span className="absolute inset-0 grid place-items-center bg-black/25 text-xs font-bold text-white">VIDÉO</span></>:<img src={item.url} alt={`${product.name}, vue ${i+1}`} className="h-full w-full object-cover" />}</button>)}</div></div>
    <div className="lg:py-6"><p className="text-xs font-bold uppercase tracking-[.2em] text-gold">{product.category}</p><h1 className="mt-3 font-display text-4xl md:text-5xl">{product.name}</h1><div className="mt-4 flex flex-wrap items-center gap-3"><p className="text-xl font-semibold">{formatCurrency(product.price)}</p><span className="rounded-full bg-mist px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gold">{product.stockStatus === 'Disponible' ? 'Disponible immédiatement' : product.stockStatus}</span></div><p className="mt-6 leading-8 text-black/60">{product.description}</p>
      {product.colors.length>0&&<fieldset className="mt-8"><legend className="mb-3 text-sm font-bold">Couleurs <span className="font-normal text-black/45">— 1 couleur = 1 article</span></legend><div className="flex flex-wrap gap-2">{product.colors.map(c=><button type="button" aria-pressed={colors.includes(c)} key={c} onClick={()=>toggleColor(c)} className={`border px-4 py-2 text-sm ${colors.includes(c)?'border-ink bg-ink text-white':'border-black/20'}`}>{c}</button>)}</div>{colors.length>0&&<p className="mt-2 text-xs text-gold">{colors.length} article{colors.length>1?'s':''} : {colors.join(' · ')}</p>}</fieldset>}
      {product.sizes.length>0&&colors.length===0&&<fieldset className="mt-7"><legend className="mb-3 text-sm font-bold">Taille</legend><div className="flex flex-wrap gap-2">{product.sizes.map(size=><button type="button" aria-pressed={selectedSize===size} key={size} onClick={()=>setSelectedSize(size)} className={`grid h-11 min-w-11 place-items-center border px-3 text-sm ${selectedSize===size?'border-ink bg-ink text-white':'border-black/20'}`}>{size}</button>)}</div></fieldset>}
      {colors.length>0&&<fieldset className="mt-7"><legend className="mb-3 text-sm font-bold">Détails de chaque article</legend><div className="grid gap-3">{colors.map(color=><div key={color} className="grid items-center gap-3 rounded-2xl border border-gold/20 bg-mist p-3 sm:grid-cols-[1fr_160px_auto]"><b className="text-sm">{color}</b>{product.sizes.length>0?<select required aria-label={`Taille pour ${color}`} value={variantSizes[color]||''} onChange={event=>setVariantSizes(current=>({...current,[color]:event.target.value}))} className="w-full border border-black/15 bg-white px-3 py-2 text-sm"><option value="">Choisir la taille</option>{product.sizes.map(size=><option key={size} value={size}>{size}</option>)}</select>:<span className="text-xs text-black/45">Taille unique</span>}<div className="flex w-fit items-center rounded-full border border-gold/20 bg-white"><button type="button" onClick={()=>changeVariantQuantity(color,-1)} className="p-2" aria-label={`Diminuer ${color}`}><Minus className="h-3 w-3"/></button><span className="w-7 text-center text-xs">{variantQuantities[color]||1}</span><button type="button" onClick={()=>changeVariantQuantity(color,1)} className="p-2" aria-label={`Augmenter ${color}`}><Plus className="h-3 w-3"/></button></div></div>)}</div><p className="mt-3 text-xs font-semibold text-gold">Total : {totalQuantity} article{totalQuantity>1?'s':''}</p></fieldset>}
      {product.customizable&&<div className="mt-7 grid gap-4"><label className="text-sm font-bold">Mensurations <input value={measurements} onChange={e=>setMeasurements(e.target.value)} placeholder="Poitrine, taille, hanches, longueur…" className="mt-2 w-full border border-black/20 bg-white px-4 py-3 font-normal outline-none focus:border-gold" /></label><label className="text-sm font-bold">Note de personnalisation <textarea value={note} onChange={e=>setNote(e.target.value)} rows="3" placeholder="Décrivez votre souhait" className="mt-2 w-full resize-none border border-black/20 bg-white px-4 py-3 font-normal outline-none focus:border-gold" /></label></div>}
      <div className="mt-8 flex gap-3">{colors.length===0&&<div className="flex items-center border border-black/20"><button type="button" onClick={()=>setQuantity(Math.max(1,quantity-1))} className="p-3" aria-label="Diminuer"><Minus className="h-4 w-4" /></button><span className="w-8 text-center text-sm">{quantity}</span><button type="button" onClick={()=>setQuantity(quantity+1)} className="p-3" aria-label="Augmenter"><Plus className="h-4 w-4" /></button></div>}<Button className="flex-1" onClick={add}>Ajouter {totalQuantity>1?`${totalQuantity} articles`:'au panier'}</Button></div>
      <button type="button" onClick={orderNow} className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 border border-ink text-sm font-semibold transition hover:bg-ink hover:text-white"><MessageCircle className="h-4 w-4" /> Commander directement</button>
      <div className="mt-8 divide-y border-y text-sm"><div className="py-4"><b>Délai de confection :</b> {product.productionTime}</div><div className="py-4"><b>Matières :</b> {product.materials}</div><div className="py-4"><b>Entretien :</b> {product.careInstructions}</div></div>
    </div></div>
    <section className="py-24"><h2 className="mb-8 font-display text-3xl">Vous aimerez aussi</h2><div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-4">{products.filter(p=>p.categorySlug===product.categorySlug&&p.id!==product.id).slice(0,4).map(p=><ProductCard key={p.id} product={p}/>)}</div></section></div></>
}
