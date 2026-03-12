import api from './axiosConfig'

// Obtener todas las categorías (sin softdelete)
export const getCategories = () => api.get('/categories')

// Obtener todas las categorías incluyendo las eliminadas (con softdelete)
export const getCategoriesWithTrashed = () => api.get('/categories/with-trashed')

// Obtener una categoría por ID
export const getCategory = (id) => api.get(`/categories/${id}`)

// Crear una nueva categoría
export const createCategory = (categoryData) => api.post('/categories', categoryData)

// Actualizar una categoría
export const updateCategory = (id, categoryData) => api.post(`/categories/${id}`, categoryData)

// Eliminar una categoría (soft delete)
export const deleteCategory = (id) => api.delete(`/categories/${id}`)

// Obtener todas las categorías eliminadas
export const getTrashedCategories = () => api.get('/categories/trashed')

// Restaurar una categoría
export const restoreCategory = (id) => api.post(`/categories/${id}/restore`)

// Eliminar una categoría permanentemente
export const forceDeleteCategory = (id) => api.delete(`/categories/${id}/force`)
