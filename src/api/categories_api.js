import axios from 'axios';

// Obtener todas las categorías
export const getCategories = () => axios.get('/api/categories');

// Obtener una categoría por ID
export const getCategory = (id) => axios.get(`/api/categories/${id}`);

// Crear una nueva categoría
export const createCategory = (categoryData) => axios.post('/api/categories', categoryData);

// Actualizar una categoría
export const updateCategory = (id, categoryData) => axios.put(`/api/categories/${id}`, categoryData);

// Eliminar una categoría
export const deleteCategory = (id) => axios.delete(`/api/categories/${id}`);
