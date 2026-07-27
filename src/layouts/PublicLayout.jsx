import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
export default function PublicLayout() {
  const { pathname } = useLocation()
  const isMobileOrderFlow = ['/panier', '/commande', '/commande/confirmation'].includes(pathname)
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return <>
    <div className={isMobileOrderFlow ? 'hidden md:block' : ''}><Header /></div>
    <main><Outlet /></main>
    <div className={isMobileOrderFlow ? 'hidden md:block' : ''}><Footer /></div>
  </>
}
