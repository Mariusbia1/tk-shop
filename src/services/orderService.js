import { isSupabaseConfigured, supabase } from '../lib/supabase'

export async function createOrder(form, items, totals) {
  if (!isSupabaseConfigured) return null

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_name: form.name,
      phone: form.phone,
      city: form.city,
      address: form.address,
      delivery_method: form.delivery,
      customer_comment: form.comment || null,
      subtotal: totals.subtotal,
      delivery_fee: totals.deliveryFee,
      total: totals.total,
      whatsapp_sent: true,
    })
    .select('id, order_number')
    .single()

  if (orderError) throw orderError

  const orderItems = items.map((item) => ({
    order_id: order.id,
    product_id: Number.isInteger(Number(item.id)) ? Number(item.id) : null,
    product_name: item.name,
    product_slug: item.slug,
    image_url: item.images?.[0] || null,
    unit_price: item.price,
    quantity: item.quantity,
    size: item.size || null,
    color: item.color || null,
    measurements: item.measurements || null,
    note: item.note || null,
  }))

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
  if (itemsError) {
    await supabase.from('orders').delete().eq('id', order.id)
    throw itemsError
  }

  return order
}
