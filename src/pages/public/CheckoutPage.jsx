import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import SEO from '../../components/common/SEO'
import Button from '../../components/common/Button'
import { useCart } from '../../contexts/CartContext'
import { formatCurrency } from '../../utils/formatCurrency'
import { createWhatsAppMessage, whatsappUrl } from '../../services/whatsappService'
import { createOrder } from '../../services/orderService'
import { useCatalog } from '../../contexts/CatalogContext'
import PhoneInput from '../../components/common/PhoneInput'
import ProductMediaThumb from '../../components/products/ProductMediaThumb'

const initial = { name: '', email: '', phone: '', city: '', address: '', delivery: '', comment: '', paymentMethod: 'whatsapp', terms: false }
const loadFedaPaySDK = () => {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.FedaPay) {
      return resolve(window.FedaPay)
    }

    if (typeof document !== 'undefined' && !document.querySelector('script[data-fedapay-checkout]')) {
      const script = document.createElement('script')
      script.src = 'https://cdn.fedapay.com/checkout.js?v=1.1.7'
      script.async = true
      script.dataset.fedapayCheckout = 'true'
      document.head.appendChild(script)
    }

    let attempts = 0
    const maxAttempts = 80 // 8 secondes
    const interval = setInterval(() => {
      attempts++
      if (typeof window !== 'undefined' && window.FedaPay) {
        clearInterval(interval)
        return resolve(window.FedaPay)
      }
      if (attempts >= maxAttempts) {
        clearInterval(interval)
        return reject(new Error('Impossible de joindre le service FedaPay. Vérifiez votre connexion internet ou vos bloqueurs de publicité.'))
      }
    }, 100)
  })
}

