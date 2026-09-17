import { Helmet } from 'react-helmet-async'
import { siteConfig } from '../../config/siteConfig'

export default function SEO({
  title,
  description = siteConfig.description,
  keywords,
  image,
  url,
  path = '',
  type = 'website',
  noindex = false,
  schema,
  product,
  breadcrumbs,
  faq,
}) {
  const siteUrl = siteConfig.siteUrl?.replace(/\/+$/, '') || 'https://tkshop-crochet.com'
  const canonicalUrl = url || (path ? `${siteUrl}${path.startsWith('/') ? path : `/${path}`}` : siteUrl)
  
  const defaultImage = `${siteUrl}/assets/hero-crochet-gold.jpg`
  const ogImage = image ? (image.startsWith('http') ? image : `${siteUrl}${image.startsWith('/') ? image : `/${image}`}`) : defaultImage

  const mergedKeywords = Array.isArray(keywords)
    ? [...keywords, ...siteConfig.keywords].filter((v, i, a) => a.indexOf(v) === i).join(', ')
    : typeof keywords === 'string'
      ? `${keywords}, ${siteConfig.keywords.join(', ')}`
      : siteConfig.keywords.join(', ')

  const pageTitle = title ? (title.includes('TK SHOP') ? title : `${title} | TK SHOP`) : `${siteConfig.name} | Créations crochetées à la main`

  // Build JSON-LD Structured Data
  const jsonLdList = []

  // Custom schemas provided
  if (schema) {
    if (Array.isArray(schema)) {
      jsonLdList.push(...schema)
    } else {
      jsonLdList.push(schema)
    }
  }

  // Product schema
  if (product) {
    const productUrl = `${siteUrl}/collections/${product.slug}`
    const productImages = (product.images || []).map(img => 
      img.startsWith('http') ? img : `${siteUrl}${img.startsWith('/') ? img : `/${img}`}`
    )
    if (productImages.length === 0 && ogImage) productImages.push(ogImage)

    const productSchema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description || product.shortDescription || siteConfig.description,
      image: productImages,
      sku: `TK-${product.id || product.slug}`,
      brand: {
        '@type': 'Brand',
        name: siteConfig.name,
      },
      offers: {
        '@type': 'Offer',
        url: productUrl,
        priceCurrency: siteConfig.currency || 'XOF',
        price: product.price,
        itemCondition: 'https://schema.org/NewCondition',
        availability: product.stockStatus === 'Indisponible' 
          ? 'https://schema.org/OutOfStock' 
          : product.stockStatus === 'Sur commande'
            ? 'https://schema.org/PreOrder'
            : 'https://schema.org/InStock',
        seller: {
          '@type': 'Organization',
          name: siteConfig.name,
        },
      },
    }
    jsonLdList.push(productSchema)
  }

  // Breadcrumbs schema
  if (breadcrumbs && breadcrumbs.length > 0) {
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: crumb.url?.startsWith('http') ? crumb.url : `${siteUrl}${crumb.url?.startsWith('/') ? crumb.url : `/${crumb.url || ''}`}`,
      })),
    }
    jsonLdList.push(breadcrumbSchema)
  }

  // FAQ schema
  if (faq && faq.length > 0) {
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq.map(item => ({
        '@type': 'Question',
        name: item.q || item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.a || item.answer,
        },
      })),
    }
    jsonLdList.push(faqSchema)
  }

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="title" content={pageTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={mergedKeywords} />
      <meta name="author" content={siteConfig.author} />
      
      {/* Robots Directive */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}

      {/* Canonical */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook / TikTok / WhatsApp */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteConfig.name} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content="fr_FR" />

      {/* Twitter / X */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Product Specific OpenGraph */}
      {product && (
        <>
          <meta property="product:price:amount" content={String(product.price)} />
          <meta property="product:price:currency" content={siteConfig.currency || 'XOF'} />
          <meta property="product:availability" content={product.stockStatus === 'Indisponible' ? 'out of stock' : 'in stock'} />
          <meta property="product:condition" content="new" />
          <meta property="product:brand" content={siteConfig.name} />
        </>
      )}

      {/* JSON-LD Structured Data */}
      {jsonLdList.map((data, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}
    </Helmet>
  )
}

