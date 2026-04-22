import api from './axiosConfig'

// Obtener todas las preguntas frecuentes activas (públicas)
export const getFaqs = () => api.get('/faqs')

// Obtener todas las preguntas frecuentes incluyendo eliminadas (admin)
export const getFaqsWithTrashed = () => api.get('/faqs/with-trashed')

// Obtener una pregunta frecuente por ID
export const getFaq = (id) => api.get(`/faqs/${id}`)

// Crear una nueva pregunta frecuente
export const createFaq = (faqData) => api.post('/faqs', faqData)

// Actualizar una pregunta frecuente
export const updateFaq = (id, faqData) => api.put(`/faqs/${id}`, faqData)

// Eliminar una pregunta frecuente (soft delete)
export const deleteFaq = (id) => api.delete(`/faqs/${id}`)

// Obtener preguntas frecuentes eliminadas
export const getTrashedFaqs = () => api.get('/faqs/trashed')

// Restaurar una pregunta frecuente
export const restoreFaq = (id) => api.post(`/faqs/${id}/restore`)

// Eliminar una pregunta frecuente permanentemente
export const forceDeleteFaq = (id) => api.delete(`/faqs/${id}/force`)
