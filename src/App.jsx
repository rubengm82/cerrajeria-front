import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Users from './pages/UsersList'
import Login from './pages/SignIn'
import Register from './pages/Register'
import ResetPassword from './pages/ResetPassword'
import ForgotPassword from './pages/ForgotPassword'
import VerifyEmail from './pages/VerifyEmail'
import ResendVerification from './pages/ResendVerification'
import Error404 from './pages/errors/error404'
import Error403 from './pages/errors/error403'
import Error419 from './pages/errors/error419'
import Error500 from './pages/errors/error500'
import Error503 from './pages/errors/error503'
import { useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'
import './App.css'

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
