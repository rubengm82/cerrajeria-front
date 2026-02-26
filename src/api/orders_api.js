import api from './axiosConfig'

// Obtener todos los pedidos
export const getOrders = () => api.get('/orders')

// Obtener un pedido por ID
export const getOrder = (id) => api.get(`/orders/${id}`)

// Crear un nuevo pedido
export const createOrder = (orderData) => api.post('/orders', orderData)

// Actualizar un pedido
export const updateOrder = (id, orderData) => api.put(`/orders/${id}`, orderData)

// Eliminar un pedido
export const deleteOrder = (id) => api.delete(`/orders/${id}`)
