import { Routes, Route, Navigate } from 'react-router-dom'

// Components
import ScrollToTop from './components/ScrollTop'

// Context
import { useAuth } from './context/AuthContext'

// Layout
import LayoutDashboard from './components/layout/LayoutDashboard'
import LayoutShop from './components/layout/LayoutShop'

// Styles
import './App.css'

// Pages - Public/Store
import Shop from './pages/Shop'
import Products from './pages/products/Products'
import Categories from './pages/categories/Categories'
import CategoriesShow from './pages/categories/CategoriesShow'

// Pages - Auth
import Login from './pages/auth/SignIn'
import Register from './pages/auth/Register'
import ResetPassword from './pages/auth/ResetPassword'
import ForgotPassword from './pages/auth/ForgotPassword'
import VerifyEmail from './pages/auth/VerifyEmail'
import ResendVerification from './pages/auth/ResendVerification'

// Pages - Admin
import AdminUsers from './pages/users/AdminUsers'
import EditMyProfile from './pages/myProfile/EditMyProfile'
import AdminProductsList from './pages/products/AdminProductsList'
import AdminShowProduct from './pages/products/AdminShowProduct'
import CreateProduct from './pages/products/CreateProduct'
import EditProduct from './pages/products/EditProduct'
import AdminCategoriesList from './pages/categories/AdminCategoriesList'
import CreateCategory from './pages/categories/CreateCategory'
import EditCategory from './pages/categories/EditCategory'
import AdminPacksList from './pages/packs/AdminPacksList'
import AdminShowPack from './pages/packs/AdminShowPack'
import CreatePack from './pages/packs/CreatePack'
import EditPack from './pages/packs/EditPack'
import AdminFeaturesManager from './pages/features/AdminFeaturesManager'
import AdminDashboard from './pages/admin/AdminDashboard'
import CustomSolutions from './pages/customSolutions/CustomSolutions'
import AdminCustomSolutionsList from './pages/customSolutions/AdminCustomSolutionsList'
import AdminCustomSolutionsShow from './pages/customSolutions/AdminCustomSolutionsShow'

// Pages - Errors
import Error404 from './pages/errors/error404'
import Error403 from './pages/errors/error403'
import Error419 from './pages/errors/error419'
import Error500 from './pages/errors/error500'
import Error503 from './pages/errors/error503'

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
      <Route element={<LayoutShop />}>
        <Route path="/" element={<Shop />} />
        <Route path="/products" element={<Products />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/categories/:id" element={<CategoriesShow />} />
        <Route path="/custom-solutions" element={<CustomSolutions />} />
      </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/resend-verification" element={<ResendVerification />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Rutas con Layout (Topbar + Sidebar) */}
      <Route element={<LayoutDashboard />}>
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <div className="p-4"><h1 className="text-2xl font-bold">Tauler</h1><p>Properament...</p></div>
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

        <Route path='/admin/features-manager' element={
          <ProtectedRoute requiredRole='admin'>
            <AdminFeaturesManager />
          </ProtectedRoute>
        } />

        <Route path='/admin/custom-solutions' element={
          <ProtectedRoute requiredRole='admin'>
            <AdminCustomSolutionsList />
          </ProtectedRoute>
        } />
        <Route path='/admin/custom-solutions/:id/show' element={
          <ProtectedRoute requiredRole='admin'>
            <AdminCustomSolutionsShow />
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
