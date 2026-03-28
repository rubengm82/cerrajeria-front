import { createContext, useState, useEffect, useContext } from 'react'
import axios from 'axios'

export const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // USER
  useEffect(() => {
    const timer = setTimeout(() => {
      const token = localStorage.getItem('token')
      const userData = localStorage.getItem('user')
      if (token && userData) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        setUser(JSON.parse(userData))
      }
      setLoading(false)
    }, 0)
    
    return () => clearTimeout(timer)
  }, [])

  // LOGIN
  const login = async (email, password) => {
    const response = await axios.post('/api/login', { email, password })
    const { token, user } = response.data
    
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(user)
  }

  // LOGOUT
  const logout = async () => {
    // Rutas protegidas del dashboard
    const protectedRoutes = ['/admin', '/perfil', '/users', '/services', '/orders', '/reports', '/settings', '/my-']
    const currentPath = window.location.pathname
    const isProtectedRoute = protectedRoutes.some(route => currentPath.startsWith(route))
    
    // Eliminar token y usuario inmediatamente
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
    
    // Si está en ruta protegida, redirigir a home (con refresh)
    // Si está en ruta pública, solo actualizar estado (sin refresh)
    if (isProtectedRoute) {
      window.location.href = '/'
    } else {
      // Llamar al logout de la API en background (sin esperar)
      axios.post('/api/logout').catch(() => {})
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}
