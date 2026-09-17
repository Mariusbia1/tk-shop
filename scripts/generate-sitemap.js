import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SITE_URL = process.env.VITE_SITE_URL || 'https://tkshop-crochet.com'
const currentDate = new Date().toISOString().split('T')[0]

// Static public pages
const staticPages = [
  { path: '', priority: '1.0', changefreq: 'daily' },
  { path: '/collections', priority: '0.9', changefreq: 'daily' },
  { path: '/galerie', priority: '0.8', changefreq: 'weekly' },
  { path: '/a-propos', priority: '0.7', changefreq: 'monthly' },
  { path: '/contact', priority: '0.7', changefreq: 'monthly' },
  { path: '/faq', priority: '0.6', changefreq: 'monthly' },
  { path: '/conditions-generales', priority: '0.3', changefreq: 'yearly' },
  { path: '/politique-de-confidentialite', priority: '0.3', changefreq: 'yearly' },
  { path: '/mentions-legales', priority: '0.3', changefreq: 'yearly' },
  { path: '/livraison-et-retours', priority: '0.4', changefreq: 'monthly' },
]

// Category pages
const categories = [
  'robes',
  'ensembles',
  'tops',
  'jupes',
  'accessoires',
  'sur-mesure',
]

// Product slugs
const productSlugs = [
  'robe-tk-crochet',
  'ensemble-sanaa-crochet',
  'sac-rosalie',
  'jupe-zuri',
  'sac-dalia',
  'robe-imara',
  'ensemble-kemi',
  'top-malaika',
  'jupe-amari',
  'pochette-nola',
  'robe-safiya',
  'ceinture-ayo',
  'robe-flora-crochet',
  'ensemble-dahlia-crochet',
  'mini-sac-petale',
]

function generateSitemap() {
  const urls = []

  // Add static pages
  for (const page of staticPages) {
    urls.push(`  <url>
    <loc>${SITE_URL}${page.path}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`)
  }

  // Add category pages
  for (const slug of categories) {
    urls.push(`  <url>
    <loc>${SITE_URL}/categories/${slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`)
  }

  // Add product pages
  for (const slug of productSlugs) {
    urls.push(`  <url>
    <loc>${SITE_URL}/collections/${slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`)
  }

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls.join('\n')}
</urlset>
`

  const outputPath = path.resolve(__dirname, '../public/sitemap.xml')
  fs.writeFileSync(outputPath, sitemapXml.trim(), 'utf8')
  console.log(`✅ Sitemap successfully generated at: ${outputPath} (${urls.length} URLs)`)
}

generateSitemap()
