import axios from 'axios';

// Obtener todos los packs
export const getPacks = () => axios.get('/api/packs');

// Obtener un pack por ID
export const getPack = (id) => axios.get(`/api/packs/${id}`);

// Crear un nuevo pack
export const createPack = (packData) => axios.post('/api/packs', packData);

// Actualizar un pack
export const updatePack = (id, packData) => axios.put(`/api/packs/${id}`, packData);

// Eliminar un pack
export const deletePack = (id) => axios.delete(`/api/packs/${id}`);
