import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, X, MessageCircle, Mail, MapPin, CheckCircle2 } from 'lucide-react'
import { formatCurrency } from '../../utils/formatCurrency'
import toast from 'react-hot-toast'
import SEO from '../../components/common/SEO'
import Button from '../../components/common/Button'
import Accordion from '../../components/common/Accordion'
import { useCatalog } from '../../contexts/CatalogContext'
import { faq } from '../../data/faq'
import { siteConfig } from '../../config/siteConfig'
import PhoneInput from '../../components/common/PhoneInput'


export function GalleryPage(){const [active,setActive]=useState(null);const {gallery,content}=useCatalog();const copy=content.galleryPage||{};const current=active!==null?gallery[active]:null;return <><SEO title="Galerie | TK SHOP"/><div className="mx-auto max-w-7xl px-5 py-16"><div className="text-center"><p className="text-xs font-bold uppercase tracking-[.2em] text-gold">{copy.eyebrow||'Carnet d’atelier'}</p><h1 className="mt-4 font-display text-5xl">{copy.title||'Galerie de réalisations'}</h1></div><div className="mt-12 columns-2 gap-4 md:columns-3">{gallery.map((g,i)=><button key={g.id} onClick={()=>setActive(i)} className="group relative mb-4 block w-full overflow-hidden">{g.mediaType==='video'?<><video src={g.image} muted autoPlay loop playsInline preload="metadata" className={`w-full bg-black object-cover ${i%3===0?'aspect-[3/4]':'aspect-square'}`}/><span className="absolute inset-0 grid place-items-center bg-black/20 text-xs font-bold uppercase tracking-widest text-white">Lire la vidéo</span></>:<img src={g.image} alt={g.title} loading="lazy" className={`w-full object-cover ${i%3===0?'aspect-[3/4]':'aspect-square'}`}/>}<span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 p-4 pt-12 text-left text-sm text-white opacity-0 transition group-hover:opacity-100">{g.title}</span></button>)}</div></div>{current&&<div className="fixed inset-0 z-50 grid place-items-center bg-black/95 p-5" role="dialog" aria-label={current.title}><button className="absolute right-5 top-5 z-10 text-white" onClick={()=>setActive(null)}><X/></button><button className="absolute left-4 z-10 text-white" onClick={()=>setActive((active-1+gallery.length)%gallery.length)}><ChevronLeft/></button>{current.mediaType==='video'?<video key={current.image} src={current.image} controls autoPlay playsInline className="max-h-[85vh] max-w-[85vw] bg-black"/>:<img src={current.image} alt={current.title} className="max-h-[85vh] max-w-[85vw]"/>}<button className="absolute right-4 z-10 text-white" onClick={()=>setActive((active+1)%gallery.length)}><ChevronRight/></button></div>}</>}

export function FaqPage(){const {content}=useCatalog();return <><SEO title="Questions fréquentes | TK SHOP"/><div className="mx-auto max-w-3xl px-5 py-20"><h1 className="mb-10 text-center font-display text-5xl">{content.faqPage?.title||'Questions fréquentes'}</h1><Accordion items={faq}/></div></>}

export function ConfirmationPage() {
  const [lastOrder] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('tk-shop-last-order')) || null
    } catch {
      return null
    }
  })

  const isFedaPay = lastOrder?.paymentMethod === 'fedapay'
  const orderNumber = lastOrder?.order?.order_number || ''
  const deposit = lastOrder?.depositAmount || (lastOrder?.total ? Math.ceil(lastOrder.total / 2) : 0)
  const remaining = lastOrder?.remainingAmount || (lastOrder?.total ? lastOrder.total - deposit : 0)

  return (
    <>
      <SEO title="Confirmation de commande | TK SHOP" />
      <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-goldSoft/15 bg-ivory/95 px-4 backdrop-blur-xl md:hidden">
        <Link to="/" className="grid h-10 w-10 place-items-center rounded-full bg-mist" aria-label="Retour à l’accueil">
          <ChevronLeft className="h-5 w-5"/>
        </Link>
        <h1 className="font-display text-xl">Commande</h1>
        <div className="h-10 w-10"/>
      </div>
      <div className="grid min-h-[calc(100vh-4rem)] place-items-center px-5 py-12 text-center md:min-h-[65vh]">
        <div className="max-w-xl">
          <div className={`mx-auto grid h-20 w-20 place-items-center rounded-full ${isFedaPay ? 'bg-emerald-50 text-emerald-600' : 'bg-linen text-gold'}`}>
            {isFedaPay ? <CheckCircle2 className="h-10 w-10"/> : <MessageCircle className="h-10 w-10"/>}
          </div>
          <h2 className="mt-6 font-display text-4xl">
            {isFedaPay ? 'Acompte validé avec succès !' : 'Votre demande est prête'}
          </h2>
          <p className="mx-auto mt-4 max-w-lg leading-7 text-black/65">
            {isFedaPay ? (
              <>
                Merci {lastOrder?.form?.name ? <span className="font-semibold">{lastOrder.form.name}</span> : ''} ! Votre acompte de <b>{formatCurrency(deposit)}</b> a bien été enregistré en ligne via FedaPay. L’atelier prépare votre commande{orderNumber ? ` n° ${orderNumber}` : ''}.
              </>
            ) : (
              'Votre commande a été ouverte dans WhatsApp. Envoyez le message pour que l’atelier puisse la confirmer avec vous.'
            )}
          </p>

          {isFedaPay && (
            <div className="mt-6 rounded-2xl bg-mist p-5 text-left text-sm">
              <div className="flex justify-between border-b border-goldSoft/20 pb-2 font-medium">
                <span>Total de la commande</span>
                <span>{formatCurrency(lastOrder?.total || 0)}</span>
              </div>
              <div className="flex justify-between pt-2 text-emerald-700 font-semibold">
                <span>Acompte réglé (50 %)</span>
                <span>{formatCurrency(deposit)}</span>
              </div>
              <div className="flex justify-between pt-1 text-black/60">
                <span>Solde à régler à la livraison</span>
                <span>{formatCurrency(remaining)}</span>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button to="/">Retour à l’accueil</Button>
            <Button to="/collections" variant="outline">Découvrir d'autres créations</Button>
          </div>
        </div>
      </div>
    </>
  )
}
function LegacyLegalPage({title}){return <><SEO title={`${title} | TK SHOP`}/><article className="mx-auto max-w-3xl px-5 py-20"><h1 className="font-display text-5xl">{title}</h1><p className="mt-8 leading-8 text-black/60">Cette page présente les informations de référence de TK SHOP. Les modalités définitives seront mises à jour avant l’ouverture commerciale du service.</p><h2 className="mt-10 font-display text-2xl">Principes généraux</h2><p className="mt-4 leading-8 text-black/60">Les commandes sont confirmées après échange avec l’atelier. Les délais dépendent du modèle, des options de personnalisation et de la destination de livraison.</p></article></>}

export function AboutPage(){
  const {content}=useCatalog()
  const about=content.about||{}
  return <><SEO title="Notre histoire | TK SHOP"/><section className="grid md:grid-cols-2"><div className="flex items-center bg-gradient-to-br from-mist to-linen p-10 dark:from-[#342a18] dark:to-[#211b10] md:p-20"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-gold">{about.eyebrow||'Notre histoire'}</p><h1 className="mt-5 font-display text-5xl">{about.title||'Le crochet entre les mains, l’élégance en héritage.'}</h1><p className="mt-7 leading-8 text-black/60">{about.description||'TK SHOP est née d’une passion profonde pour le crochet. La créatrice transforme le fil, point après point, en pièces contemporaines.'}</p></div></div><div className="relative min-h-[560px]"><img src={about.image||"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=85"} alt="Créatrice dans son atelier de crochet" className="absolute inset-0 h-full w-full object-cover"/><div className="absolute inset-0 bg-goldSoft/30 mix-blend-color"/></div></section><section className="mx-auto max-w-5xl px-5 py-24"><h2 className="font-display text-4xl">{about.sectionTitle||'Le crochet comme signature'}</h2><p className="mt-8 max-w-3xl leading-8 text-black/60">{about.sectionText||'Chaque création commence par une conversation, le choix du fil et un motif. La pièce grandit ensuite boucle après boucle sous le crochet, jusqu’à épouser parfaitement la silhouette.'}</p></section></>
}

export function ContactPage(){
  const {settings,content}=useCatalog()
  const contact=content.contact||{}
  const [phone,setPhone]=useState('')
  const submit=event=>{
    event.preventDefault()
    const data=new FormData(event.currentTarget)
    const body=`Bonjour ${settings.shop_name},\n\n${data.get('message')}\n\nNom : ${data.get('name')}\nTéléphone : ${data.get('phone')}\nE-mail : ${data.get('email')}\nSujet : ${data.get('subject')}`
    const number=String(settings.whatsapp||'').replace(/\D/g,'')
    if(/^\d{8,15}$/.test(number)){
      const whatsappUrl=new URL(`https://wa.me/${number}`)
      whatsappUrl.searchParams.set('text',body)
      window.open(whatsappUrl.toString(),'_blank','noopener,noreferrer')
      return
    }
    const email=String(settings.email||'').trim()
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
      toast.error('Aucun moyen de contact valide n’est configuré.')
      return
    }
    const emailLink=document.createElement('a')
    emailLink.href=`mailto:${email}?subject=${encodeURIComponent(String(data.get('subject')||''))}&body=${encodeURIComponent(body)}`
    emailLink.rel='noopener noreferrer'
    emailLink.click()
  }
  return <><SEO title="Contact | TK SHOP"/><div className="mx-auto grid max-w-6xl gap-14 px-5 py-20 md:grid-cols-2"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-gold">{contact.eyebrow||'Parlons de votre projet'}</p><h1 className="mt-4 font-display text-5xl">{contact.title||'Une question, une envie ?'}</h1><p className="mt-6 leading-8 text-black/60">{contact.description||'Écrivez-nous. Nous vous répondrons avec plaisir pour imaginer ensemble votre prochaine création.'}</p><div className="mt-10 grid gap-5 text-sm"><p className="flex gap-3"><MessageCircle className="text-gold"/>{settings.phone}</p><p className="flex gap-3"><Mail className="text-gold"/>{settings.email}</p><p className="flex gap-3"><MapPin className="text-gold"/>{settings.address}</p></div></div><form onSubmit={submit} className="grid gap-4"><label className="text-sm font-semibold">Nom<input required name="name" className="mt-2 w-full border border-black/20 px-4 py-3"/></label><label className="text-sm font-semibold">E-mail<input required type="email" name="email" className="mt-2 w-full border border-black/20 px-4 py-3"/></label><label className="text-sm font-semibold">Téléphone<PhoneInput required value={phone} onChange={setPhone}/></label><label className="text-sm font-semibold">Sujet<input required name="subject" className="mt-2 w-full border border-black/20 px-4 py-3"/></label><label className="text-sm font-semibold">Message<textarea required name="message" rows="5" className="mt-2 w-full resize-none border border-black/20 px-4 py-3"/></label><Button type="submit">{contact.button||'Envoyer sur WhatsApp'}</Button></form></div></>
}

