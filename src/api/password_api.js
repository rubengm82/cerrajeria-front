import api from './axiosConfig'

// Solicitar link de recuperación de contraseña
export const forgotPassword = async (email) => {
  const response = await api.post('/forgot-password', { email })
  return response.data
}

// Restablecer contraseña
export const resetPassword = async (data) => {
  const response = await api.post('/reset-password', data)
  return response.data
}
