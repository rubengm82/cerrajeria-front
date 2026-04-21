import api from './axiosConfig'

export const getCommerceSettings = () => api.get('/commerce-settings')

export const updateCommerceSettings = (settings) => api.put('/commerce-settings', settings)
