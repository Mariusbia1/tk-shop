import { isSupabaseConfigured, supabase } from '../lib/supabase'

export async function createOrder(form, items, paymentMethod = 'whatsapp', paymentType = 'deposit') {
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
        payment_type: paymentType,
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

export async function confirmOnlinePayment(orderId, { transactionId, isFullPayment, amountPaid }) {
  if (!isSupabaseConfigured || !orderId) return null
  const paymentStatus = isFullPayment ? 'paid' : 'partially_paid'
  const payload = {
    payment_status: paymentStatus,
    payment_transaction_id: transactionId ? String(transactionId) : null,
    status: 'confirmed',
    updated_at: new Date().toISOString(),
  }
  if (isFullPayment) {
    payload.completed_at = new Date().toISOString()
    payload.remaining_amount = 0
  }
  if (amountPaid !== undefined) {
    payload.deposit_amount = amountPaid
  }
  const { data, error } = await supabase
    .from('orders')
    .update(payload)
    .eq('id', orderId)
    .select()
    .single()
  if (error) {
    console.warn('Could not immediately update order payment client-side:', error)
  }
  return data
}
