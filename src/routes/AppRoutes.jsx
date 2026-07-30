import { lazy, Suspense } from 'react'
import LoadingScreen from '../components/common/LoadingScreen'
import { Routes, Route, useParams, Navigate } from 'react-router-dom'
import PublicLayout from '../layouts/PublicLayout'
import AdminLayout from '../layouts/AdminLayout'
import HomePage from '../pages/public/HomePage'
import ShopPage from '../pages/public/ShopPage'
import ProductPage from '../pages/public/ProductPage'
import CartPage from '../pages/public/CartPage'
import CheckoutPage from '../pages/public/CheckoutPage'
import { AboutPage, GalleryPage, ContactPage, FaqPage, ConfirmationPage, LegalPage } from '../pages/public/ContentPages'
import { LoginPage, ForgotPasswordPage, ResetPasswordPage, ProtectedAdminRoute, DashboardPage, ProductsAdmin, ProductFormPage, CategoriesAdmin, OrdersAdmin, OrderDetail, SimpleAdminPage, AuditLogPage } from '../pages/admin/AdminPages'
import Button from '../components/common/Button'

const Category = () => { const { slug } = useParams(); return <ShopPage categorySlug={slug}/> }
const LegacyProduct = () => { const { slug } = useParams(); return <Navigate to={`/collections/${slug}`} replace/> }
const NotFound = () => <div className="grid min-h-[60vh] place-items-center px-5 text-center"><div><p className="font-display text-8xl text-linen">404</p><h1 className="font-display text-4xl">Cette page n’existe pas</h1><Button to="/" className="mt-7">Retour à l’accueil</Button></div></div>

export default function AppRoutes(){
  return <Suspense fallback={<LoadingScreen label="Ouverture de la page"/>}><Routes>
    <Route element={<PublicLayout/>}>
      <Route path="/" element={<HomePage/>}/>
      <Route path="/boutique" element={<Navigate to="/collections" replace/>}/>
      <Route path="/boutique/:slug" element={<LegacyProduct/>}/>
      <Route path="/categories/:slug" element={<Category/>}/>
      <Route path="/collections" element={<ShopPage/>}/>
      <Route path="/collections/:slug" element={<ProductPage/>}/>
      <Route path="/galerie" element={<GalleryPage/>}/>
      <Route path="/a-propos" element={<AboutPage/>}/>
      <Route path="/contact" element={<ContactPage/>}/>
      <Route path="/panier" element={<CartPage/>}/>
      <Route path="/commande" element={<CheckoutPage/>}/>
      <Route path="/commande/confirmation" element={<ConfirmationPage/>}/>
      <Route path="/faq" element={<FaqPage/>}/>
      <Route path="/politique-de-confidentialite" element={<LegalPage title="Politique de confidentialité"/>}/>
      <Route path="/conditions-generales" element={<LegalPage title="Conditions générales"/>}/>
      <Route path="/mentions-legales" element={<LegalPage title="Mentions légales"/>}/>
      <Route path="/livraison-et-retours" element={<LegalPage title="Livraison et retours"/>}/>
      <Route path="*" element={<NotFound/>}/>
    </Route>
    <Route path="/admin/connexion" element={<LoginPage/>}/>
    <Route path="/admin/mot-de-passe-oublie" element={<ForgotPasswordPage/>}/>
    <Route path="/admin/reinitialiser" element={<ResetPasswordPage/>}/>
    <Route path="/admin" element={<ProtectedAdminRoute><AdminLayout/></ProtectedAdminRoute>}>
      <Route index element={<DashboardPage/>}/>
      <Route path="produits" element={<ProductsAdmin/>}/>
      <Route path="produits/nouveau" element={<ProductFormPage/>}/>
      <Route path="produits/:id/modifier" element={<ProductFormPage/>}/>
      <Route path="categories" element={<CategoriesAdmin/>}/>
      <Route path="commandes" element={<OrdersAdmin/>}/>
      <Route path="commandes/:id" element={<OrderDetail/>}/>
      <Route path="galerie" element={<SimpleAdminPage title="Galerie" type="gallery"/>}/>
      <Route path="temoignages" element={<SimpleAdminPage title="Témoignages" type="testimonials"/>}/>
      <Route path="contenus" element={<SimpleAdminPage title="Contenus"/>}/>
      <Route path="parametres" element={<SimpleAdminPage title="Paramètres"/>}/>
      <Route path="activite" element={<AuditLogPage/>}/>
      <Route path="profil" element={<SimpleAdminPage title="Profil"/>}/>
    </Route>
  </Routes></Suspense>
}
