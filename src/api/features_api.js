import api from './axiosConfig'

// Apartado de tipos de caracteristicas
export const getFeatureTypes = () => api.get('/feature-types')
export const getFeatureType = (id) => api.get(`/feature-types/${id}`)
export const createFeatureType = (data) => api.post('/feature-types', data)
export const updateFeatureType = (id, data) => api.put(`/feature-types/${id}`, data)
export const deleteFeatureType = (id) => api.delete(`/feature-types/${id}`)

// Apartado de los valores de las caracteristicas
export const getFeatures = () => api.get('/features')
export const getFeature = (id) => api.get(`/features/${id}`)
export const createFeature = (form) => api.post('/features', form)
export const updateFeature = (id, form) => api.put(`/features/${id}`, form)
export const deleteFeature = (id) => api.delete(`/features/${id}`)
