import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ArrowLeft, CreditCard, MessageSquare, ShieldCheck, Truck, Store, Info, CheckCircle2, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import SEO from '../../components/common/SEO'
import Button from '../../components/common/Button'
import { useCart } from '../../contexts/CartContext'
import { formatCurrency } from '../../utils/formatCurrency'
import { createWhatsAppMessage, whatsappUrl } from '../../services/whatsappService'
import { createOrder, confirmOnlinePayment } from '../../services/orderService'
import { useCatalog } from '../../contexts/CatalogContext'
import PhoneInput from '../../components/common/PhoneInput'
import ProductMediaThumb from '../../components/products/ProductMediaThumb'
import OrderRecapModal from '../../components/cart/OrderRecapModal'

const initial = {
  name: '',
  email: '',
  phone: '',
  city: '',
  address: '',
  delivery: '',
  comment: '',
  paymentMethod: 'fedapay',
  paymentType: 'deposit', // 'deposit' (50%) ou 'full' (100%)
  terms: false,
}

const loadFedaPaySDK = () => {
  if (typeof window !== 'undefined' && window.FedaPay) {
    return Promise.resolve(window.FedaPay)
  }
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.FedaPay) {
      return resolve(window.FedaPay)
    }

    if (typeof document !== 'undefined' && !document.querySelector('script[data-fedapay-checkout]')) {
      const script = document.createElement('script')
      script.src = '/fedapay-checkout.js'
      script.async = true
      script.dataset.fedapayCheckout = 'true'
      script.onload = () => {
        if (window.FedaPay) resolve(window.FedaPay)
      }
      script.onerror = () => {
        const cdnScript = document.createElement('script')
        cdnScript.src = 'https://cdn.fedapay.com/checkout.js?v=1.1.7'
        cdnScript.async = true
        cdnScript.dataset.fedapayCheckout = 'true'
        cdnScript.onload = () => {
          if (window.FedaPay) resolve(window.FedaPay)
        }
        document.head.appendChild(cdnScript)
      }
      document.head.appendChild(script)
    }

    let attempts = 0
    const maxAttempts = 50 // 5 secondes
    const interval = setInterval(() => {
      attempts++
      if (typeof window !== 'undefined' && window.FedaPay) {
        clearInterval(interval)
        return resolve(window.FedaPay)
      }
      if (attempts >= maxAttempts) {
        clearInterval(interval)
        return reject(new Error('Impossible de joindre le service de paiement sécurisé. Vérifiez votre connexion.'))
      }
    }, 50)
  })
}

