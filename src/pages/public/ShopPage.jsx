import { useEffect, useMemo, useState } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import SEO from '../../components/common/SEO'
import ProductCard from '../../components/products/ProductCard'
import { useCatalog } from '../../contexts/CatalogContext'

export default function ShopPage({ categorySlug }) {
  const { products, categories } = useCatalog()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState(categorySlug || 'tous')
  const [sort, setSort] = useState('nouveautes')
  useEffect(() => {
    setCategory(categorySlug || 'tous')
  }, [categorySlug])
  const filtered = useMemo(() => {
    let result = products.filter(p => (category === 'tous' || p.categorySlug === category) && p.name.toLowerCase().includes(query.toLowerCase()))
    if (sort === 'prix-asc') result.sort((a,b) => a.price-b.price)
    if (sort === 'prix-desc') result.sort((a,b) => b.price-a.price)
    if (sort === 'alpha') result.sort((a,b) => a.name.localeCompare(b.name))
    return result
  }, [products, query, category, sort])
  return <><SEO title="Collection crochet | TK SHOP" /><div className="bg-gradient-to-br from-mist via-linen to-champagne px-5 py-20 text-center dark:from-plum dark:via-[#3b2e14] dark:to-[#20190d]"><p className="text-xs font-bold uppercase tracking-[.2em] text-gold">Notre crochet</p><h1 className="mt-4 font-display text-5xl">La collection</h1><p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-black/60">Découvrez des créations crochetées lentement à la main, pensées pour être portées longtemps.</p></div>
    <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8"><div className="flex flex-col gap-4 border-b border-linen pb-6 md:flex-row md:items-center md:justify-between"><label className="flex min-w-72 items-center gap-3 border border-black/15 bg-white px-4 py-3"><Search className="h-4 w-4" /><input className="w-full bg-transparent text-sm outline-none" placeholder="Rechercher une création" value={query} onChange={e=>setQuery(e.target.value)} /></label><div className="flex gap-3"><select className="border border-black/15 bg-white px-4 py-3 text-sm" value={category} onChange={e=>setCategory(e.target.value)}><option value="tous">Toutes les catégories</option>{categories.map(c=><option key={c.slug} value={c.slug}>{c.name}</option>)}</select><select className="border border-black/15 bg-white px-4 py-3 text-sm" value={sort} onChange={e=>setSort(e.target.value)}><option value="nouveautes">Nouveautés</option><option value="prix-asc">Prix croissant</option><option value="prix-desc">Prix décroissant</option><option value="alpha">Ordre alphabétique</option></select></div></div>
    <div className="my-7 flex items-center justify-between"><div><p className="text-sm text-black/55">{filtered.length} création{filtered.length>1?'s':''}</p>{category!=='tous'&&<p className="mt-1 text-xs font-semibold text-gold">{categories.find(c=>c.slug===category)?.name}</p>}</div><button className="flex items-center gap-2 text-sm font-semibold"><SlidersHorizontal className="h-4 w-4" /> Filtres</button></div>{filtered.length?<div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 md:gap-x-7">{filtered.map(p=><ProductCard key={p.id} product={p} />)}</div>:<div className="rounded-[2rem] bg-mist px-6 py-20 text-center"><h2 className="font-display text-3xl">Cette catégorie attend sa première création</h2><p className="mt-3 text-sm text-black/50">Les nouveaux produits publiés ici apparaîtront automatiquement.</p></div>}</div></>
}
