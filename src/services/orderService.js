import { isSupabaseConfigured, supabase } from '../lib/supabase'

export async function createOrder(form, items, paymentMethod = 'whatsapp') {
  if (!isSupabaseConfigured) return null

  const { data, error } = await supabase.rpc('create_order_with_payment', {
    payload: {
      customer: {
        name: form.name,
        phone: form.phone,
        city: form.city,
        address: form.address,
        delivery: form.delivery,
        comment: form.comment || '',
        payment_method: paymentMethod,
      },
      items: items.map((item) => ({
        product_id: Number(item.id),
        quantity: item.quantity,
        size: item.size || '',
        color: item.color || '',
        measurements: item.measurements || '',
        note: item.note || '',
      })),
    },
  })
  if (error) throw error
  return data
}
