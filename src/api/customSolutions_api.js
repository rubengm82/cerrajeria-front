import api from './axiosConfig'

// Obtener todas las soluciones personalizadas
export const getCustomSolutions = () => api.get('/custom-solutions')

// Obtener una solución personalizada por ID
export const getCustomSolution = (id) => api.get(`/custom-solutions/${id}`)

// Crear una solución personalizada
export const createCustomSolution = (data) => api.post('/custom-solutions', data)

// Actualizar una solución personalizada
export const updateCustomSolution = (id, data) => api.put(`/custom-solutions/${id}`, data)

// Eliminar una solución personalizada
export const deleteCustomSolution = (id) => api.delete(`/custom-solutions/${id}`)
