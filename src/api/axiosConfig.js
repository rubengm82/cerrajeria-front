import axios from 'axios'

// Instancia de axios configurada
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
  },
})

// Interceptor de solicitudes - añade el token CSRF y de autenticación
api.interceptors.request.use(
  (config) => {
    // Obtener el token CSRF del meta tag
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content
    if (csrfToken) {
      config.headers['X-CSRF-TOKEN'] = csrfToken
    }

    // Obtener el token de autenticación del localStorage
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

// Interceptor de respuestas - maneja errores HTTP
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    
    // Si ya estamos en una página de error, no redirigir de nuevo
    const currentPath = window.location.pathname
    const errorPages = ['/error403', '/error419', '/error500', '/error503', '/404']
    if (errorPages.some(page => currentPath.startsWith(page))) {
      return Promise.reject(error)
    }

    // Rutas públicas que no requieren autenticación
    const publicRoutes = ['/', '/products', '/packs', '/categories', '/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/resend-verification', '/search', '/custom-solutions']
    const isPublicRoute = publicRoutes.some(route => currentPath === route || currentPath.startsWith('/categories/') || currentPath.startsWith('/packs/'))

    // Guardar el código de error en sessionStorage para mostrar la página correcta
    if (status) {
      sessionStorage.setItem('httpErrorCode', status.toString())
      
      // Redirigir según el código de error
      switch (status) {
        case 403:
          window.location.href = '/error403'
          break
        case 419:
          window.location.href = '/error419'
          break
        case 500:
          window.location.href = '/error500'
          break
        case 503:
          window.location.href = '/error503'
          break
        case 401:
          // Solo redirigir a home si NO estamos en una ruta pública
          if (!isPublicRoute) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            window.location.href = '/'
          }
          break
        default:
          break
      }
    }

    // Si el servidor no responde (error de red)
    if (!error.response) {
      window.location.href = '/error503'
    }

    return Promise.reject(error)
  }
)

export default api
