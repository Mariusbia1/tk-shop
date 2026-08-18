import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

// Vercel serverless endpoint to handle FedaPay webhooks.
// Required env vars:
// - SUPABASE_URL
// - SUPABASE_SERVICE_ROLE_KEY (server-side service role)
// - FEDAPAY_WEBHOOK_SECRET

const getRawBody = (req) => new Promise((resolve, reject) => {
  const chunks = []
  req.on('data', (c) => chunks.push(c))
  req.on('end', () => resolve(Buffer.concat(chunks)))
  req.on('error', reject)
})

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed')

  const SUPABASE_URL = process.env.SUPABASE_URL
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
  const FEDAPAY_WEBHOOK_SECRET = process.env.FEDAPAY_WEBHOOK_SECRET

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !FEDAPAY_WEBHOOK_SECRET) {
    console.error('Missing required environment variables for webhook')
    return res.status(500).json({ error: 'Server not configured' })
  }

  let raw
  try {
    raw = await getRawBody(req)
  } catch (err) {
    console.error('Failed to read raw body', err)
    return res.status(400).end()
  }

  const signatureHeader = (req.headers['x-fedapay-signature'] || req.headers['x-signature'] || '').toString()
  const expected = crypto.createHmac('sha256', FEDAPAY_WEBHOOK_SECRET).update(raw).digest('hex')
  
  const isValidSignature = signatureHeader && (
    signatureHeader === expected ||
    (signatureHeader.length === expected.length && crypto.timingSafeEqual(Buffer.from(signatureHeader), Buffer.from(expected)))
  )

  if (!isValidSignature) {
    console.error('Invalid webhook signature', { got: signatureHeader, expected })
    return res.status(401).json({ error: 'Invalid signature' })
  }

  let payload
  try {
    payload = JSON.parse(raw.toString())
  } catch (err) {
    console.error('Invalid JSON payload', err)
    return res.status(400).end()
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  // Flexible extraction of transaction and metadata (FedaPay payloads may vary)
  const eventName = payload.name || payload.event || ''
  const txn = payload.transaction || payload.data?.transaction || payload.data || payload
  const txId = txn?.id || txn?.transaction_id || txn?.reference || payload?.id || null
  const amount = Number(txn?.amount || payload?.amount || 0)
  const orderId = txn?.custom_metadata?.order_id || txn?.customMetadata?.order_id || payload?.custom_metadata?.order_id || payload?.metadata?.order_id || null
  const txnStatus = String(txn?.status || payload?.status || '').toLowerCase()

  if (!orderId) {
    console.error('Webhook missing order_id', payload)
    return res.status(400).json({ error: 'Missing order_id' })
  }

  try {
    const { data: order, error: orderErr } = await supabase.from('orders').select('*').eq('id', orderId).single()
    if (orderErr || !order) {
      console.error('Failed to load order', orderErr)
      return res.status(404).json({ error: 'Order lookup failed' })
    }

    let newPaymentStatus = order.payment_status || 'pending'
    let newOrderStatus = order.status

    if (txnStatus === 'approved' || eventName === 'transaction.approved' || (!txnStatus && amount > 0)) {
      if (amount >= (order.total || 0)) {
        newPaymentStatus = 'paid'
        newOrderStatus = 'confirmed'
      } else if (amount >= (order.deposit_amount || 0) && (order.deposit_amount || 0) > 0) {
        newPaymentStatus = 'partially_paid'
        newOrderStatus = 'confirmed'
      } else {
        newPaymentStatus = 'partially_paid'
        newOrderStatus = 'confirmed'
      }
    } else if (txnStatus === 'declined' || txnStatus === 'canceled' || eventName === 'transaction.canceled') {
      newPaymentStatus = 'failed'
    }

    const updates = {
      payment_status: newPaymentStatus,
      payment_transaction_id: txId ? String(txId) : order.payment_transaction_id,
      status: newOrderStatus,
      updated_at: new Date().toISOString(),
    }

    const { error: updErr } = await supabase.from('orders').update(updates).eq('id', orderId)
    if (updErr) {
      console.error('Failed to update order payment fields', updErr)
      return res.status(500).json({ error: 'Failed to update order' })
    }

    return res.status(200).json({ success: true, order_id: orderId, payment_status: newPaymentStatus, order_status: newOrderStatus })
  } catch (err) {
    console.error('Unexpected error handling webhook', err)
    return res.status(500).json({ error: 'Internal error' })
  }
}
