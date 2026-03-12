import api from './axiosConfig'

// Obtener todas las soluciones personalizadas
export const getCustomSolutions = () => api.get('/custom-solutions')

// Obtener una solución personalizada por ID
export const getCustomSolution = (id) => api.get(`/custom-solutions/${id}`)

// Crear una solución personalizada
export const createCustomSolution = (data) => api.post('/custom-solutions', data)

// Actualizar una solución personalizada
export const updateCustomSolution = (id, data) => api.put(`/custom-solutions/${id}`, data)

// Eliminar una solución personalizada (soft delete)
export const deleteCustomSolution = (id) => api.delete(`/custom-solutions/${id}`)

// Obtener todas las soluciones personalizadas eliminadas
export const getTrashedCustomSolutions = () => api.get('/custom-solutions/trashed')

// Restaurar una solución personalizada
export const restoreCustomSolution = (id) => api.post(`/custom-solutions/${id}/restore`)

// Eliminar una solución personalizada permanentemente
export const forceDeleteCustomSolution = (id) => api.delete(`/custom-solutions/${id}/force`)
