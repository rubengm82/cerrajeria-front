import axios from 'axios';

// Obtener todos los usuarios
export const getUsers = () => axios.get('/api/users');

// Obtener un usuario por ID
export const getUser = (id) => axios.get(`/api/users/${id}`);

// Crear un nuevo usuario
export const createUser = (userData) => axios.post('/api/users', userData);

// Actualizar un usuario
export const updateUser = (id, userData) => axios.put(`/api/users/${id}`, userData);

// Eliminar un usuario
export const deleteUser = (id) => axios.delete(`/api/users/${id}`);
