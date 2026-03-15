import { Routes, Route, Navigate } from 'react-router-dom'
import ScrollToTop from './components/ScrollTop'
import Home from './pages/Home'
import AdminUsers from './pages/users/AdminUsers'
import EditMyProfile from './pages/myProfile/EditMyProfile'
import AdminProductsList from './pages/products/AdminProductsList'
import AdminCategoriesList from './pages/categories/AdminCategoriesList'
import CreateProduct from './pages/products/CreateProduct'
import CreateCategory from './pages/categories/CreateCategory'
import EditProduct from './pages/products/EditProduct'
import EditCategory from './pages/categories/EditCategory'
import AdminPacksList from './pages/packs/AdminPacksList'
import AdminShowPack from './pages/packs/AdminShowPack'
import CreatePack from './pages/packs/CreatePack'
import EditPack from './pages/packs/EditPack'
import AdminFeaturesList from './pages/features/AdminFeaturesList'
import CreateFeature from './pages/features/CreateFeature'
import EditFeature from './pages/features/EditFeature'
import AdminFeatureTypesList from './pages/featureTypes/AdminFeatureTypesList'
import CreateFeatureType from './pages/featureTypes/CreateFeatureType'
import EditFeatureType from './pages/featureTypes/EditFeatureType'
import Login from './pages/auth/SignIn'
import Register from './pages/auth/Register'
import ResetPassword from './pages/auth/ResetPassword'
import ForgotPassword from './pages/auth/ForgotPassword'
import VerifyEmail from './pages/auth/VerifyEmail'
import ResendVerification from './pages/auth/ResendVerification'
import Error404 from './pages/errors/error404'
import Error403 from './pages/errors/error403'
import Error419 from './pages/errors/error419'
import Error500 from './pages/errors/error500'
import Error503 from './pages/errors/error503'
import { useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'
import './App.css'
import AdminShowProduct from './pages/products/AdminShowProduct'
import AdminDashboard from './pages/admin/AdminDashboard'

function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregant...</div>
  }
  
  if (!user) {
    return <Navigate to="/login" />
  }
  
  // Verificar rol si se requiere uno específico
  if (requiredRole) {
    const isAdmin = user.role === 'admin' || user.role === 1
    if (requiredRole === 'admin' && !isAdmin) {
      return <Navigate to="/error403" />
    }
  }
  
  return children
}

