import api from './axiosConfig'

// Obtener todas las categorías
export const getCategories = () => api.get('/categories')

// Obtener una categoría por ID
export const getCategory = (id) => api.get(`/categories/${id}`)

// Crear una nueva categoría
export const createCategory = (categoryData) => api.post('/categories', categoryData)

// Actualizar una categoría
export const updateCategory = (id, categoryData) => api.put(`/categories/${id}`, categoryData)

// Eliminar una categoría
export const deleteCategory = (id) => api.delete(`/categories/${id}`)