export default function CheckoutPage() {
  const { items, subtotal, total, clearCart } = useCart()
  const { settings } = useCatalog()
  const [form, setForm] = useState(initial)
  const [submitting, setSubmitting] = useState(false)
  const [completedOrder, setCompletedOrder] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadFedaPaySDK().catch(() => {})
  }, [])

  if (!items.length && !completedOrder) return <Navigate to="/panier" replace />

  const change = e => setForm({ ...form, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  const depositAmount = Math.ceil(total / 2)
  const remainingAmount = total - depositAmount
  const isFullPayment = form.paymentType === 'full'
  const amountToPay = isFullPayment ? total : depositAmount

  const submit = async e => {
    e.preventDefault()
    const missing = ['name', 'phone', 'city', 'address', 'delivery'].some(k => !form[k]?.trim())
    if (missing || !form.terms) return toast.error('Veuillez compléter tous les champs obligatoires.')
    
    setSubmitting(true)
    try {
      if (form.paymentMethod === 'fedapay') {
        const key = import.meta.env.VITE_FEDAPAY_PUBLIC_KEY
        if (!key) throw new Error('Le module de paiement en ligne est indisponible.')
      }

      const order = await createOrder(form, items, form.paymentMethod, form.paymentType)
      const secureTotal = order?.total ?? total
      const secureDeposit = form.paymentType === 'full' 
        ? secureTotal 
        : (order?.deposit_amount ?? Math.ceil(secureTotal / 2))
      const secureRemaining = Math.max(0, secureTotal - secureDeposit)
      const chargeAmount = form.paymentType === 'full' ? secureTotal : secureDeposit

      if (form.paymentMethod === 'fedapay') {
        const key = import.meta.env.VITE_FEDAPAY_PUBLIC_KEY
        const FedaPay = await loadFedaPaySDK()

        const description = form.paymentType === 'full'
          ? `Paiement intégral commande TK SHOP ${order?.order_number || ''}`.trim()
          : `Acompte 50% commande TK SHOP ${order?.order_number || ''}`.trim()

        const widget = FedaPay.init({
          public_key: key,
          environment: import.meta.env.VITE_FEDAPAY_ENVIRONMENT || 'sandbox',
          locale: 'fr',
          currency: {
            iso: 'XOF'
          },
          transaction: {
            amount: chargeAmount,
            description,
            custom_metadata: {
              order_id: order?.id || '',
              payment_type: form.paymentType
            }
          },
          customer: {
            email: form.email || undefined,
            firstname: form.name,
            phone_number: {
              number: form.phone
            }
          },
          onComplete: async (resp) => {
            const reason = typeof resp === 'string' ? resp : resp?.reason
            const tx = resp?.transaction || (typeof resp === 'object' ? resp : null)
            const status = tx?.status || resp?.status

            const isSuccess =
              status === 'approved' ||
              status === 'transferred' ||
              reason === 'CHECKOUT COMPLETE' ||
              reason === 'CHECKOUT_COMPLETED' ||
              reason === FedaPay.CHECKOUT_COMPLETED

            const isDismissed =
              reason === 'DIALOG DISMISSED' ||
              reason === FedaPay.DIALOG_DISMISSED ||
              resp?.close === true

            if (isSuccess && !isDismissed) {
              // Confirmation et enregistrement direct dans la base de données Supabase
              if (order?.id) {
                await confirmOnlinePayment(order.id, {
                  transactionId: tx?.id || resp?.id || 'online_tx',
                  isFullPayment: form.paymentType === 'full',
                  amountPaid: chargeAmount
                }).catch(() => {})
              }

              const orderData = {
                form,
                items: [...items],
                total: secureTotal,
                depositAmount: chargeAmount,
                remainingAmount: secureRemaining,
                paymentType: form.paymentType,
                order,
                paymentMethod: 'fedapay'
              }
              try {
                sessionStorage.setItem('tk-shop-last-order', JSON.stringify(orderData))
                localStorage.setItem('tk-shop-last-order', JSON.stringify(orderData))
              } catch {}

              clearCart()
              setCompletedOrder(orderData)
            } else if (isDismissed) {
              toast.error('Paiement interrompu. Vous pouvez réessayer ou finaliser sur WhatsApp.')
            } else {
              toast.error('Paiement non finalisé. Vous pouvez réessayer ou opter pour WhatsApp.')
            }
          }
        })
        widget.open()
        return
      }

      // Mode WhatsApp
      window.open(whatsappUrl(createWhatsAppMessage(form, items, secureTotal, settings.shop_name), settings.whatsapp), '_blank', 'noopener,noreferrer')
      
      const whatsappOrderData = {
        form,
        items: [...items],
        total: secureTotal,
        depositAmount: 0,
        remainingAmount: secureTotal,
        paymentType: 'whatsapp',
        order,
        paymentMethod: 'whatsapp'
      }
      try {
        sessionStorage.setItem('tk-shop-last-order', JSON.stringify(whatsappOrderData))
        localStorage.setItem('tk-shop-last-order', JSON.stringify(whatsappOrderData))
      } catch {}

      clearCart()
      setCompletedOrder(whatsappOrderData)
    } catch (error) {
      toast.error(`La commande n’a pas pu être finalisée : ${error.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <SEO title="Finaliser ma commande | TK SHOP" noindex={true} />

      {/* Popup Récapitulatif instantané sur la page de validation */}
      <OrderRecapModal
        isOpen={Boolean(completedOrder)}
        onClose={() => {
          setCompletedOrder(null)
          navigate('/commande/confirmation')
        }}
        orderData={completedOrder}
        settings={settings}
        onNavigateConfirmation={() => {
          setCompletedOrder(null)
          navigate('/commande/confirmation')
        }}
      />
      <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-goldSoft/15 bg-ivory/95 px-4 backdrop-blur-xl md:hidden">
        <Link to="/panier" className="grid h-10 w-10 place-items-center rounded-full bg-mist" aria-label="Retour au panier">
          <ArrowLeft className="h-5 w-5"/>
        </Link>
        <div className="text-center">
          <h1 className="font-display text-xl">Validation du panier</h1>
          <p className="text-[9px] uppercase tracking-wider text-gold">Dernière étape</p>
        </div>
        <div className="h-10 w-10"/>
      </div>
      <div className="mx-auto max-w-6xl px-5 pb-16 pt-7 md:py-16">
        <h1 className="hidden font-display text-5xl md:block">Finaliser ma commande</h1>
        <p className="text-black/60 dark:text-white/65 md:mt-3">Sélectionnez votre mode de règlement et vos coordonnées pour lancer la confection.</p>
        
        <form onSubmit={submit} className="mt-8 grid gap-10 md:mt-10 lg:grid-cols-[1fr_390px]">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-semibold text-ink dark:text-white">Nom complet *
              <input required name="name" value={form.name} onChange={change} className="mt-2 w-full rounded-xl border border-black/20 bg-white px-4 py-3 outline-none focus:border-gold dark:border-white/20 dark:bg-[#1f190e] dark:text-white"/>
            </label>
            <label className="text-sm font-semibold text-ink dark:text-white">E-mail
              <input type="email" name="email" value={form.email} onChange={change} className="mt-2 w-full rounded-xl border border-black/20 bg-white px-4 py-3 outline-none focus:border-gold dark:border-white/20 dark:bg-[#1f190e] dark:text-white"/>
            </label>
            <label className="text-sm font-semibold text-ink dark:text-white">Téléphone *
              <PhoneInput required value={form.phone} onChange={value => setForm(current => ({ ...current, phone: value }))}/>
            </label>
            <label className="text-sm font-semibold text-ink dark:text-white">Ville *
              <input required name="city" value={form.city} onChange={change} className="mt-2 w-full rounded-xl border border-black/20 bg-white px-4 py-3 outline-none focus:border-gold dark:border-white/20 dark:bg-[#1f190e] dark:text-white"/>
            </label>
            <label className="text-sm font-semibold text-ink dark:text-white sm:col-span-2">Quartier ou adresse de livraison *
              <input required name="address" value={form.address} onChange={change} placeholder="Ex: Cadjèhoun, maison à côté de la pharmacie" className="mt-2 w-full rounded-xl border border-black/20 bg-white px-4 py-3 outline-none focus:border-gold dark:border-white/20 dark:bg-[#1f190e] dark:text-white"/>
            </label>

            {/* Mode de livraison */}
            <div className="sm:col-span-2">
              <label className="text-sm font-semibold text-ink dark:text-white">Option de livraison *
                <select required name="delivery" value={form.delivery} onChange={change} className="mt-2 w-full rounded-xl border border-black/20 bg-white px-4 py-3 outline-none focus:border-gold dark:border-white/20 dark:bg-[#1f190e] dark:text-white">
                  <option value="">Sélectionner une option</option>
                  <option value="Livraison à domicile">Livraison à domicile (frais réglés directement au livreur)</option>
                  <option value="Retrait à l’atelier">Retrait à l’atelier (gratuit)</option>
                  <option value="Livraison internationale">Livraison internationale (modalités fixées avant expédition)</option>
                </select>
              </label>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-black/60 dark:text-white/60">
                <Truck className="h-3.5 w-3.5 text-gold shrink-0" />
                Les frais de livraison ne sont pas facturés en ligne : ils sont réglés directement au livreur à la réception.
              </p>
            </div>

            {/* Mode de règlement */}
            <fieldset className="grid gap-3.5 sm:col-span-2 border-t border-goldSoft/20 pt-5">
              <legend className="text-sm font-semibold text-ink dark:text-white">Mode de règlement</legend>
              
              {/* Option 1: Paiement sécurisé en ligne */}
              <div className={`rounded-2xl border p-4 sm:p-5 transition ${form.paymentMethod === 'fedapay' ? 'border-gold bg-mist/90 dark:bg-[#271f13] shadow-sm ring-1 ring-gold/30' : 'border-goldSoft/25 bg-white/60 hover:bg-white dark:bg-white/5 dark:hover:bg-white/10'}`}>
                <label className="flex cursor-pointer items-start gap-3.5 select-none">
                  <input type="radio" name="paymentMethod" value="fedapay" checked={form.paymentMethod === 'fedapay'} onChange={change} className="sr-only"/>
                  <div className={`mt-0.5 flex h-5 w-5 min-h-[20px] min-w-[20px] shrink-0 items-center justify-center rounded-full border-2 transition ${
                    form.paymentMethod === 'fedapay'
                      ? 'border-gold bg-gold/15'
                      : 'border-black/35 dark:border-white/40 bg-transparent'
                  }`}>
                    {form.paymentMethod === 'fedapay' && <div className="h-2.5 w-2.5 rounded-full bg-gold" />}
                  </div>
                  <div className="flex-1">
                    <span className="flex items-center gap-2 text-sm font-bold text-ink dark:text-white">
                      <CreditCard className="h-4 w-4 text-gold" />
                      Paiement sécurisé en ligne
                    </span>
                    <small className="mt-1 block text-xs font-normal text-black/65 dark:text-white/70">
                      Règlement instantané par Mobile Money (MTN, Moov, Celtiis, Orange, Wave) ou Carte bancaire.
                    </small>
                  </div>
                </label>

                {/* Sub-choice: 50% deposit vs 100% full payment */}
                {form.paymentMethod === 'fedapay' && (
                  <div className="mt-4 ml-8 grid gap-2.5 border-t border-goldSoft/25 pt-3.5">
                    <p className="text-xs font-semibold text-black/80 dark:text-white/85">Choisissez le montant à régler :</p>
                    
                    {/* Option Acompte 50% */}
                    <label className={`flex cursor-pointer items-center justify-between rounded-xl border p-3.5 text-xs transition select-none ${
                      form.paymentType === 'deposit'
                        ? 'border-gold bg-[#181713] text-white shadow-md dark:bg-black dark:border-gold dark:text-white'
                        : 'border-black/15 bg-white text-[#181713] hover:border-gold/50 dark:border-white/20 dark:bg-[#1a150c] dark:text-white/90'
                    }`}>
                      <div className="flex items-center gap-3">
                        <input type="radio" name="paymentType" value="deposit" checked={form.paymentType === 'deposit'} onChange={change} className="sr-only"/>
                        <div className={`flex h-5 w-5 min-h-[20px] min-w-[20px] shrink-0 items-center justify-center rounded-full border-2 transition ${
                          form.paymentType === 'deposit'
                            ? 'border-sand bg-sand/20'
                            : 'border-black/35 dark:border-white/40 bg-transparent'
                        }`}>
                          {form.paymentType === 'deposit' && <div className="h-2.5 w-2.5 rounded-full bg-sand" />}
                        </div>
                        <span className="font-medium">Acompte de 50 % (solde à la livraison)</span>
                      </div>
                      <b className={form.paymentType === 'deposit' ? 'text-sand font-bold text-sm' : 'text-gold font-bold text-sm'}>
                        {formatCurrency(depositAmount)}
                      </b>
                    </label>

                    {/* Option Paiement intégral 100% */}
                    <label className={`flex cursor-pointer items-center justify-between rounded-xl border p-3.5 text-xs transition select-none ${
                      form.paymentType === 'full'
                        ? 'border-gold bg-[#181713] text-white shadow-md dark:bg-black dark:border-gold dark:text-white'
                        : 'border-black/15 bg-white text-[#181713] hover:border-gold/50 dark:border-white/20 dark:bg-[#1a150c] dark:text-white/90'
                    }`}>
                      <div className="flex items-center gap-3">
                        <input type="radio" name="paymentType" value="full" checked={form.paymentType === 'full'} onChange={change} className="sr-only"/>
                        <div className={`flex h-5 w-5 min-h-[20px] min-w-[20px] shrink-0 items-center justify-center rounded-full border-2 transition ${
                          form.paymentType === 'full'
                            ? 'border-sand bg-sand/20'
                            : 'border-black/35 dark:border-white/40 bg-transparent'
                        }`}>
                          {form.paymentType === 'full' && <div className="h-2.5 w-2.5 rounded-full bg-sand" />}
                        </div>
                        <span className="font-medium">Paiement intégral (100 %)</span>
                      </div>
                      <b className={form.paymentType === 'full' ? 'text-sand font-bold text-sm' : 'text-gold font-bold text-sm'}>
                        {formatCurrency(total)}
                      </b>
                    </label>
                  </div>
                )}
              </div>

              {/* Option 2: WhatsApp */}
              <label className={`flex cursor-pointer items-start gap-3.5 rounded-2xl border p-4 sm:p-5 transition select-none ${form.paymentMethod === 'whatsapp' ? 'border-gold bg-mist/90 dark:bg-[#271f13] shadow-sm ring-1 ring-gold/30' : 'border-goldSoft/25 bg-white/60 hover:bg-white dark:bg-white/5 dark:hover:bg-white/10'}`}>
                <input type="radio" name="paymentMethod" value="whatsapp" checked={form.paymentMethod === 'whatsapp'} onChange={change} className="sr-only"/>
                <div className={`mt-0.5 flex h-5 w-5 min-h-[20px] min-w-[20px] shrink-0 items-center justify-center rounded-full border-2 transition ${
                  form.paymentMethod === 'whatsapp'
                    ? 'border-gold bg-gold/15'
                    : 'border-black/35 dark:border-white/40 bg-transparent'
                }`}>
                  {form.paymentMethod === 'whatsapp' && <div className="h-2.5 w-2.5 rounded-full bg-gold" />}
                </div>
                <div className="flex-1">
                  <span className="flex items-center gap-2 text-sm font-bold text-ink dark:text-white">
                    <MessageSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    Commander via WhatsApp
                  </span>
                  <small className="mt-1 block text-xs font-normal text-black/65 dark:text-white/70">
                    Échange direct avec la créatrice pour convenir des modalités et du paiement.
                  </small>
                </div>
              </label>
            </fieldset>

            <label className="text-sm font-semibold text-ink dark:text-white sm:col-span-2">Instructions ou précisions pour la créatrice
              <textarea name="comment" value={form.comment} onChange={change} rows="3" placeholder="Mensurations complémentaires, préférences particulières…" className="mt-2 w-full resize-none rounded-xl border border-black/20 bg-white px-4 py-3 outline-none focus:border-gold dark:border-white/20 dark:bg-[#1f190e] dark:text-white"/>
            </label>
            <label className="flex cursor-pointer items-start gap-3.5 text-sm text-black/85 dark:text-white/90 sm:col-span-2 select-none group">
              <input type="checkbox" name="terms" checked={form.terms} onChange={change} className="sr-only"/>
              <div className={`mt-0.5 flex h-5 w-5 min-h-[20px] min-w-[20px] shrink-0 items-center justify-center rounded-md border-2 transition ${
                form.terms
                  ? 'border-gold bg-gold text-white shadow-sm'
                  : 'border-black/35 bg-white group-hover:border-gold dark:border-white/40 dark:bg-white/10 dark:group-hover:border-gold'
              }`}>
                {form.terms && <Check className="h-3.5 w-3.5 text-white stroke-[3]" />}
              </div>
              <span className="leading-snug">J’accepte les conditions générales et la transmission de ces informations pour la confection.</span>
            </label>
          </div>

          {/* Recap column */}
          <aside className="h-fit rounded-2xl border border-goldSoft/20 bg-mist p-6 dark:bg-[#211a0e] sm:p-7">
            <h2 className="font-display text-2xl">Votre commande</h2>
            <div className="mt-6 divide-y divide-goldSoft/20">
              {items.map(item => (
                <div key={item.lineKey} className="flex gap-3 py-4">
                  <ProductMediaThumb product={item} alt={item.name} className="h-16 w-12 rounded-lg"/>
                  <div className="flex-1 text-sm">
                    <b className="font-medium text-ink dark:text-white">{item.name}</b>
                    <p className="text-xs text-black/55 dark:text-white/60">Qté {item.quantity}{item.size ? ` · ${item.size}` : ''}</p>
                  </div>
                  <span className="text-sm font-semibold">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-3 border-t border-goldSoft/20 pt-5 text-sm">
              <div className="flex justify-between text-black/70 dark:text-white/75">
                <span>Sous-total articles</span>
                <span className="font-semibold text-ink dark:text-white">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-black/70 dark:text-white/75">
                <span>Livraison</span>
                <span className="text-xs font-semibold text-gold">Réglée au livreur</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total de la commande</span>
                <span className="text-gold">{formatCurrency(total)}</span>
              </div>

              {form.paymentMethod === 'fedapay' && (
                <div className="mt-2 rounded-xl bg-ivory p-3.5 text-xs leading-relaxed border border-goldSoft/30 dark:bg-[#2c2314] dark:border-goldSoft/30">
                  <div className="flex justify-between font-bold text-ink dark:text-white">
                    <span>Montant réglé en ligne :</span>
                    <span className="text-gold text-sm">{formatCurrency(amountToPay)}</span>
                  </div>
                  <div className="mt-1.5 flex justify-between text-black/65 dark:text-white/70 border-t border-black/5 dark:border-white/10 pt-1.5">
                    <span>Solde restant à la livraison :</span>
                    <b className="text-ink dark:text-white">{formatCurrency(isFullPayment ? 0 : remainingAmount)}</b>
                  </div>
                </div>
              )}
            </div>

            <Button type="submit" className="mt-7 w-full" disabled={submitting}>
              {submitting ? 'Traitement en cours…' : form.paymentMethod === 'fedapay' ? `Payer en ligne (${formatCurrency(amountToPay)})` : 'Finaliser sur WhatsApp'}
            </Button>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-black/50 dark:text-white/50">
              <ShieldCheck className="h-3.5 w-3.5 text-gold" />
              <span>Confection artisanale sur-mesure garantie</span>
            </div>
          </aside>
        </form>
      </div>
    </>
  )
}

