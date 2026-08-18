#!/usr/bin/env node
import crypto from 'crypto'
import { fileURLToPath } from 'url'

function usage() {
  console.log('Usage: node scripts/send-fedapay-test.js <webhook_url> <webhook_secret> <order_id> <amount>')
  process.exit(1)
}

const [,, webhookUrl, webhookSecret, orderId, amountArg] = process.argv
if (!webhookUrl || !webhookSecret || !orderId || !amountArg) usage()
const amount = Number(amountArg)

const payload = { transaction: { custom_metadata: { order_id: orderId }, amount } }
const body = JSON.stringify(payload)
const signature = crypto.createHmac('sha256', webhookSecret).update(body).digest('hex')

async function send() {
  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-fedapay-signature': signature
      },
      body
    })
    const text = await res.text()
    console.log('Status:', res.status)
    console.log('Response:', text)
  } catch (err) {
    console.error('Request failed', err)
    process.exit(2)
  }
}

send()
