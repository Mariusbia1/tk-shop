import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import SEO from '../../components/common/SEO'
import Button from '../../components/common/Button'
import { useCart } from '../../contexts/CartContext'
import { formatCurrency } from '../../utils/formatCurrency'
import { createWhatsAppMessage, whatsappUrl } from '../../services/whatsappService'

const initial = { name: '', phone: '', city: '', address: '', delivery: '', comment: '', terms: false }
export default function CheckoutPage() {
  const { items, subtotal, deliveryFee, total } = useCart()
  const [form, setForm] = useState(initial)
  const navigate = useNavigate()
  if (!items.length) return <Navigate to="/panier" replace />
  const change = e => setForm({...form,[e.target.name]:e.target.type==='checkbox'?e.target.checked:e.target.value})
  const submit = e => {
    e.preventDefault()
    const missing = ['name','phone','city','address','delivery'].some(k=>!form[k].trim())
    if (missing || !form.terms) return toast.error('Veuillez compléter tous les champs obligatoires.')
    window.open(whatsappUrl(createWhatsAppMessage(form, items, total)), '_blank', 'noopener,noreferrer')
    sessionStorage.setItem('atelier-naya-last-order', JSON.stringify({ form, items, total }))
    navigate('/commande/confirmation')
  }
  return <><SEO title="Finaliser ma commande | Atelier Naya" /><div className="mx-auto max-w-6xl px-5 py-16"><h1 className="font-display text-5xl">Finaliser ma commande</h1><p className="mt-3 text-black/55">Vos informations serviront à préparer votre message de commande WhatsApp.</p><form onSubmit={submit} className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]"><div className="grid gap-5 sm:grid-cols-2">{[['name','Nom complet *'],['phone','Téléphone *'],['city','Ville *'],['address','Quartier ou adresse *']].map(([name,label])=><label key={name} className="text-sm font-semibold">{label}<input name={name} value={form[name]} onChange={change} className="mt-2 w-full border border-black/20 px-4 py-3 outline-none focus:border-gold"/></label>)}<label className="text-sm font-semibold sm:col-span-2">Mode de livraison *<select name="delivery" value={form.delivery} onChange={change} className="mt-2 w-full border border-black/20 bg-white px-4 py-3 outline-none"><option value="">Sélectionner</option><option>Livraison à domicile</option><option>Retrait à l’atelier</option><option>Livraison internationale</option></select></label><label className="text-sm font-semibold sm:col-span-2">Commentaire<textarea name="comment" value={form.comment} onChange={change} rows="5" className="mt-2 w-full resize-none border border-black/20 px-4 py-3 outline-none focus:border-gold"/></label><label className="flex items-start gap-3 text-sm sm:col-span-2"><input type="checkbox" name="terms" checked={form.terms} onChange={change} className="mt-1"/><span>J’accepte les conditions générales et la transmission de ces informations sur WhatsApp.</span></label></div>
    <aside className="h-fit bg-mist p-7"><h2 className="font-display text-2xl">Votre commande</h2><div className="mt-6 divide-y">{items.map(item=><div key={item.lineKey} className="flex gap-3 py-4"><img src={item.images[0]} alt="" className="h-16 w-12 object-cover"/><div className="flex-1 text-sm"><b>{item.name}</b><p className="text-xs text-black/50">Qté {item.quantity}{item.size?` · ${item.size}`:''}</p></div><span className="text-sm">{formatCurrency(item.price*item.quantity)}</span></div>)}</div><div className="mt-5 grid gap-3 border-t pt-5 text-sm"><div className="flex justify-between"><span>Sous-total</span><span>{formatCurrency(subtotal)}</span></div><div className="flex justify-between"><span>Livraison</span><span>{formatCurrency(deliveryFee)}</span></div><div className="flex justify-between text-lg font-bold"><span>Total</span><span>{formatCurrency(total)}</span></div></div><Button type="submit" className="mt-7 w-full">Envoyer sur WhatsApp</Button></aside></form></div></>
}
