import api from './axiosConfig'

// Obtener todos los packs
export const getPacks = () => api.get('/packs')

// Obtener un pack por ID
export const getPack = (id) => api.get(`/packs/${id}`)

// Crear un nuevo pack
export const createPack = (packData) => api.post('/packs', packData)

// Actualizar un pack
export const updatePack = (id, packData) => api.put(`/packs/${id}`, packData)

// Eliminar un pack
export const deletePack = (id) => api.delete(`/packs/${id}`)