function App() {
  return (
    /* /////////////////////////////// */
    /* DECLARACION DE ROUTES de la APP */
    /* /////////////////////////////// */
    <>
    <ScrollToTop /> {/* Scroll to Top en todas las páginas */}

    <Routes>
      {/* RUTES PÚBLIQUES - Tienda */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/resend-verification" element={<ResendVerification />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Rutas con Layout (Topbar + Sidebar) */}
      <Route element={<Layout />}>
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <div className="p-4"><h1 className="text-2xl font-bold">Dashboard</h1><p>Properament...</p></div>
          </ProtectedRoute>
        } />
        
        <Route path="/services" element={<div className="p-4"><h1 className="text-2xl font-bold">Serveis</h1><p>Properament...</p></div>} />
        <Route path="/products" element={<div className="p-4"><h1 className="text-2xl font-bold">Productes</h1><p>Properament...</p></div>} />
        <Route path="/categories" element={<div className="p-4"><h1 className="text-2xl font-bold">Categories</h1><p>Properament...</p></div>} />
        <Route path="/orders" element={<div className="p-4"><h1 className="text-2xl font-bold">Comandes</h1><p>Properament...</p></div>} />
        <Route path="/reports" element={<div className="p-4"><h1 className="text-2xl font-bold">Informes</h1><p>Properament...</p></div>} />
        <Route path="/settings" element={<div className="p-4"><h1 className="text-2xl font-bold">Configuració</h1><p>Properament...</p></div>} />

        {/* Rutes d'usuari normal */}
        <Route path="/my-orders" element={<div className="p-4"><h1 className="text-2xl font-bold">Les Meves Comandes</h1><p>Properament...</p></div>} />
        <Route path="/my-services" element={<div className="p-4"><h1 className="text-2xl font-bold">Els Meus Serveis</h1><p>Properament...</p></div>} />

        {/* Rutas de Admin - Protegidas por rol */}
        <Route path="/users" element={
          <ProtectedRoute requiredRole="admin">
            <AdminUsers />
          </ProtectedRoute>
        } />

        <Route path="/perfil" element={
          <ProtectedRoute>
            <EditMyProfile />
          </ProtectedRoute>
        } />

        <Route path='/admin/products' element={
          <ProtectedRoute requiredRole='admin'>
            <AdminProductsList />
          </ProtectedRoute>
        } />

        <Route path='/admin/products/:id/show' element={
          <ProtectedRoute requiredRole='admin'>
            <AdminShowProduct />
          </ProtectedRoute>
        } />
        <Route path='/admin/products/new' element={
          <ProtectedRoute requiredRole='admin'>
            <CreateProduct />
          </ProtectedRoute>
        } />
        <Route path='/admin/products/:id/edit' element={
          <ProtectedRoute requiredRole='admin'>
            <EditProduct />
          </ProtectedRoute>
        } />

        <Route path='/admin/packs' element={
          <ProtectedRoute requiredRole='admin'>
            <AdminPacksList />
          </ProtectedRoute>
        } />
        <Route path='/admin/packs/:id/show' element={
          <ProtectedRoute requiredRole='admin'>
            <AdminShowPack />
          </ProtectedRoute>
        } />
        <Route path='/admin/packs/new' element={
          <ProtectedRoute requiredRole='admin'>
            <CreatePack />
          </ProtectedRoute>
        } />
        <Route path='/admin/packs/:id/edit' element={
          <ProtectedRoute requiredRole='admin'>
            <EditPack />
          </ProtectedRoute>
        } />

        <Route path='/admin/categories' element={
          <ProtectedRoute requiredRole='admin'>
            <AdminCategoriesList />
          </ProtectedRoute>
        } />
        <Route path='/admin/categories/new' element={
          <ProtectedRoute requiredRole='admin'>
            <CreateCategory />
          </ProtectedRoute>
        } />
        <Route path='/admin/categories/:id/edit' element={
          <ProtectedRoute requiredRole='admin'>
            <EditCategory />
          </ProtectedRoute>
        } />

        <Route path='/admin/features' element={
          <ProtectedRoute requiredRole='admin'>
            <AdminFeaturesList />
          </ProtectedRoute>
        } />
        <Route path='/admin/features/new' element={
          <ProtectedRoute requiredRole='admin'>
            <CreateFeature />
          </ProtectedRoute>
        } />
        <Route path='/admin/features/:id/edit' element={
          <ProtectedRoute requiredRole='admin'>
            <EditFeature />
          </ProtectedRoute>
        } />

        <Route path='/admin/feature-types' element={
          <ProtectedRoute requiredRole='admin'>
            <AdminFeatureTypesList />
          </ProtectedRoute>
        } />
        <Route path='/admin/feature-types/new' element={
          <ProtectedRoute requiredRole='admin'>
            <CreateFeatureType />
          </ProtectedRoute>
        } />
        <Route path='/admin/feature-types/:id/edit' element={
          <ProtectedRoute requiredRole='admin'>
            <EditFeatureType />
          </ProtectedRoute>
        } />

        <Route path='/admin/dashboard' element={
          <ProtectedRoute requiredRole='admin'>
            <AdminDashboard />
          </ProtectedRoute>
        } />
      </Route>
      {/* PÁGINAS DE ERROR */}
      <Route path="*" element={<Error404 />} />
      <Route path="/error403" element={<Error403 />} />
      <Route path="/error419" element={<Error419 />} />
      <Route path="/error500" element={<Error500 />} />
      <Route path="/error503" element={<Error503 />} />

    </Routes>
    </>
  )
}

export default App
