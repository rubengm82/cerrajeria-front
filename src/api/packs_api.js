import api from './axiosConfig'

// Obtener todos los packs
export const getPacks = () => api.get('/packs')

// Obtener todos los packs incluyendo eliminados
export const getPacksWithTrashed = () => api.get('/packs/with-trashed')

// Obtener un pack por ID
export const getPack = (id) => api.get(`/packs/${id}`)

// Crear un nuevo pack
export const createPack = (packData) => api.post('/packs', packData)

// Actualizar un pack
export const updatePack = (id, packData) => api.put(`/packs/${id}`, packData)

// Eliminar un pack (soft delete)
export const deletePack = (id) => api.delete(`/packs/${id}`)

// Obtener todos los packs eliminados
export const getTrashedPacks = () => api.get('/packs/trashed')

// Restaurar un pack
export const restorePack = (id) => api.post(`/packs/${id}/restore`)

// Eliminar un pack permanentemente
export const forceDeletePack = (id) => api.delete(`/packs/${id}/force`)
