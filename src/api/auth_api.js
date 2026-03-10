import api from './axiosConfig'

// Registrar un nuevo usuario
export const register = async (userData) => {
  const response = await api.post('/register', userData)
  return response.data
}

// Reenviar email de verificación (sin estar logueado)
export const resendVerificationEmail = async (email) => {
  const response = await api.post('/resend-verification-email', { email })
  return response.data
}

// Verificar email (desde el link)
export const verifyEmail = async (id, hash) => {
  const response = await api.get(`/email/verify/${id}/${hash}`)
  return response.data
}
