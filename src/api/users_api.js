import api from './axiosConfig'

// Obtener todos los usuarios
export const getUsers = () => api.get('/users')

// Obtener un usuario por ID
export const getUser = (id) => api.get(`/users/${id}`)

// Crear un nuevo usuario
export const createUser = (userData) => api.post('/users', userData)

// Actualizar un usuario
export const updateUser = (id, userData) => api.put(`/users/${id}`, userData)

// Eliminar un usuario
export const deleteUser = (id) => api.delete(`/users/${id}`)
