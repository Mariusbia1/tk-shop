import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'react-hot-toast'
import { CartProvider } from './contexts/CartContext'
import { AdminAuthProvider } from './contexts/AdminAuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import ErrorBoundary from './components/common/ErrorBoundary'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><ErrorBoundary><ThemeProvider><HelmetProvider><BrowserRouter><AdminAuthProvider><CartProvider><App/><Toaster position="bottom-right" toastOptions={{style:{borderRadius:18,fontFamily:'Manrope'}}}/></CartProvider></AdminAuthProvider></BrowserRouter></HelmetProvider></ThemeProvider></ErrorBoundary></React.StrictMode>
)

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
  })
}
