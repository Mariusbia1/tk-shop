import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
export default function PublicLayout() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return <><Header /><main><Outlet /></main><Footer /></>
}
