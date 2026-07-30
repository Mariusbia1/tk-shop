import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'react-hot-toast'
import { CartProvider } from './contexts/CartContext'
import { CatalogProvider } from './contexts/CatalogContext'
import { AdminAuthProvider } from './contexts/AdminAuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import ErrorBoundary from './components/common/ErrorBoundary'
import App from './App'
import './index.css'

const loadFonts = () => {
  if (document.getElementById('tk-google-fonts')) return
  const preconnect = document.createElement('link')
  preconnect.rel = 'preconnect'
  preconnect.href = 'https://fonts.gstatic.com'
  preconnect.crossOrigin = 'anonymous'
  document.head.appendChild(preconnect)
  const fonts = document.createElement('link')
  fonts.id = 'tk-google-fonts'
  fonts.rel = 'stylesheet'
  fonts.href = 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap'
  document.head.appendChild(fonts)
}

const manifest = document.getElementById('app-manifest')
if (manifest && window.location.pathname.startsWith('/admin')) {
  manifest.setAttribute('href', '/admin-manifest.webmanifest')
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><ErrorBoundary><ThemeProvider><HelmetProvider><BrowserRouter><AdminAuthProvider><CatalogProvider><CartProvider><App/><Toaster position="bottom-right" toastOptions={{style:{borderRadius:18,fontFamily:'Manrope'}}}/></CartProvider></CatalogProvider></AdminAuthProvider></BrowserRouter></HelmetProvider></ThemeProvider></ErrorBoundary></React.StrictMode>
)

if ('requestIdleCallback' in window) window.requestIdleCallback(loadFonts)
else window.setTimeout(loadFonts, 0)

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  navigator.serviceWorker.register('/sw.js').catch(error => {
    console.error('Service worker registration failed:', error)
  })
}
