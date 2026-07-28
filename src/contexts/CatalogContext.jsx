import { createContext, useContext, useEffect, useState } from 'react'
import { products as fallbackProducts } from '../data/products'
import { categories as fallbackCategories } from '../data/categories'
import { gallery as fallbackGallery } from '../data/gallery'
import { testimonials as fallbackTestimonials } from '../data/testimonials'
import { siteConfig } from '../config/siteConfig'
import { isSupabaseConfigured } from '../lib/supabase'
import { getCategories, getGallery, getProducts, getSiteContent, getSiteSettings, getTestimonials } from '../services/catalogService'

const CatalogContext = createContext(null)

export function CatalogProvider({ children }) {
  const [products, setProducts] = useState(fallbackProducts)
  const [categories, setCategories] = useState(fallbackCategories)
  const [gallery, setGallery] = useState(fallbackGallery)
  const [testimonials, setTestimonials] = useState(fallbackTestimonials)
  const [settings, setSettings] = useState({
    shop_name: siteConfig.name, full_name: siteConfig.fullName, whatsapp: siteConfig.whatsapp,
    phone: siteConfig.phone, email: siteConfig.email, address: siteConfig.address,
    instagram: siteConfig.instagram, facebook: siteConfig.facebook, delivery_fee: siteConfig.deliveryFee,
  })
  const [content, setContent] = useState({})
  const [loading, setLoading] = useState(isSupabaseConfigured)

  const refresh = async () => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    const results = await Promise.allSettled([
      getProducts(),
      getCategories(),
      getGallery(),
      getTestimonials(),
      getSiteSettings(),
      getSiteContent(),
    ])

    const [productResult, categoryResult, galleryResult, testimonialResult, settingsResult, contentResult] = results
    if (productResult.status === 'fulfilled') setProducts(productResult.value)
    if (categoryResult.status === 'fulfilled') {
      setCategories(categoryResult.value.map((category) => ({
        ...category,
        image: category.image || fallbackCategories.find((fallback) => fallback.slug === category.slug)?.image,
      })))
    }
    if (galleryResult.status === 'fulfilled') setGallery(galleryResult.value)
    if (testimonialResult.status === 'fulfilled') {
      setTestimonials(testimonialResult.value.length ? testimonialResult.value : fallbackTestimonials)
    }
    if (settingsResult.status === 'fulfilled') setSettings(settingsResult.value)
    if (contentResult.status === 'fulfilled') setContent(contentResult.value)
    setLoading(false)
  }

  useEffect(() => {
    refresh()
    window.addEventListener('tk-catalog-changed', refresh)
    return () => window.removeEventListener('tk-catalog-changed', refresh)
  }, [])

  return (
    <CatalogContext.Provider value={{ products, categories, gallery, testimonials, settings, content, loading, refresh }}>
      {children}
    </CatalogContext.Provider>
  )
}

export const useCatalog = () => useContext(CatalogContext)
