import { Helmet } from 'react-helmet-async'
import { siteConfig } from '../../config/siteConfig'
export default function SEO({ title, description = siteConfig.description }) {
  return <Helmet><title>{title}</title><meta name="description" content={description} /></Helmet>
}
