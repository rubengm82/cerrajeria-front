import api from './axiosConfig'

// Apartado de tipos de caracteristicas
export const getFeatureTypes = () => api.get('/product-feature-types')
export const getFeatureType = (id) => api.get(`/product-feature-types/${id}`)
export const createFeatureType = (data) => api.post('/product-feature-types', data)
export const updateFeatureType = (id, data) => api.put(`/product-feature-types/${id}`, data)
export const deleteFeatureType = (id) => api.delete(`/product-feature-types/${id}`)

// Apartado de los valores de las caracteristicas
export const getFeatures = () => api.get('/features')
export const getFeature = (id) => api.get(`/features/${id}`)
export const createFeature = (form) => api.post('/features', form)
export const updateFeature = (id, form) => api.put(`/features/${id}`, form)
export const deleteFeature = (id) => api.delete(`/features/${id}`)
