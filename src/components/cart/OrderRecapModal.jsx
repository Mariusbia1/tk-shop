import { X, Receipt, CheckCircle2, MessageSquare, Printer, Eye, Truck, ShieldCheck, MapPin, Phone, User, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatCurrency } from '../../utils/formatCurrency'
import ProductMediaThumb from '../products/ProductMediaThumb'
import { siteConfig } from '../../config/siteConfig'

export default function OrderRecapModal({ isOpen, onClose, orderData, settings, onNavigateConfirmation }) {
  if (!isOpen || !orderData) return null

  const {
    form = {},
    items = [],
    total = 0,
    depositAmount = 0,
    remainingAmount = 0,
    paymentType = 'deposit',
    order = {},
    paymentMethod = 'fedapay'
  } = orderData

  const isOnlinePayment = paymentMethod === 'fedapay'
  const isFullPayment = paymentType === 'full' || (isOnlinePayment && remainingAmount === 0)
  const orderNumber = order?.order_number || order?.id || (orderData?.orderNumber ?? '')
  const orderTotal = Number(total || 0)
  const deposit = isOnlinePayment 
    ? (depositAmount || (isFullPayment ? orderTotal : Math.ceil(orderTotal / 2)))
    : 0
  const remaining = isOnlinePayment
    ? (isFullPayment ? 0 : (remainingAmount ?? Math.max(0, orderTotal - deposit)))
    : orderTotal

  const orderDate = order?.created_at
    ? new Date(order.created_at).toLocaleDateString('fr-FR', {
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
    `Bonjour ${settings?.shop_name || 'TK SHOP'},\n\nJe vous contacte au sujet de ma commande${orderNumber ? ` n° ${orderNumber}` : ''} passée sur votre boutique en ligne.\nNom : ${form.name || ''}\nTotal : ${formatCurrency(orderTotal)}`
  )}`

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md sm:p-6 animate-fadeIn">
      {/* Overlay click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Dialog Card */}
      <div 
        className="relative z-10 flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-[2.5rem] border border-goldSoft/30 bg-[#fffef9] shadow-[0_25px_70px_rgba(0,0,0,0.35)] dark:bg-[#1f190e] dark:border-goldSoft/30 animate-scaleUp"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-goldSoft/20 bg-mist/70 px-6 py-4.5 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gold/15 text-gold">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg sm:text-xl font-bold text-ink dark:text-white">Récapitulatif de commande</h2>
              <div className="flex items-center gap-2 mt-0.5">
                {orderNumber ? (
                  <span className="font-mono text-xs font-bold text-gold">Réf : {orderNumber}</span>
                ) : (
                  <span className="text-[11px] text-black/55 dark:text-white/60">Commande confirmée</span>
                )}
                <span className="text-[10px] text-black/40 dark:text-white/40">· {orderDate}</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full bg-black/5 text-black/60 transition hover:bg-gold hover:text-white dark:bg-white/10 dark:text-white"
            aria-label="Fermer le récapitulatif"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-sm">
          {/* Status & Amount highlight banner */}
          <div className={`rounded-2xl p-4.5 text-xs ${
            isOnlinePayment
              ? 'bg-emerald-50/90 text-emerald-950 border border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-200'
              : 'bg-mist text-ink border border-goldSoft/30 dark:bg-white/5 dark:text-white'
          }`}>
            <div className="flex items-center justify-between font-bold text-sm">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                {isOnlinePayment 
                  ? (isFullPayment ? 'Paiement intégral réglé' : 'Acompte 50 % réglé') 
                  : 'Commande WhatsApp enregistrée'}
              </span>
              <span className="text-gold font-bold text-base font-mono">
                {formatCurrency(isOnlinePayment ? deposit : orderTotal)}
              </span>
            </div>

            {isOnlinePayment && !isFullPayment && (
              <div className="mt-2.5 flex justify-between border-t border-emerald-200/60 pt-2 text-xs dark:border-emerald-800/60">
                <span className="font-medium">Solde restant à la livraison :</span>
                <b className="font-bold text-ink dark:text-white">{formatCurrency(remaining)}</b>
              </div>
            )}

            <div className="mt-2 flex items-center justify-between text-[11px] opacity-85 border-t border-black/5 dark:border-white/10 pt-2">
              <span className="flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5 text-gold shrink-0" />
                Frais de livraison :
              </span>
              <span className="font-semibold text-gold">Réglés directement au livreur</span>
            </div>
          </div>

          {/* Items summary */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-wider text-gold">
                Articles commandés ({items.reduce((acc, it) => acc + (it.quantity || 1), 0)})
              </p>
              <span className="text-xs font-semibold text-black/50 dark:text-white/50">Total : {formatCurrency(orderTotal)}</span>
            </div>
            <div className="divide-y divide-goldSoft/15 rounded-2xl border border-goldSoft/20 bg-white p-3.5 dark:bg-white/5">
              {items.map((item, idx) => (
                <div key={item.lineKey || idx} className="flex items-center gap-3.5 py-2.5 first:pt-0 last:pb-0">
                  <ProductMediaThumb product={item} alt={item.name} className="h-14 w-11 shrink-0 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1 text-xs">
                    <p className="truncate font-bold text-ink dark:text-white text-sm">{item.name}</p>
                    <div className="mt-0.5 flex flex-wrap gap-1 text-[11px] text-black/60 dark:text-white/65">
                      <span>Qté {item.quantity || 1}</span>
                      {item.size && <span>· Taille {item.size}</span>}
                      {item.color && <span>· {item.color}</span>}
                    </div>
                    {item.measurements && (
                      <p className="mt-0.5 text-[10px] text-gold font-medium truncate">Mesures : {item.measurements}</p>
                    )}
                  </div>
                  <span className="text-xs font-bold text-gold shrink-0">
                    {formatCurrency(item.price * (item.quantity || 1))}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Client and delivery info */}
          <div className="rounded-2xl border border-goldSoft/20 bg-white p-4.5 text-xs dark:bg-white/5 space-y-2.5">
            <p className="font-bold uppercase tracking-wider text-gold text-[10px] flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-gold" />
              Destinataire & Livraison
            </p>
            <div className="flex justify-between items-start gap-2">
              <span className="text-black/60 dark:text-white/60 shrink-0">Client :</span>
              <b className="text-ink dark:text-white text-right">{form.name || 'Cliente'} {form.phone ? `(${form.phone})` : ''}</b>
            </div>
            <div className="flex justify-between items-start gap-2">
              <span className="text-black/60 dark:text-white/60 shrink-0">Adresse :</span>
              <span className="text-right text-ink dark:text-white font-medium">{form.city || ''} {form.address ? `· ${form.address}` : ''}</span>
            </div>
            <div className="flex justify-between items-start gap-2">
              <span className="text-black/60 dark:text-white/60 shrink-0">Option :</span>
              <span className="text-right text-ink dark:text-white font-medium">{form.delivery || 'Livraison à domicile'}</span>
            </div>
            {form.comment && (
              <div className="border-t border-black/5 dark:border-white/10 pt-2 text-[11px] text-black/65 dark:text-white/65">
                <span className="font-semibold text-gold">Note : </span>
                <span className="italic">{form.comment}</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="border-t border-goldSoft/20 bg-mist/70 p-4 sm:p-5 dark:bg-white/5 space-y-2.5">
          <a
            href={whatsappHelpUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-5 text-xs sm:text-sm font-bold text-white shadow-md transition hover:bg-[#20bd5a]"
          >
            <MessageSquare className="h-4 w-4" />
            Échanger avec l’atelier sur WhatsApp
          </a>

          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={handlePrint}
              className="flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-2xl border border-black/15 bg-white px-3 text-xs font-semibold hover:bg-mist dark:border-white/15 dark:bg-white/10"
            >
              <Printer className="h-3.5 w-3.5 text-gold" />
              Imprimer le reçu
            </button>

            {onNavigateConfirmation ? (
              <button
                type="button"
                onClick={onNavigateConfirmation}
                className="flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-2xl bg-gold px-3 text-xs font-semibold text-white shadow-sm hover:opacity-90"
              >
                <Eye className="h-3.5 w-3.5" />
                Page détaillée
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-2xl bg-gold px-3 text-xs font-semibold text-white shadow-sm hover:opacity-90"
              >
                <Eye className="h-3.5 w-3.5" />
                Fermer le récapitulatif
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
