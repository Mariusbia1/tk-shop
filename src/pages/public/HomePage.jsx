import { motion } from 'framer-motion'
import { ArrowRight, Gem, Hand, HeartHandshake, PackageCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import SEO from '../../components/common/SEO'
import Button from '../../components/common/Button'
import ProductCard from '../../components/products/ProductCard'
import Accordion from '../../components/common/Accordion'
import { useCatalog } from '../../contexts/CatalogContext'
import { faq } from '../../data/faq'
import heroCrochet from '../../assets/hero-crochet-gold.jpg'

const SectionTitle = ({ eyebrow, children }) => <div className="mb-10 text-center"><p className="mb-3 text-[11px] font-bold uppercase tracking-[.22em] text-gold">{eyebrow}</p><h2 className="font-display text-4xl md:text-5xl">{children}</h2></div>

export default function HomePage() {
  const { products, categories, testimonials, content } = useCatalog()
  const hero = content.hero || {}
  return <><SEO title="TK SHOP | Créations crochetées à la main" />
    <section className="relative min-h-[82vh] overflow-hidden bg-gradient-to-br from-[#fffcf5] via-linen to-[#ebdbb4] dark:from-plum dark:via-[#3b2e14] dark:to-[#20190d]">
      <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-[#cfa746]/35 blur-3xl" />
      <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-[#dfc57f]/55 blur-3xl" />
      <div className="relative mx-auto grid min-h-[82vh] max-w-7xl items-center gap-10 px-5 py-12 lg:grid-cols-[.9fr_1.1fr] lg:px-8">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
          <span className="inline-flex rounded-full border border-gold/30 bg-white/75 px-4 py-2 text-[10px] font-bold uppercase tracking-[.24em] text-gold shadow-sm backdrop-blur dark:bg-white/10">{hero.eyebrow||'Crochet d’exception · Fait main'}</span>
          <h1 className="mt-7 font-display text-5xl leading-[1.02] sm:text-7xl">{hero.title||'La douceur prend forme.'}</h1>
          <p className="mt-6 max-w-lg text-base leading-8 text-black/60">{hero.description||'Des pièces en crochet singulières, façonnées point après point à la main pour envelopper chaque femme d’élégance et de douceur.'}</p>
          <div className="mt-8 flex flex-wrap gap-3"><Button to="/collections">Découvrir le crochet</Button><Button to="/contact" variant="outline">Imaginer ma pièce</Button></div>
          <div className="mt-10 flex gap-8 text-xs text-black/50"><span><b className="block font-display text-2xl text-gold">100%</b>fait main</span><span><b className="block font-display text-2xl text-gold">12</b>pièces signatures</span><span><b className="block font-display text-2xl text-gold">1</b>pièce unique</span></div>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .7 }} className="relative mx-auto w-full max-w-xl">
          <div className="absolute -left-5 -top-5 h-full w-full rounded-[3rem] border border-gold/30" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-[3rem_3rem_8rem_3rem] shadow-gold">
            <img src={heroCrochet} alt="Robe en crochet or et champagne TK SHOP" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-plum/45 via-transparent to-goldSoft/10" />
            <div className="absolute bottom-6 left-6 rounded-2xl bg-white/85 p-4 backdrop-blur dark:bg-plum/80"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-gold">Nouveau crochet</p><p className="mt-1 font-display text-xl">Collection Douceur</p></div>
          </div>
        </motion.div>
      </div>
    </section>
    <section className="knit-texture mx-auto max-w-4xl px-5 py-24 text-center"><p className="text-xs font-bold uppercase tracking-[.2em] text-gold">L’art du crochet</p><h2 className="mt-5 font-display text-4xl leading-tight md:text-5xl">Un point après l’autre.<br /><span className="italic text-gold">Une émotion à porter.</span></h2><p className="mx-auto mt-6 max-w-2xl leading-8 text-black/60">Chez TK SHOP, le fil de coton devient une silhouette moderne entre les mains de la créatrice. Chaque boucle est crochetée avec patience pour créer une pièce douce, durable et vraiment personnelle.</p></section>
    <section className="rounded-[3rem] bg-mist py-20 md:mx-5"><div className="mx-auto max-w-7xl px-5 lg:px-8"><SectionTitle eyebrow="Crochets coup de cœur">Nos créations signatures</SectionTitle><div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-7">{products.filter(p => p.featured).map(p => <ProductCard key={p.id} product={p} />)}</div><div className="mt-12 text-center"><Button to="/collections" variant="outline">Voir toute la collection <ArrowRight className="h-4 w-4" /></Button></div></div></section>
    <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8"><SectionTitle eyebrow="Explorer">À chacune son allure</SectionTitle><div className="grid grid-cols-2 gap-3 md:grid-cols-3">{categories.map((c, i) => <Link key={c.slug} to={`/categories/${c.slug}`} className={`${i === 0 || i === 5 ? 'md:col-span-2' : ''} group relative h-64 overflow-hidden rounded-[2rem] md:h-80`}><img src={c.image} alt={c.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-plum/75 via-goldSoft/20 to-goldSoft/10" /><span className="absolute bottom-5 left-5 font-display text-2xl text-white drop-shadow">{c.name}</span></Link>)}</div></section>
    <section className="grid overflow-hidden bg-linen md:mx-5 md:rounded-[3rem] md:grid-cols-2"><div className="relative min-h-[500px]"><img src={heroCrochet} alt="Création au crochet dans l’atelier" className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-goldSoft/20 mix-blend-color" /><div className="absolute inset-0 bg-gradient-to-t from-plum/25 to-transparent" /></div><div className="knit-texture flex items-center p-10 md:p-20"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-gold">La main derrière le crochet</p><h2 className="mt-5 font-display text-4xl md:text-5xl">Le crochet comme langage</h2><p className="mt-6 max-w-lg leading-8 text-black/65">TK imagine des silhouettes féminines à partir de fils doux, de boucles et de motifs ajourés. Chaque pièce porte la trace du geste, le temps de la création et une attention rien que pour vous.</p><Button to="/a-propos" variant="outline" className="mt-8">Entrer dans l’atelier</Button></div></div></section>
    <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8"><div className="grid gap-8 md:grid-cols-4">{[[Hand,'Fait à la main'],[Gem,'Matières choisies'],[HeartHandshake,'Sur mesure'],[PackageCheck,'Livraison soignée']].map(([Icon,t]) => <div key={t} className="border-t border-gold pt-6"><Icon className="h-6 w-6 text-gold" /><h3 className="mt-4 font-display text-xl">{t}</h3><p className="mt-2 text-sm leading-6 text-black/55">Une attention sincère portée à chaque étape de votre création.</p></div>)}</div></section>
    <section className="bg-gradient-to-br from-plum via-brown to-gold py-24 text-white"><div className="mx-auto max-w-7xl px-5 lg:px-8"><SectionTitle eyebrow="Elles racontent">Portées avec émotion</SectionTitle><div className="grid gap-5 md:grid-cols-4">{testimonials.map(t => <blockquote key={t.name} className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur"><p className="font-display text-xl leading-8">« {t.text} »</p><footer className="mt-6 text-xs uppercase tracking-wider text-sand">{t.name} — {t.city}</footer></blockquote>)}</div></div></section>
    <section className="mx-auto grid max-w-6xl gap-12 px-5 py-24 md:grid-cols-2"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-gold">Questions fréquentes</p><h2 className="mt-4 font-display text-4xl">Avant de commencer votre création</h2></div><Accordion items={faq} /></section>
    <section className="bg-sand px-5 py-20 text-center"><h2 className="font-display text-4xl">Une création pensée spécialement pour vous.</h2><Button to="/collections" className="mt-7">Découvrir la collection</Button></section>
  </>
}
