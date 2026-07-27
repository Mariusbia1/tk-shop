import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { siteConfig } from '../config/siteConfig'

const CartContext = createContext(null)
const keyFor = (product, options) => [product.id, options.size, options.color, options.measurements, options.note].join('|')

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('atelier-naya-cart')) || [] } catch { return [] }
  })

  useEffect(() => localStorage.setItem('atelier-naya-cart', JSON.stringify(items)), [items])

  const addItem = (product, options = {}) => {
    const lineKey = keyFor(product, options)
    setItems((current) => {
      const exists = current.find((item) => item.lineKey === lineKey)
      if (exists) return current.map((item) => item.lineKey === lineKey ? { ...item, quantity: item.quantity + (options.quantity || 1) } : item)
      return [...current, { ...product, ...options, lineKey, quantity: options.quantity || 1 }]
    })
    toast.success(`${product.name} a été ajouté au panier.`)
  }
  const updateQuantity = (lineKey, quantity) => setItems((current) => current.map((item) => item.lineKey === lineKey ? { ...item, quantity: Math.max(1, quantity) } : item))
  const removeItem = (lineKey) => setItems((current) => current.filter((item) => item.lineKey !== lineKey))
  const clearCart = () => setItems([])
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const deliveryFee = items.length ? siteConfig.deliveryFee : 0
  const total = subtotal + deliveryFee
  const value = useMemo(() => ({ items, addItem, updateQuantity, removeItem, clearCart, itemCount, subtotal, deliveryFee, total }), [items, itemCount, subtotal, deliveryFee, total])
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => useContext(CartContext)