export function LegalPage({title}){
  const {content}=useCatalog()
  const key=title==='Politique de confidentialité'?'privacy':title==='Conditions générales'?'terms':title==='Mentions légales'?'legal':'delivery'
  const defaults={
    privacy:'TK SHOP collecte uniquement les informations nécessaires au traitement des commandes et des demandes : nom, coordonnées, adresse de livraison et détails de la commande.\n\nCes données servent à préparer la commande, contacter la cliente et organiser la livraison. Elles ne sont pas vendues. Vous pouvez demander leur accès, leur correction ou leur suppression en contactant TK SHOP.',
    terms:'Toute commande est confirmée après validation du modèle, des options, du prix et du délai avec TK SHOP. Les prix sont affichés en FCFA et les modalités de paiement sont communiquées lors de la confirmation.\n\nLes couleurs, tailles et mensurations fournies doivent être exactes. Les créations déjà commencées ou personnalisées peuvent ne pas être remboursables. Une solution amiable sera recherchée en priorité en cas de difficulté.',
    delivery:'Les délais et frais de livraison dépendent de la destination et sont confirmés avant l’expédition. Tout problème doit être signalé dès la réception avec des photos.\n\nUne création personnalisée ou réalisée selon des mensurations spécifiques ne peut être retournée pour simple changement d’avis. En cas d’article endommagé ou non conforme, TK SHOP étudiera une réparation, un échange ou une solution adaptée.',
    legal:'Le présent site est édité par TK SHOP — Taye & Kinde Shop, boutique de créations artisanales au crochet. Les coordonnées professionnelles sont celles affichées sur le site.\n\nLe site est hébergé par Vercel Inc. et les données applicatives par Supabase. Les textes, photographies, créations, éléments graphiques et logos sont protégés. Toute reproduction sans autorisation préalable est interdite.',
  }
  const fallback=defaults[key]
  const paragraphs=(content[key]?.body||fallback).split(/\n+/).filter(Boolean)
  return <><SEO title={`${title} | TK SHOP`}/><article className="mx-auto max-w-3xl px-5 py-20"><p className="text-xs font-bold uppercase tracking-[.2em] text-gold">Informations TK SHOP</p><h1 className="mt-4 font-display text-5xl">{title}</h1><div className="mt-10 grid gap-6">{paragraphs.map((paragraph,index)=><p key={index} className="whitespace-pre-wrap leading-8 text-black/60">{paragraph}</p>)}</div></article></>
}
