import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Users from './pages/UsersList'
import AdminProducts from './pages/AdminProducts'
import AdminCategories from './pages/AdminCategories'
import CreateProduct from './pages/CreateProduct'
import CreateCategory from './pages/CreateCategory'
import EditProduct from './pages/EditProduct'
import EditCategory from './pages/EditCategory'
import AdminPacks from './pages/AdminPacks'
import AdminShowPack from './pages/AdminShowPack'
import CreatePack from './pages/CreatePack'
import EditPack from './pages/EditPack'
import AdminFeatures from './pages/AdminFeatures'
import CreateFeature from './pages/CreateFeature'
import EditFeature from './pages/EditFeature'
import AdminFeatureTypes from './pages/AdminFeatureTypes'
import CreateFeatureType from './pages/CreateFeatureType'
import EditFeatureType from './pages/EditFeatureType'
import Login from './pages/SignIn'
import ResetPassword from './pages/ResetPassword'
import ForgotPassword from './pages/ForgotPassword'
import Error404 from './pages/errors/error404'
import Error403 from './pages/errors/error403'
import Error419 from './pages/errors/error419'
import Error500 from './pages/errors/error500'
import Error503 from './pages/errors/error503'
import { useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'
import './App.css'
import AdminShowProduct from './pages/AdminShowProduct'
import AdminDashboard from './pages/AdminDashboard'

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
    <Routes>

      {/* RUTES PÚBLIQUES - Tienda */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Rutas con Layout (Topbar + Sidebar) */}
      <Route element={<Layout />}>
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <div className="p-4"><h1 className="text-2xl font-bold">Dashboard</h1><p>Properament...</p></div>
          </ProtectedRoute>
        } />
        <Route path="/perfil" element={<div className="p-4"><h1 className="text-2xl font-bold">El Meu Perfil</h1><p>Properament...</p></div>} />
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
            <Users />
          </ProtectedRoute>
        } />
        <Route path='/admin/products' element={
          <ProtectedRoute requiredRole='admin'>
            <AdminProducts />
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
            <AdminPacks />
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
            <AdminCategories />
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
            <AdminFeatures />
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
            <AdminFeatureTypes />
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
  )
}

export default App
