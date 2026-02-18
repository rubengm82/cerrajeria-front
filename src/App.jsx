import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Users from './pages/UsersList'
import Login from './pages/SignIn'
import { useAuth } from './context/AuthContext'
import './App.css'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregant...</div>
  }
  
  return !user ? <Navigate to="/login" /> : children
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
      
    </Routes>
  )
}

export default App
