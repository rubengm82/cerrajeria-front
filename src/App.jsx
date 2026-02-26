import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Users from './pages/UsersList'
import Login from './pages/SignIn'
import Error404 from './pages/errors/error404'
import Error403 from './pages/errors/error403'
import Error419 from './pages/errors/error419'
import Error500 from './pages/errors/error500'
import Error503 from './pages/errors/error503'
import { useAuth } from './context/AuthContext'
import './App.css'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregant...</div>
  }
  
  const redirect = !user ? <Navigate to="/login" /> : children
  
  return redirect
}

function App() {
  return (
    /* /////////////////////////////// */
    /* DECLARACION DE ROUTES de la APP */
    /* /////////////////////////////// */
    <Routes>

      {/* ROUTES DESPROTEGIDAS */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      
      {/* ROUTES PROTEGIDAS */}
      <Route path="/users" element={
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
        } 
      />
      
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
