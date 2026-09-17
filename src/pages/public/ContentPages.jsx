import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, X, MessageCircle, Mail, MapPin, CheckCircle2, Package, Calendar, Phone, Truck, Printer, ArrowRight, ShieldCheck, Sparkles, Receipt, Check, Eye, ShoppingBag } from 'lucide-react'
import { formatCurrency } from '../../utils/formatCurrency'
import toast from 'react-hot-toast'
import SEO from '../../components/common/SEO'
import Button from '../../components/common/Button'
import Accordion from '../../components/common/Accordion'
import { useCatalog } from '../../contexts/CatalogContext'
import { faq } from '../../data/faq'
import { siteConfig } from '../../config/siteConfig'
import PhoneInput from '../../components/common/PhoneInput'
import ProductMediaThumb from '../../components/products/ProductMediaThumb'
import OrderRecapModal from '../../components/cart/OrderRecapModal'


export function GalleryPage() {
  const [active, setActive] = useState(null)
  const { gallery, content } = useCatalog()
  const copy = content.galleryPage || {}
  const current = active !== null ? gallery[active] : null

  return (
    <>
      <SEO
        title="Galerie & Lookbook Crochet | TK SHOP"
        description={copy.description || "Découvrez le carnet d'atelier de TK SHOP : réalisations au crochet, tenues portées, photos et vidéos de nos créations artisanales faites à la main."}
        keywords={['galerie crochet', 'lookbook crochet', 'photos créations crochet', 'vidéos créations crochet', 'atelier TK SHOP']}
        path="/galerie"
        breadcrumbs={[
          { name: 'Accueil', url: '/' },
          { name: 'Galerie', url: '/galerie' },
        ]}
      />
      <div className="mx-auto max-w-7xl px-5 py-16">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-gold">{copy.eyebrow || 'Carnet d’atelier'}</p>
          <h1 className="mt-4 font-display text-5xl">{copy.title || 'Galerie de réalisations'}</h1>
        </div>
        <div className="mt-12 columns-2 gap-4 md:columns-3">
          {gallery.map((g, i) => (
            <button key={g.id} onClick={() => setActive(i)} className="group relative mb-4 block w-full overflow-hidden">
              {g.mediaType === 'video' ? (
                <>
                  <video src={g.image} muted autoPlay loop playsInline preload="metadata" className={`w-full bg-black object-cover ${i % 3 === 0 ? 'aspect-[3/4]' : 'aspect-square'}`} />
                  <span className="absolute inset-0 grid place-items-center bg-black/20 text-xs font-bold uppercase tracking-widest text-white">Lire la vidéo</span>
                </>
              ) : (
                <img src={g.image} alt={g.title} loading="lazy" className={`w-full object-cover ${i % 3 === 0 ? 'aspect-[3/4]' : 'aspect-square'}`} />
              )}
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 p-4 pt-12 text-left text-sm text-white opacity-0 transition group-hover:opacity-100">{g.title}</span>
            </button>
          ))}
        </div>
      </div>
      {current && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/95 p-5" role="dialog" aria-label={current.title}>
          <button className="absolute right-5 top-5 z-10 text-white" onClick={() => setActive(null)}><X /></button>
          <button className="absolute left-4 z-10 text-white" onClick={() => setActive((active - 1 + gallery.length) % gallery.length)}><ChevronLeft /></button>
          {current.mediaType === 'video' ? (
            <video key={current.image} src={current.image} controls autoPlay playsInline className="max-h-[85vh] max-w-[85vw] bg-black" />
          ) : (
            <img src={current.image} alt={current.title} className="max-h-[85vh] max-w-[85vw]" />
          )}
          <button className="absolute right-4 z-10 text-white" onClick={() => setActive((active + 1) % gallery.length)}><ChevronRight /></button>
        </div>
      )}
    </>
  )
}

