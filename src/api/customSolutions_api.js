import axios from 'axios';

// Obtener todas las soluciones personalizadas
export const getCustomSolutions = () => axios.get('/api/custom-solutions');

// Obtener una solución personalizada por ID
export const getCustomSolution = (id) => axios.get(`/api/custom-solutions/${id}`);

// Crear una nueva solución personalizada
export const createCustomSolution = (data) => axios.post('/api/custom-solutions', data);

// Actualizar una solución personalizada
export const updateCustomSolution = (id, data) => axios.put(`/api/custom-solutions/${id}`, data);

// Eliminar una solución personalizada
export const deleteCustomSolution = (id) => axios.delete(`/api/custom-solutions/${id}`);
