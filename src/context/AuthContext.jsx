import { createContext, useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { useQueryClient } from '@tanstack/react-query'
import { mergeGuestCart } from '../api/orders_api'
import { clearLocalCart, getLocalCartMergeItems } from '../utils/localCart'
import { setAuthCookie, getAuthCookie, deleteAuthCookie } from '../utils/authCookie'

export const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const queryClient = useQueryClient()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // USER
  useEffect(() => {
    const timer = setTimeout(() => {
      const token = getAuthCookie()
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
    
    setAuthCookie(token)
    localStorage.setItem('user', JSON.stringify(user))
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(user)

    const guestCartItems = getLocalCartMergeItems()
    if (guestCartItems.length > 0) {
      try {
        const mergeResponse = await mergeGuestCart(guestCartItems)
        queryClient.setQueryData(['cart-order'], mergeResponse.data)
        clearLocalCart()
      } catch (error) {
        console.error("No s'ha pogut sincronitzar el carret local.", error)
      }
    }

    await queryClient.invalidateQueries({ queryKey: ['cart-order'] })
    return user
  }

  // LOGOUT
  const logout = async () => {
    // Rutas protegidas del dashboard
    const protectedRoutes = ['/admin', '/perfil', '/users', '/services', '/orders', '/reports', '/settings', '/my-', '/products', '/categories']
    const currentPath = window.location.pathname
    const isProtectedRoute = protectedRoutes.some(route => currentPath.startsWith(route))
    
    // Eliminar token y usuario inmediatamente
    deleteAuthCookie()
    localStorage.removeItem('user')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
    queryClient.removeQueries({ queryKey: ['cart-order'] })
    
    // Llamar al logout de la API en background (sin esperar)
    axios.post('/api/logout').catch(() => {})
    
    // Si está en ruta protegida, usar window.location.replace para navegación completa
    // Esto evita el problema del doble redirect que ocurre con window.location.href
    if (isProtectedRoute) {
      window.location.replace('/')
    }
    // Si no está en ruta protegida, no hace falta hacer nada más
    // porque el estado ya se actualizó y la UI se actualiza automáticamente
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}