export function FaqPage() {
  const { content } = useCatalog()
  return (
    <>
      <SEO
        title="Questions Fréquentes sur nos créations au crochet | TK SHOP"
        description="Trouvez les réponses à toutes vos questions sur les commandes, les tailles, les délais de confection artisanale et l'entretien de vos pièces en crochet."
        path="/faq"
        faq={faq}
        breadcrumbs={[
          { name: 'Accueil', url: '/' },
          { name: 'FAQ', url: '/faq' },
        ]}
      />
      <div className="mx-auto max-w-3xl px-5 py-20">
        <h1 className="mb-10 text-center font-display text-5xl">{content.faqPage?.title || 'Questions fréquentes'}</h1>
        <Accordion items={faq} />
      </div>
    </>
  )
}

export function ConfirmationPage() {
  const { settings } = useCatalog()
  const [showModal, setShowModal] = useState(true)
  const [lastOrder] = useState(() => {
    try {
      const session = sessionStorage.getItem('tk-shop-last-order')
      if (session) return JSON.parse(session)
      const local = localStorage.getItem('tk-shop-last-order')
      if (local) return JSON.parse(local)
      return null
    } catch {
      return null
    }
  })

  const isOnlinePayment = lastOrder?.paymentMethod === 'fedapay'
  const isFullPayment = lastOrder?.paymentType === 'full' || (isOnlinePayment && lastOrder?.remainingAmount === 0)
  const orderNumber = lastOrder?.order?.order_number || lastOrder?.order?.id || ''
  const orderTotal = Number(lastOrder?.total || 0)
  const deposit = isOnlinePayment 
    ? (lastOrder?.depositAmount || (isFullPayment ? orderTotal : Math.ceil(orderTotal / 2)))
    : 0
  const remaining = isOnlinePayment
    ? (isFullPayment ? 0 : (lastOrder?.remainingAmount ?? Math.max(0, orderTotal - deposit)))
    : orderTotal
  const form = lastOrder?.form || {}
  const items = lastOrder?.items || []

  const orderDate = lastOrder?.order?.created_at
    ? new Date(lastOrder.order.created_at).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })

  const whatsappShopNumber = String(settings?.whatsapp || siteConfig?.whatsapp || '2290100000000').replace(/\D/g, '')
  const whatsappHelpUrl = `https://wa.me/${whatsappShopNumber}?text=${encodeURIComponent(
    `Bonjour ${settings?.shop_name || 'TK SHOP'},\n\nJe vous contacte au sujet de ma commande${orderNumber ? ` n° ${orderNumber}` : ''} passée sur votre boutique en ligne.\nNom : ${form.name || ''}`
  )}`

  const handlePrint = () => {
    window.print()
  }

  if (!lastOrder) {
    const demoOrder = {
      order: { order_number: 'TK-DEMO', created_at: new Date().toISOString() },
      form: { name: 'Cliente Exemple', phone: '+229 01 00 00 00', city: 'Cotonou', address: 'Haie Vive', delivery: 'Livraison à domicile' },
      items: [
        { name: 'Création Crochet Signature', price: 45000, quantity: 1, size: 'M', color: 'Or / Champagne' }
      ],
      total: 45000,
      depositAmount: 22500,
      remainingAmount: 22500,
      paymentType: 'deposit',
      paymentMethod: 'fedapay'
    }

    return (
      <>
        <SEO
          title="Confirmation de commande | TK SHOP"
          description="Votre récapitulatif de commande TK SHOP."
          noindex={true}
        />
        <OrderRecapModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          orderData={demoOrder}
          settings={settings}
        />
        <div className="grid min-h-[60vh] place-items-center px-5 py-20 text-center">
          <div className="max-w-md">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-mist text-gold">
              <Package className="h-10 w-10" />
            </div>
            <h1 className="mt-6 font-display text-3xl">Aucune commande récente</h1>
            <p className="mt-3 text-sm leading-6 text-black/55 dark:text-white/60">
              Votre session a expiré ou aucune commande n’a été enregistrée récemment sur cet appareil.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gold bg-gold/15 px-5 py-3 text-xs font-bold text-gold transition hover:bg-gold hover:text-white shadow-sm dark:bg-gold/20"
              >
                <Receipt className="h-4 w-4" />
                Tester l’aperçu du reçu / popup
              </button>
              <Button to="/collections">
                Découvrir la collection
              </Button>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <SEO
        title={`Confirmation de commande ${orderNumber ? `n° ${orderNumber}` : ''} | TK SHOP`}
        description="Votre récapitulatif complet de commande TK SHOP."
        noindex={true}
      />

      {/* POPUP MODAL RECAPITULATIF */}
      <OrderRecapModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        orderData={lastOrder}
        settings={settings}
      />

      {/* Top bar mobile */}
      <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-goldSoft/15 bg-ivory/95 px-4 backdrop-blur-xl md:hidden">
        <Link to="/" className="grid h-10 w-10 place-items-center rounded-full bg-mist" aria-label="Retour à l’accueil">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-xl">Récapitulatif</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowModal(true)} className="grid h-10 w-10 place-items-center rounded-full bg-mist text-gold" aria-label="Afficher le reçu">
            <Receipt className="h-4 w-4" />
          </button>
          <button onClick={handlePrint} className="grid h-10 w-10 place-items-center rounded-full bg-mist text-gold" aria-label="Imprimer">
            <Printer className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 md:py-16 lg:px-8">
        {/* Header banner */}
        <div className="rounded-[2.5rem] bg-gradient-to-br from-mist via-linen to-champagne p-6 text-center sm:p-10 dark:from-[#2e2413] dark:via-[#211a0e] dark:to-[#17120a]">
          <div className={`mx-auto grid h-20 w-20 place-items-center rounded-3xl shadow-soft ${isOnlinePayment ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400' : 'bg-white text-gold dark:bg-white/10'}`}>
            {isOnlinePayment ? <CheckCircle2 className="h-10 w-10" /> : <Sparkles className="h-10 w-10" />}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="rounded-full border border-gold/30 bg-white/80 px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest text-gold dark:bg-white/10">
              {isOnlinePayment 
                ? (isFullPayment ? 'Paiement intégral réglé en ligne' : 'Acompte 50 % réglé en ligne') 
                : 'Commande enregistrée'}
            </span>
            {orderNumber && (
              <span className="rounded-full bg-black/5 px-3 py-1 font-mono text-xs font-semibold dark:bg-white/10">
                Réf : {orderNumber}
              </span>
            )}
          </div>

          <h1 className="mt-4 font-display text-3xl sm:text-5xl">
            {isOnlinePayment ? 'Merci pour votre commande !' : 'Votre demande a bien été transmise !'}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-black/65 dark:text-white/70">
            {isOnlinePayment ? (
              isFullPayment ? (
                <>
                  Bonjour {form.name ? <b className="text-ink dark:text-white">{form.name}</b> : ''}, votre paiement intégral de <b>{formatCurrency(orderTotal)}</b> a bien été validé en ligne. L’atelier lance immédiatement la confection de votre pièce sur-mesure.
                </>
              ) : (
                <>
                  Bonjour {form.name ? <b className="text-ink dark:text-white">{form.name}</b> : ''}, votre acompte de <b>{formatCurrency(deposit)}</b> a bien été validé en ligne. L’atelier lance la confection. Le solde restant (<b>{formatCurrency(remaining)}</b>) sera réglé à la livraison.
                </>
              )
            ) : (
              <>
                Bonjour {form.name ? <b className="text-ink dark:text-white">{form.name}</b> : ''}, votre commande a bien été préparée pour l’atelier. Nous prenons contact avec vous pour finaliser les détails et la confection.
              </>
            )}
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 rounded-2xl border border-gold/40 bg-gold/15 px-4 py-2.5 text-xs font-bold text-gold transition hover:bg-gold hover:text-white shadow-sm dark:bg-gold/20"
            >
              <Receipt className="h-4 w-4" />
              Afficher le récapitulatif / reçu
            </button>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-black/45 dark:text-white/45">
              <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-gold" /> {orderDate}</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-gold" /> Confection artisanale certifiée</span>
            </div>
          </div>
        </div>

        {/* Recap Grid */}
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          {/* Left Column: Items purchased */}
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-goldSoft/20 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1f190e]">
              <div className="flex items-center justify-between border-b border-goldSoft/15 pb-4">
                <h2 className="font-display text-xl sm:text-2xl">Articles commandés</h2>
                <span className="rounded-full bg-mist px-3 py-1 text-xs font-semibold text-gold dark:bg-white/10">
                  {items.reduce((acc, it) => acc + (it.quantity || 1), 0)} pièce(s)
                </span>
              </div>

              <div className="divide-y divide-goldSoft/15">
                {items.map((item, index) => {
                  const lineTotal = item.price * (item.quantity || 1)
                  return (
                    <div key={item.lineKey || index} className="grid grid-cols-[80px_1fr] gap-4 py-5 sm:grid-cols-[96px_1fr_auto]">
                      <ProductMediaThumb product={item} alt={item.name} className="h-24 w-full rounded-2xl sm:h-28" />
                      <div className="min-w-0">
                        <Link to={item.slug ? `/collections/${item.slug}` : '/collections'} className="font-display text-base font-medium hover:text-gold sm:text-lg">
                          {item.name}
                        </Link>
                        
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {item.color && (
                            <span className="inline-flex rounded-lg border border-black/10 bg-mist px-2.5 py-0.5 text-[11px] font-medium dark:border-white/10 dark:bg-white/5">
                              Couleur : <b>{item.color}</b>
                            </span>
                          )}
                          {item.size && (
                            <span className="inline-flex rounded-lg border border-black/10 bg-mist px-2.5 py-0.5 text-[11px] font-medium dark:border-white/10 dark:bg-white/5">
                              Taille : <b>{item.size}</b>
                            </span>
                          )}
                        </div>

                        {item.measurements && (
                          <p className="mt-2 text-xs text-black/60 dark:text-white/60">
                            <span className="font-semibold text-gold">Mensurations :</span> {item.measurements}
                          </p>
                        )}
                        {item.note && (
                          <p className="mt-1 text-xs italic text-black/55 dark:text-white/50">
                            « {item.note} »
                          </p>
                        )}

                        <p className="mt-2 text-xs text-black/45">
                          Quantité : <b className="text-ink dark:text-white">{item.quantity || 1}</b> × {formatCurrency(item.price)}
                        </p>
                      </div>

                      <div className="col-start-2 flex items-baseline justify-end sm:col-start-auto">
                        <b className="text-base font-semibold text-gold sm:text-lg">{formatCurrency(lineTotal)}</b>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Next steps notice */}
            <div className="rounded-[2rem] border border-gold/20 bg-mist/50 p-6 dark:bg-white/5">
              <h3 className="font-display text-lg text-gold">Que se passe-t-il ensuite ?</h3>
              <ul className="mt-3 space-y-2 text-xs leading-6 text-black/65 dark:text-white/70">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gold shrink-0" />
                  <span><b>Confection artisanale :</b> Chaque pièce est confectionnée à la main dans l’atelier selon vos mensurations et vos options de couleur.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gold shrink-0" />
                  <span><b>Suivi personnalisé :</b> Vous recevrez un message lors de l’avancement de votre création et avant l’expédition.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gold shrink-0" />
                  <span><b>Livraison :</b> {isOnlinePayment ? (isFullPayment ? 'Commande déjà soldée en ligne. Les frais de livraison sont réglés au livreur lors de la réception.' : 'Le solde restant et les frais de livraison seront réglés lors de la réception de votre colis.') : 'Toutes les modalités sont confirmées directement sur WhatsApp.'}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Financial Breakdown & Shipping Details */}
          <div className="space-y-6">
            {/* Financial summary card */}
            <div className="rounded-[2rem] border border-goldSoft/20 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1f190e]">
              <h2 className="border-b border-goldSoft/15 pb-4 font-display text-xl">Détail du règlement</h2>
              
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between text-black/65 dark:text-white/70">
                  <span>Sous-total articles</span>
                  <span>{formatCurrency(orderTotal)}</span>
                </div>
                <div className="flex justify-between text-black/65 dark:text-white/70">
                  <span>Livraison</span>
                  <span className="text-xs font-semibold text-gold">Réglée au livreur à la réception</span>
                </div>
                <div className="flex justify-between border-t border-goldSoft/20 pt-3 text-base font-bold">
                  <span>Total commande</span>
                  <span>{formatCurrency(orderTotal)}</span>
                </div>

                {isOnlinePayment ? (
                  <div className="mt-4 rounded-2xl bg-emerald-50/80 p-4 dark:bg-emerald-950/40">
                    <div className="flex justify-between font-semibold text-emerald-800 dark:text-emerald-300">
                      <span>{isFullPayment ? 'Montant intégral réglé' : 'Acompte réglé (50 %)'}</span>
                      <span>{formatCurrency(deposit)}</span>
                    </div>
                    <div className="mt-2 flex justify-between border-t border-emerald-200/50 pt-2 text-xs text-black/70 dark:text-white/75">
                      <span>Solde restant à la livraison</span>
                      <b className="font-semibold text-ink dark:text-white">{formatCurrency(remaining)}</b>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl bg-mist p-4 text-xs text-black/65 dark:bg-white/5 dark:text-white/70">
                    <p className="font-semibold text-gold">Mode WhatsApp sélectionné</p>
                    <p className="mt-1">Le règlement s’effectue selon les modalités convenues avec la créatrice.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping & Customer details */}
            <div className="rounded-[2rem] border border-goldSoft/20 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1f190e]">
              <h2 className="border-b border-goldSoft/15 pb-4 font-display text-xl">Coordonnées & Livraison</h2>
              
              <div className="mt-4 space-y-3.5 text-xs text-black/70 dark:text-white/75">
                <div className="flex items-start gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-mist text-gold shrink-0 dark:bg-white/5">
                    <Phone className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-semibold text-ink dark:text-white">{form.name || 'Cliente'}</p>
                    <p className="mt-0.5">{form.phone || 'Non renseigné'}</p>
                    {form.email && <p className="text-black/45 dark:text-white/45">{form.email}</p>}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-mist text-gold shrink-0 dark:bg-white/5">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-semibold text-ink dark:text-white">{form.city || 'Cotonou'}</p>
                    <p className="mt-0.5">{form.address || 'Adresse fournie lors de la commande'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-mist text-gold shrink-0 dark:bg-white/5">
                    <Truck className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-semibold text-ink dark:text-white">Option de livraison</p>
                    <p className="mt-0.5">{form.delivery || 'Livraison à domicile'}</p>
                  </div>
                </div>

                {form.comment && (
                  <div className="border-t border-goldSoft/15 pt-3">
                    <p className="font-semibold text-black/45">Note de commande :</p>
                    <p className="mt-1 italic">{form.comment}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              <a
                href={whatsappHelpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-5 text-sm font-bold text-white shadow-md transition hover:bg-[#20bd5a]"
              >
                <MessageSquare className="h-4 w-4" />
                Échanger avec l’atelier sur WhatsApp
              </a>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-black/15 bg-white px-4 text-xs font-semibold transition hover:bg-mist dark:border-white/15 dark:bg-white/5"
                >
                  <Printer className="h-4 w-4" /> Imprimer / Enregistrer
                </button>
                <Button to="/collections" variant="outline" className="flex-1">
                  Boutique <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
function LegacyLegalPage({ title }) { return <><SEO title={`${title} | TK SHOP`} noindex={true} /><article className="mx-auto max-w-3xl px-5 py-20"><h1 className="font-display text-5xl">{title}</h1><p className="mt-8 leading-8 text-black/60">Cette page présente les informations de référence de TK SHOP. Les modalités définitives seront mises à jour avant l’ouverture commerciale du service.</p><h2 className="mt-10 font-display text-2xl">Principes généraux</h2><p className="mt-4 leading-8 text-black/60">Les commandes sont confirmées après échange avec l’atelier. Les délais dépendent du modèle, des options de personnalisation et de la destination de livraison.</p></article></> }

export function AboutPage() {
  const { content } = useCatalog()
  const about = content.about || {}
  const aboutSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'Notre Histoire & Atelier Crochet TK SHOP',
    description: about.description || 'Histoire et démarche artisanale de TK SHOP, atelier de création de pièces uniques au crochet.',
    publisher: {
      '@type': 'Organization',
      name: 'TK SHOP',
    },
  }

  return <>
    <SEO
      title="Notre Histoire & Atelier de Crochet | TK SHOP"
      description={about.description || 'Découvrez l’univers de TK SHOP, atelier de créations d’exception faites main au crochet. Confection artisanale, raffinement et sur-mesure.'}
      keywords={['atelier crochet', 'histoire TK SHOP', 'créatrice crochet bénin', 'artisanat de luxe crochet', 'confection fait main']}
      path="/a-propos"
      image={about.image || "/assets/Marlene.jpg"}
      schema={aboutSchema}
      breadcrumbs={[
        { name: 'Accueil', url: '/' },
        { name: 'À propos', url: '/a-propos' },
      ]}
    />
    <section className="grid md:grid-cols-2"><div className="flex items-center bg-gradient-to-br from-mist to-linen p-10 dark:from-[#342a18] dark:to-[#211b10] md:p-20"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-gold">{about.eyebrow || 'Notre histoire'}</p><h1 className="mt-5 font-display text-5xl">{about.title || 'Le crochet entre les mains, l’élégance en héritage.'}</h1><p className="mt-7 leading-8 text-black/60">{about.description || 'TK SHOP est née d’une passion profonde pour le crochet. La créatrice transforme le fil, point après point, en pièces contemporaines.'}</p></div></div><div className="relative min-h-[560px]"><img src={about.image || "/assets/Marlene.jpg"} alt="Créatrice dans son atelier de crochet" className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-goldSoft/30 mix-blend-color" /></div></section><section className="mx-auto max-w-5xl px-5 py-24"><h2 className="font-display text-4xl">{about.sectionTitle || 'Le crochet comme signature'}</h2><p className="mt-8 max-w-3xl leading-8 text-black/60">{about.sectionText || 'Chaque création commence par une conversation, le choix du fil et un motif. La pièce grandit ensuite boucle après boucle sous le crochet, jusqu’à épouser parfaitement la silhouette.'}</p></section></>
}

export function ContactPage() {
  const { settings, content } = useCatalog()
  const contact = content.contact || {}
  const [phone, setPhone] = useState('')
  const submit = event => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const body = `Bonjour ${settings.shop_name},\n\n${data.get('message')}\n\nNom : ${data.get('name')}\nTéléphone : ${data.get('phone')}\nE-mail : ${data.get('email')}\nSujet : ${data.get('subject')}`
    const number = String(settings.whatsapp || '').replace(/\D/g, '')
    if (/^\d{8,15}$/.test(number)) {
      const whatsappUrl = new URL(`https://wa.me/${number}`)
      whatsappUrl.searchParams.set('text', body)
      window.open(whatsappUrl.toString(), '_blank', 'noopener,noreferrer')
      return
    }
    const email = String(settings.email || '').trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Aucun moyen de contact valide n’est configuré.')
      return
    }
    const emailLink = document.createElement('a')
    emailLink.href = `mailto:${email}?subject=${encodeURIComponent(String(data.get('subject') || ''))}&body=${encodeURIComponent(body)}`
    emailLink.rel = 'noopener noreferrer'
    emailLink.click()
  }

  const contactSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact & Commande sur-mesure TK SHOP',
    description: 'Contactez l’atelier TK SHOP pour une commande de crochet sur mesure ou des informations.',
    mainEntity: {
      '@type': 'LocalBusiness',
      name: 'TK SHOP',
      telephone: settings.phone,
      email: settings.email,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Cotonou',
        addressCountry: 'BJ',
      },
    },
  }

  return <>
    <SEO
      title="Contact & Commande sur-mesure | TK SHOP"
      description="Une idée de pièce en crochet sur mesure, une question sur une taille ou votre livraison ? Contactez directement l’atelier TK SHOP par WhatsApp ou e-mail."
      keywords={['contact atelier crochet', 'commande sur mesure crochet', 'crochet personnalisé', 'whatsapp tk shop']}
      path="/contact"
      schema={contactSchema}
      breadcrumbs={[
        { name: 'Accueil', url: '/' },
        { name: 'Contact', url: '/contact' },
      ]}
    />
    <div className="mx-auto grid max-w-6xl gap-14 px-5 py-20 md:grid-cols-2"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-gold">{contact.eyebrow || 'Parlons de votre projet'}</p><h1 className="mt-4 font-display text-5xl">{contact.title || 'Une question, une envie ?'}</h1><p className="mt-6 leading-8 text-black/60">{contact.description || 'Écrivez-nous. Nous vous répondrons avec plaisir pour imaginer ensemble votre prochaine création.'}</p><div className="mt-10 grid gap-5 text-sm"><p className="flex gap-3"><MessageCircle className="text-gold" />{settings.phone}</p><p className="flex gap-3"><Mail className="text-gold" />{settings.email}</p><p className="flex gap-3"><MapPin className="text-gold" />{settings.address}</p></div></div><form onSubmit={submit} className="grid gap-4"><label className="text-sm font-semibold">Nom<input required name="name" className="mt-2 w-full border border-black/20 px-4 py-3" /></label><label className="text-sm font-semibold">E-mail<input required type="email" name="email" className="mt-2 w-full border border-black/20 px-4 py-3" /></label><label className="text-sm font-semibold">Téléphone<PhoneInput required value={phone} onChange={setPhone} /></label><label className="text-sm font-semibold">Sujet<input required name="subject" className="mt-2 w-full border border-black/20 px-4 py-3" /></label><label className="text-sm font-semibold">Message<textarea required name="message" rows="5" className="mt-2 w-full resize-none border border-black/20 px-4 py-3" /></label><Button type="submit">{contact.button || 'Envoyer sur WhatsApp'}</Button></form></div></>
}

export function LegalPage({ title }) {
  const { content } = useCatalog()
  const key = title === 'Politique de confidentialité' ? 'privacy' : title === 'Conditions générales' ? 'terms' : title === 'Mentions légales' ? 'legal' : 'delivery'
  const defaults = {
    privacy: 'TK SHOP collecte uniquement les informations nécessaires au traitement des commandes et des demandes : nom, coordonnées, adresse de livraison et détails de la commande.\n\nCes données servent à préparer la commande, contacter la cliente et organiser la livraison. Elles ne sont pas vendues. Vous pouvez demander leur accès, leur correction ou leur suppression en contactant TK SHOP.',
    terms: 'Toute commande est confirmée après validation du modèle, des options, du prix et du délai avec TK SHOP. Les prix sont affichés en FCFA et les modalités de paiement sont communiquées lors de la confirmation.\n\nLes couleurs, tailles et mensurations fournies doivent être exactes. Les créations déjà commencées ou personnalisées peuvent ne pas être remboursables. Une solution amiable sera recherchée en priorité en cas de difficulté.',
    delivery: 'Les délais et frais de livraison dépendent de la destination et sont confirmés avant l’expédition. Tout problème doit être signalé dès la réception avec des photos.\n\nUne création personnalisée ou réalisée selon des mensurations spécifiques ne peut être retournée pour simple changement d’avis. En cas d’article endommagé ou non conforme, TK SHOP étudiera une réparation, un échange ou une solution adaptée.',
    legal: 'Le présent site est édité par TK SHOP — Taye & Kinde Shop, boutique de créations artisanales au crochet. Les coordonnées professionnelles sont celles affichées sur le site.\n\nLe site est hébergé par Vercel Inc. et les données applicatives par Supabase. Les textes, photographies, créations, éléments graphiques et logos sont protégés. Toute reproduction sans autorisation préalable est interdite.',
  }
  const fallback = defaults[key]
  const paragraphs = (content[key]?.body || fallback).split(/\n+/).filter(Boolean)
  const pathMap = {
    privacy: '/politique-de-confidentialite',
    terms: '/conditions-generales',
    legal: '/mentions-legales',
    delivery: '/livraison-et-retours',
  }

  return <>
    <SEO
      title={`${title} | TK SHOP`}
      description={`Consultez les informations de référence de TK SHOP concernant : ${title.toLowerCase()}.`}
      path={pathMap[key] || '/'}
      breadcrumbs={[
        { name: 'Accueil', url: '/' },
        { name: title, url: pathMap[key] || '/' },
      ]}
    />
    <article className="mx-auto max-w-3xl px-5 py-20"><p className="text-xs font-bold uppercase tracking-[.2em] text-gold">Informations TK SHOP</p><h1 className="mt-4 font-display text-5xl">{title}</h1><div className="mt-10 grid gap-6">{paragraphs.map((paragraph, index) => <p key={index} className="whitespace-pre-wrap leading-8 text-black/60">{paragraph}</p>)}</div></article></>
}