export default function CheckoutPage() {
  const { items, subtotal, deliveryFee, total, clearCart } = useCart()
  const { settings } = useCatalog()
  const [form, setForm] = useState(initial)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    loadFedaPaySDK().catch(() => {})
  }, [])

  if (!items.length) return <Navigate to="/panier" replace />

  const change = e => setForm({ ...form, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  const depositAmount = Math.ceil(total / 2)
  const remainingAmount = total - depositAmount

  const submit = async e => {
    e.preventDefault()
    const missing = ['name', 'phone', 'city', 'address', 'delivery'].some(k => !form[k]?.trim())
    if (missing || !form.terms) return toast.error('Veuillez compléter tous les champs obligatoires.')
    
    setSubmitting(true)
    try {
      if (form.paymentMethod === 'fedapay') {
        const key = import.meta.env.VITE_FEDAPAY_PUBLIC_KEY
        if (!key) throw new Error('La clé publique FedaPay n’est pas configurée dans les variables d’environnement.')
      }

      const order = await createOrder(form, items, form.paymentMethod)
      const secureTotal = order?.total ?? total
      const secureDeposit = order?.deposit_amount ?? Math.ceil(secureTotal / 2)
      const secureRemaining = secureTotal - secureDeposit

      if (form.paymentMethod === 'fedapay') {
        const key = import.meta.env.VITE_FEDAPAY_PUBLIC_KEY
        const FedaPay = await loadFedaPaySDK()

        const widget = FedaPay.init({
          public_key: key,
          environment: import.meta.env.VITE_FEDAPAY_ENVIRONMENT || 'sandbox',
          locale: 'fr',
          transaction: {
            amount: secureDeposit,
            description: `Acompte commande TK SHOP ${order?.order_number || ''}`.trim(),
            custom_metadata: {
              order_id: order?.id || ''
            }
          },
          customer: {
            email: form.email || undefined,
            firstname: form.name,
            phone_number: {
              number: form.phone
            }
          },
          onComplete: (reason) => {
            if (reason === FedaPay.CHECKOUT_COMPLETED || reason?.status === 'approved') {
              clearCart()
              sessionStorage.setItem('tk-shop-last-order', JSON.stringify({
                form,
                items,
                total: secureTotal,
                depositAmount: secureDeposit,
                remainingAmount: secureRemaining,
                order,
                paymentMethod: 'fedapay'
              }))
              navigate('/commande/confirmation')
            } else {
              toast.error('Paiement non finalisé. Vous pouvez réessayer ou opter pour WhatsApp.')
            }
          }
        })
        widget.open()
        return
      }

      window.open(whatsappUrl(createWhatsAppMessage(form, items, secureTotal, settings.shop_name), settings.whatsapp), '_blank', 'noopener,noreferrer')
      clearCart()
      sessionStorage.setItem('tk-shop-last-order', JSON.stringify({
        form,
        items,
        total: secureTotal,
        depositAmount: 0,
        remainingAmount: secureTotal,
        order,
        paymentMethod: 'whatsapp'
      }))
      navigate('/commande/confirmation')
    } catch (error) {
      toast.error(`La commande n’a pas pu être finalisée : ${error.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <SEO title="Finaliser ma commande | TK SHOP" />
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
        <p className="text-black/55 md:mt-3">Choisissez WhatsApp ou payez l’acompte de 50 % en ligne par Mobile Money / Carte.</p>
        <form onSubmit={submit} className="mt-8 grid gap-10 md:mt-10 lg:grid-cols-[1fr_380px]">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-semibold">Nom complet *
              <input required name="name" value={form.name} onChange={change} className="mt-2 w-full border border-black/20 px-4 py-3 outline-none focus:border-gold"/>
            </label>
            <label className="text-sm font-semibold">E-mail
              <input type="email" name="email" value={form.email} onChange={change} className="mt-2 w-full border border-black/20 px-4 py-3 outline-none focus:border-gold"/>
            </label>
            <label className="text-sm font-semibold">Téléphone *
              <PhoneInput required value={form.phone} onChange={value => setForm(current => ({ ...current, phone: value }))}/>
            </label>
            <label className="text-sm font-semibold">Ville *
              <input required name="city" value={form.city} onChange={change} className="mt-2 w-full border border-black/20 px-4 py-3 outline-none focus:border-gold"/>
            </label>
            <label className="text-sm font-semibold">Quartier ou adresse *
              <input required name="address" value={form.address} onChange={change} className="mt-2 w-full border border-black/20 px-4 py-3 outline-none focus:border-gold"/>
            </label>
            <fieldset className="grid gap-2 sm:col-span-2">
              <legend className="text-sm font-semibold">Mode de commande</legend>
              <label className={`flex cursor-pointer gap-3 rounded-xl border p-3 transition ${form.paymentMethod === 'whatsapp' ? 'border-gold bg-mist/60' : 'border-goldSoft/25'}`}>
                <input type="radio" name="paymentMethod" value="whatsapp" checked={form.paymentMethod === 'whatsapp'} onChange={change}/>
                <span>
                  <b>Commander par WhatsApp</b>
                  <small className="block text-xs font-normal text-black/55">Échange direct avec l’atelier pour finaliser et payer.</small>
                </span>
              </label>
              <label className={`flex cursor-pointer gap-3 rounded-xl border p-3 transition ${form.paymentMethod === 'fedapay' ? 'border-gold bg-mist/60' : 'border-goldSoft/25'}`}>
                <input type="radio" name="paymentMethod" value="fedapay" checked={form.paymentMethod === 'fedapay'} onChange={change}/>
                <span>
                  <b>Payer l’acompte en ligne (FedaPay)</b>
                  <small className="block text-xs font-normal text-black/55">Acompte de 50 % sécurisé par Mobile Money / Carte, solde à la livraison.</small>
                </span>
              </label>
            </fieldset>
            <label className="text-sm font-semibold sm:col-span-2">Mode de livraison *
              <select name="delivery" value={form.delivery} onChange={change} className="mt-2 w-full border border-black/20 bg-white px-4 py-3 outline-none">
                <option value="">Sélectionner</option>
                <option>Livraison à domicile</option>
                <option>Retrait à l’atelier</option>
                <option>Livraison internationale</option>
              </select>
            </label>
            <label className="text-sm font-semibold sm:col-span-2">Commentaire
              <textarea name="comment" value={form.comment} onChange={change} rows="5" className="mt-2 w-full resize-none border border-black/20 px-4 py-3 outline-none focus:border-gold"/>
            </label>
            <label className="flex items-start gap-3 text-sm sm:col-span-2">
              <input type="checkbox" name="terms" checked={form.terms} onChange={change} className="mt-1"/>
              <span>J’accepte les conditions générales et la transmission de ces informations.</span>
            </label>
          </div>

          <aside className="h-fit rounded-2xl bg-mist p-7">
            <h2 className="font-display text-2xl">Votre commande</h2>
            <div className="mt-6 divide-y">
              {items.map(item => (
                <div key={item.lineKey} className="flex gap-3 py-4">
                  <ProductMediaThumb product={item} alt={item.name} className="h-16 w-12 rounded-lg"/>
                  <div className="flex-1 text-sm">
                    <b>{item.name}</b>
                    <p className="text-xs text-black/50">Qté {item.quantity}{item.size ? ` · ${item.size}` : ''}</p>
                  </div>
                  <span className="text-sm font-medium">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-3 border-t pt-5 text-sm">
              <div className="flex justify-between">
                <span>Sous-total</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Livraison</span>
                <span>{formatCurrency(deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>

              {form.paymentMethod === 'fedapay' && (
                <div className="mt-2 rounded-xl bg-ivory p-3 text-xs leading-relaxed border border-goldSoft/30">
                  <div className="flex justify-between font-bold text-gold">
                    <span>Acompte à payer (50 %) :</span>
                    <span>{formatCurrency(depositAmount)}</span>
                  </div>
                  <div className="mt-1 flex justify-between text-black/60">
                    <span>Solde à la livraison :</span>
                    <span>{formatCurrency(remainingAmount)}</span>
                  </div>
                </div>
              )}
            </div>

            <Button type="submit" className="mt-7 w-full" disabled={submitting}>
              {submitting ? 'Traitement en cours…' : form.paymentMethod === 'fedapay' ? `Payer l’acompte (${formatCurrency(depositAmount)})` : 'Envoyer sur WhatsApp'}
            </Button>
          </aside>
        </form>
      </div>
    </>
  )
}
