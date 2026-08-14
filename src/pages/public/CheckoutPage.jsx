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
export default function CheckoutPage() {
  const { items, subtotal, deliveryFee, total } = useCart()
  const { settings } = useCatalog()
  const [form, setForm] = useState(initial)
  const [submitting, setSubmitting] = useState(false)
  const [fedapayReady, setFedapayReady] = useState(false)
  const navigate = useNavigate()
  useEffect(() => { if (form.paymentMethod !== 'fedapay' || document.querySelector('script[data-fedapay-checkout]')) return; const script=document.createElement('script'); script.src='https://cdn.fedapay.com/checkout.js?v=1.1.7'; script.async=true; script.dataset.fedapayCheckout='true'; script.onload=()=>setFedapayReady(true); document.head.appendChild(script) }, [form.paymentMethod])
  if (!items.length) return <Navigate to="/panier" replace />
  const change = e => setForm({...form,[e.target.name]:e.target.type==='checkbox'?e.target.checked:e.target.value})
  const submit = async e => {
    e.preventDefault()
    const missing = ['name','phone','city','address','delivery'].some(k=>!form[k].trim())
    if (missing || !form.terms) return toast.error('Veuillez compléter tous les champs obligatoires.')
    setSubmitting(true)
    try {
      const order = await createOrder(form, items, form.paymentMethod)
      const secureTotal = order?.total ?? total
      if (form.paymentMethod === 'fedapay') { const key=import.meta.env.VITE_FEDAPAY_PUBLIC_KEY; if (!key) throw new Error('La clé publique FedaPay n’est pas configurée.'); if (!window.FedaPay || !fedapayReady) throw new Error('FedaPay est encore en chargement. Réessayez.'); const deposit=order?.deposit_amount ?? Math.ceil(secureTotal/2); const widget=window.FedaPay.init({public_key:key,environment:import.meta.env.VITE_FEDAPAY_ENVIRONMENT || 'sandbox',locale:'fr',transaction:{amount:deposit,description:'Acompte commande TK SHOP',custom_metadata:{order_id:order?.id || ''}},customer:{email:form.email || undefined,firstname:form.name},onComplete:(reason)=>{if(reason===window.FedaPay.CHECKOUT_COMPLETED){sessionStorage.setItem('tk-shop-last-order',JSON.stringify({form,items,total:secureTotal,order}));navigate('/commande/confirmation')}}}); widget.open(); return }
      window.open(whatsappUrl(createWhatsAppMessage(form, items, secureTotal, settings.shop_name), settings.whatsapp), '_blank', 'noopener,noreferrer')
      sessionStorage.setItem('tk-shop-last-order', JSON.stringify({ form, items, total: secureTotal, order }))
      navigate('/commande/confirmation')
    } catch (error) {
      toast.error(`La commande n’a pas pu être enregistrée : ${error.message}`)
    } finally {
      setSubmitting(false)
    }
  }
  return <><SEO title="Finaliser ma commande | TK SHOP" /><div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-goldSoft/15 bg-ivory/95 px-4 backdrop-blur-xl md:hidden"><Link to="/panier" className="grid h-10 w-10 place-items-center rounded-full bg-mist" aria-label="Retour au panier"><ArrowLeft className="h-5 w-5"/></Link><div className="text-center"><h1 className="font-display text-xl">Validation du panier</h1><p className="text-[9px] uppercase tracking-wider text-gold">Dernière étape</p></div><div className="h-10 w-10"/></div><div className="mx-auto max-w-6xl px-5 pb-16 pt-7 md:py-16"><h1 className="hidden font-display text-5xl md:block">Finaliser ma commande</h1><p className="text-black/55 md:mt-3">Choisissez WhatsApp ou payez l’acompte de 50 % en ligne.</p><form onSubmit={submit} className="mt-8 grid gap-10 md:mt-10 lg:grid-cols-[1fr_380px]"><div className="grid gap-5 sm:grid-cols-2"><label className="text-sm font-semibold">Nom complet *<input required name="name" value={form.name} onChange={change} className="mt-2 w-full border border-black/20 px-4 py-3 outline-none focus:border-gold"/></label><label className="text-sm font-semibold">E-mail<input type="email" name="email" value={form.email} onChange={change} className="mt-2 w-full border border-black/20 px-4 py-3 outline-none focus:border-gold"/></label><label className="text-sm font-semibold">Téléphone *<PhoneInput required value={form.phone} onChange={value=>setForm(current=>({...current,phone:value}))}/></label><label className="text-sm font-semibold">Ville *<input required name="city" value={form.city} onChange={change} className="mt-2 w-full border border-black/20 px-4 py-3 outline-none focus:border-gold"/></label><label className="text-sm font-semibold">Quartier ou adresse *<input required name="address" value={form.address} onChange={change} className="mt-2 w-full border border-black/20 px-4 py-3 outline-none focus:border-gold"/></label><fieldset className="grid gap-2 sm:col-span-2"><legend className="text-sm font-semibold">Mode de commande</legend><label className="flex gap-3 rounded-xl border border-goldSoft/25 p-3"><input type="radio" name="paymentMethod" value="whatsapp" checked={form.paymentMethod==='whatsapp'} onChange={change}/><span><b>Commander par WhatsApp</b><small className="block text-xs font-normal text-black/55">Échange direct avec l’atelier.</small></span></label><label className="flex gap-3 rounded-xl border border-goldSoft/25 p-3"><input type="radio" name="paymentMethod" value="fedapay" checked={form.paymentMethod==='fedapay'} onChange={change}/><span><b>Payer en ligne</b><small className="block text-xs font-normal text-black/55">Acompte de 50 % maintenant, solde à la livraison.</small></span></label></fieldset><label className="text-sm font-semibold sm:col-span-2">Mode de livraison *<select name="delivery" value={form.delivery} onChange={change} className="mt-2 w-full border border-black/20 bg-white px-4 py-3 outline-none"><option value="">Sélectionner</option><option>Livraison à domicile</option><option>Retrait à l’atelier</option><option>Livraison internationale</option></select></label><label className="text-sm font-semibold sm:col-span-2">Commentaire<textarea name="comment" value={form.comment} onChange={change} rows="5" className="mt-2 w-full resize-none border border-black/20 px-4 py-3 outline-none focus:border-gold"/></label><label className="flex items-start gap-3 text-sm sm:col-span-2"><input type="checkbox" name="terms" checked={form.terms} onChange={change} className="mt-1"/><span>J’accepte les conditions générales et la transmission de ces informations sur WhatsApp.</span></label></div>
    <aside className="h-fit bg-mist p-7"><h2 className="font-display text-2xl">Votre commande</h2><div className="mt-6 divide-y">{items.map(item=><div key={item.lineKey} className="flex gap-3 py-4"><ProductMediaThumb product={item} alt={item.name} className="h-16 w-12 rounded-lg"/><div className="flex-1 text-sm"><b>{item.name}</b><p className="text-xs text-black/50">Qté {item.quantity}{item.size?` · ${item.size}`:''}</p></div><span className="text-sm">{formatCurrency(item.price*item.quantity)}</span></div>)}</div><div className="mt-5 grid gap-3 border-t pt-5 text-sm"><div className="flex justify-between"><span>Sous-total</span><span>{formatCurrency(subtotal)}</span></div><div className="flex justify-between"><span>Livraison</span><span>{formatCurrency(deliveryFee)}</span></div><div className="flex justify-between text-lg font-bold"><span>Total</span><span>{formatCurrency(total)}</span></div></div><Button type="submit" className="mt-7 w-full" disabled={submitting}>{submitting?'Enregistrement…':form.paymentMethod==='fedapay'?'Payer l’acompte':'Envoyer sur WhatsApp'}</Button></aside></form></div></>
}
