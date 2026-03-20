import api from './axiosConfig'

// Crear una nueva imagen para un pack
export const createPackImage = (imageData) => api.post("/pack-images", imageData)

// Actualizar una imagen de un pack
export const updatePackImage = (id, imageData) => api.put(`/pack-images/${id}`, imageData)

// Eliminar una imagen de un pack
export const deletePackImage = (id) => api.delete(`/pack-images/${id}`)
