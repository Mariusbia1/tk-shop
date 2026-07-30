const videoPattern = /\.(mp4|webm|mov|m4v)(?:$|[?#])/i

export function getPrimaryMedia(product = {}) {
  const declared = product.media?.[0]
  if (declared?.url) return declared
  const url = product.images?.[0] || product.image
  if (!url) return null
  return { url, type: videoPattern.test(url) ? 'video' : 'image' }
}

export default function ProductMediaThumb({ product, alt = '', className = '' }) {
  const media = getPrimaryMedia(product)
  if (!media) return <div className={`grid place-items-center bg-mist text-[9px] text-black/40 ${className}`}>Aucun média</div>
  if (media.type === 'video') {
    return <video src={media.url} muted autoPlay loop playsInline preload="metadata" aria-label={alt} className={`bg-black object-cover ${className}`} />
  }
  return <img src={media.url} alt={alt} loading="lazy" className={`object-cover ${className}`} />
}
