import { supabase } from '../lib/supabase'

const notifyCatalogChanged = () => window.dispatchEvent(new Event('tk-catalog-changed'))
const normalizeColor = (value = '') => {
  const clean = value.trim().toLocaleLowerCase('fr-FR')
  return clean ? clean.charAt(0).toLocaleUpperCase('fr-FR') + clean.slice(1) : ''
}
const normalizeSize = (value = '') => value.trim().toLocaleUpperCase('fr-FR')
const mediaTypeForFile = (file) => file.type.startsWith('video/') ? 'video' : 'image'

const mapProduct = (product) => ({
  id: product.id,
  name: product.name,
  slug: product.slug,
  shortDescription: product.short_description,
  description: product.description,
  price: product.price,
  oldPrice: product.old_price,
  category: product.categories?.name || '',
  categorySlug: product.categories?.slug || '',
  categoryId: product.category_id,
  images: (product.product_images || [])
    .filter((media) => (media.media_type || 'image') === 'image')
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((image) => image.url),
  media: (product.product_images || [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((media) => ({ id: media.id, url: media.url, type: media.media_type || 'image', sortOrder: media.sort_order })),
  imageRecords: (product.product_images || [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((media) => ({ id: media.id, url: media.url, type: media.media_type || 'image', sortOrder: media.sort_order })),
  colors: (product.colors || []).map(normalizeColor).filter(Boolean),
  sizes: (product.sizes || []).map(normalizeSize).filter(Boolean),
  stockStatus: product.stock_status,
  featured: product.featured,
  newProduct: product.new_product,
  popular: product.popular,
  customizable: product.customizable,
  productionTime: product.production_time,
  materials: product.materials,
  careInstructions: product.care_instructions,
  deliveryInformation: product.delivery_information,
  isPublished: product.is_published,
})

export async function getProducts({ includeDrafts = false } = {}) {
  let query = supabase
    .from('products')
    .select('*, categories(name, slug), product_images(id, url, alt_text, media_type, sort_order)')
    .order('created_at', { ascending: false })

  if (!includeDrafts) query = query.eq('is_published', true)
  const { data, error } = await query
  if (error) throw error
  return data.map(mapProduct)
}

export async function getCategories({ includeInactive = false } = {}) {
  let query = supabase.from('categories').select('*').order('sort_order')
  if (!includeInactive) query = query.eq('is_active', true)
  const { data, error } = await query
  if (error) throw error
  return data.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    image: category.image_url,
    description: category.description,
    isActive: category.is_active,
  }))
}

export async function getGallery({ includeDrafts = false } = {}) {
  let query = supabase.from('gallery_items').select('*').order('sort_order')
  if (!includeDrafts) query = query.eq('is_published', true)
  const { data, error } = await query
  if (error) throw error
  return data.map((item) => ({
    id: item.id,
    image: item.image_url,
    mediaType: item.media_type || 'image',
    title: item.title,
    category: item.category,
    sortOrder: item.sort_order,
    isPublished: item.is_published,
  }))
}

export async function getTestimonials({ includeDrafts = false } = {}) {
  let query = supabase.from('testimonials').select('*').order('sort_order')
  if (!includeDrafts) query = query.eq('is_published', true)
  const { data, error } = await query
  if (error) throw error
  return data.map((item) => ({
    id: item.id,
    name: item.customer_name,
    city: item.city,
    text: item.content,
    sortOrder: item.sort_order,
    isPublished: item.is_published,
  }))
}

export async function getAdminOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function uploadCatalogImage(file, folder = 'products') {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime']
  if (!allowedTypes.includes(file.type)) throw new Error('Format non accepté. Utilisez JPG, PNG, WebP, MP4, WebM ou MOV.')
  if (file.size > 50 * 1024 * 1024) throw new Error('Le fichier dépasse la limite de 50 Mo.')
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `${folder}/${crypto.randomUUID()}.${extension}`
  const { error } = await supabase.storage.from('catalog').upload(path, file, { upsert: false })
  if (error) throw error
  return supabase.storage.from('catalog').getPublicUrl(path).data.publicUrl
}

export async function saveProduct(product, imageFiles = []) {
  const payload = {
    category_id: product.categoryId ? Number(product.categoryId) : null,
    name: product.name.trim(),
    slug: product.slug.trim(),
    short_description: product.shortDescription?.trim() || null,
    description: product.description?.trim() || null,
    price: Number(product.price),
    old_price: product.oldPrice ? Number(product.oldPrice) : null,
    colors: (product.colors || []).map(normalizeColor).filter(Boolean),
    sizes: (product.sizes || []).map(normalizeSize).filter(Boolean),
    stock_status: product.stockStatus || 'Sur commande',
    featured: Boolean(product.featured),
    new_product: Boolean(product.newProduct),
    popular: Boolean(product.popular),
    customizable: Boolean(product.customizable),
    production_time: product.productionTime?.trim() || null,
    materials: product.materials?.trim() || null,
    care_instructions: product.careInstructions?.trim() || null,
    delivery_information: product.deliveryInformation?.trim() || null,
    is_published: Boolean(product.isPublished),
  }

  const query = product.id
    ? supabase.from('products').update(payload).eq('id', product.id)
    : supabase.from('products').insert(payload)

  const { data: saved, error } = await query.select('id').single()
  if (error) throw error

  if (imageFiles.length) {
    const uploadedMedia = await Promise.all(imageFiles.map(async (file) => ({
      url: await uploadCatalogImage(file),
      type: mediaTypeForFile(file),
    })))
    const { data: existingImages } = await supabase
      .from('product_images')
      .select('sort_order')
      .eq('product_id', saved.id)
      .order('sort_order', { ascending: false })
      .limit(1)
    const startAt = (existingImages?.[0]?.sort_order ?? -1) + 1
    const { error: imageError } = await supabase.from('product_images').insert(
      uploadedMedia.map((media, index) => ({
        product_id: saved.id,
        url: media.url,
        media_type: media.type,
        alt_text: product.name,
        sort_order: startAt + index,
      }))
    )
    if (imageError) throw imageError
  }

  notifyCatalogChanged()
  return saved
}

export async function deleteProduct(id) {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
  notifyCatalogChanged()
}

export async function deleteCategory(id) {
  const { count, error: countError } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', id)
  if (countError) throw countError
  if (count > 0) throw new Error('Déplacez ou supprimez d’abord les produits de cette catégorie.')

  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw error
  notifyCatalogChanged()
}

export async function saveCategory(category) {
  const payload = {
    name: category.name.trim(),
    slug: category.slug.trim(),
    description: category.description?.trim() || null,
    image_url: category.image || null,
    is_active: category.isActive !== false,
  }
  const query = category.id
    ? supabase.from('categories').update(payload).eq('id', category.id)
    : supabase.from('categories').insert(payload)
  const { data, error } = await query.select().single()
  if (error) throw error
  notifyCatalogChanged()
  return data
}

export async function updateOrderStatus(id, status) {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function saveGalleryItem(item, imageFile) {
  const image = imageFile ? await uploadCatalogImage(imageFile, 'gallery') : item.image
  if (!image) throw new Error('Ajoutez une photo ou une vidéo à la réalisation.')
  const payload = {
    title: item.title.trim(),
    category: item.category?.trim() || null,
    image_url: image,
    media_type: imageFile ? mediaTypeForFile(imageFile) : (item.mediaType || 'image'),
    sort_order: Number(item.sortOrder) || 0,
    is_published: item.isPublished !== false,
  }
  const query = item.id
    ? supabase.from('gallery_items').update(payload).eq('id', item.id)
    : supabase.from('gallery_items').insert(payload)
  const { data, error } = await query.select().single()
  if (error) throw error
  notifyCatalogChanged()
  return data
}

export async function deleteGalleryItem(id) {
  const { error } = await supabase.from('gallery_items').delete().eq('id', id)
  if (error) throw error
  notifyCatalogChanged()
}

export async function saveTestimonial(item) {
  const payload = {
    customer_name: item.name.trim(),
    city: item.city?.trim() || null,
    content: item.text.trim(),
    sort_order: Number(item.sortOrder) || 0,
    is_published: item.isPublished !== false,
  }
  const query = item.id
    ? supabase.from('testimonials').update(payload).eq('id', item.id)
    : supabase.from('testimonials').insert(payload)
  const { data, error } = await query.select().single()
  if (error) throw error
  notifyCatalogChanged()
  return data
}

export async function deleteTestimonial(id) {
  const { error } = await supabase.from('testimonials').delete().eq('id', id)
  if (error) throw error
  notifyCatalogChanged()
}

export async function getSiteSettings() {
  const { data, error } = await supabase.from('site_settings').select('*').eq('id', true).single()
  if (error) throw error
  return data
}

export async function saveSiteSettings(settings) {
  const payload = {
    id: true,
    shop_name: settings.shop_name.trim(),
    full_name: settings.full_name.trim(),
    whatsapp: settings.whatsapp?.trim() || null,
    phone: settings.phone?.trim() || null,
    email: settings.email?.trim() || null,
    address: settings.address?.trim() || null,
    instagram: settings.instagram?.trim() || null,
    facebook: settings.facebook?.trim() || null,
    delivery_fee: Number(settings.delivery_fee) || 0,
  }
  const { data, error } = await supabase.from('site_settings').upsert(payload).select().single()
  if (error) throw error
  notifyCatalogChanged()
  return data
}

export async function getSiteContent() {
  const { data, error } = await supabase.from('site_content').select('*').order('key')
  if (error) throw error
  return Object.fromEntries(data.map((item) => [item.key, item.value]))
}

export async function saveSiteContent(key, value) {
  const { data, error } = await supabase
    .from('site_content')
    .upsert({ key, value })
    .select()
    .single()
  if (error) throw error
  notifyCatalogChanged()
  return data
}

export async function getAdminProfile() {
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError
  const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (error) throw error
  return { ...data, email: user.email }
}

export async function saveAdminProfile(fullName) {
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError
  const { data, error } = await supabase
    .from('profiles')
    .update({ full_name: fullName.trim() })
    .eq('id', user.id)
    .select()
    .single()
  if (error) throw error
  return { ...data, email: user.email }
}

export async function updateAdminPassword(password) {
  const { error } = await supabase.auth.updateUser({ password })
  if (error) throw error
}

export async function getDashboardData() {
  const [productsResult, categoriesResult, ordersResult] = await Promise.all([
    getProducts({ includeDrafts: true }),
    getCategories(),
    getAdminOrders(),
  ])
  const activeOrders = ordersResult.filter((order) => !['delivered', 'cancelled'].includes(order.status))
  return {
    products: productsResult,
    categories: categoriesResult,
    orders: ordersResult,
    stats: {
      products: productsResult.length,
      orders: ordersResult.length,
      pending: activeOrders.length,
      revenue: ordersResult
        .filter((order) => order.status !== 'cancelled')
        .reduce((total, order) => total + Number(order.total || 0), 0),
    },
  }
}

export async function deleteProductImage(id) {
  const { error } = await supabase.from('product_images').delete().eq('id', id)
  if (error) throw error
  notifyCatalogChanged()
}

export async function reorderProductImages(records) {
  const results = await Promise.all(
    records.map((record, index) =>
      supabase.from('product_images').update({ sort_order: index }).eq('id', record.id)
    )
  )
  const failed = results.find((result) => result.error)
  if (failed) throw failed.error
  notifyCatalogChanged()
}

export async function recordPageVisit(path) {
  const storageKey = 'tk-visitor-session'
  let sessionId = sessionStorage.getItem(storageKey)
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    sessionStorage.setItem(storageKey, sessionId)
  }
  const { error } = await supabase.rpc('record_page_visit', {
    p_path: path,
    p_session_id: sessionId,
    p_referrer: document.referrer || null,
  })
  if (error && error.code !== '42P01') throw error
}

export async function getTrafficStats(days = 30) {
  let query = supabase
    .from('page_visits')
    .select('path, session_id, visited_at')
    .order('visited_at')
  if (days) {
    const since = new Date()
    since.setDate(since.getDate() - days)
    query = query.gte('visited_at', since.toISOString())
  }
  const { data, error } = await query
  if (error) {
    if (error.code === '42P01') return { total: 0, visitors: 0, today: 0, daily: [], topPages: [] }
    throw error
  }
  const today = new Date().toISOString().slice(0, 10)
  const dailyMap = new Map()
  const pageMap = new Map()
  data.forEach((visit) => {
    const day = visit.visited_at.slice(0, 10)
    dailyMap.set(day, (dailyMap.get(day) || 0) + 1)
    pageMap.set(visit.path, (pageMap.get(visit.path) || 0) + 1)
  })
  return {
    total: data.length,
    visitors: new Set(data.map((visit) => visit.session_id)).size,
    today: data.filter((visit) => visit.visited_at.startsWith(today)).length,
    daily: [...dailyMap].map(([date, count]) => ({ date, count })),
    topPages: [...pageMap].map(([path, count]) => ({ path, count })).sort((a, b) => b.count - a.count).slice(0, 5),
  }
}

export async function getAuditLogs() {
  const { data, error } = await supabase
    .from('admin_audit_logs')
    .select('*')
    .order('occurred_at', { ascending: false })
    .limit(200)
  if (error) {
    if (error.code === '42P01') return []
    throw error
  }
  return data
}
