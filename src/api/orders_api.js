import api from './axiosConfig'

// Obtener todos los pedidos
export const getOrders = () => api.get('/orders')

// Obtener todos los pedidos incluyendo eliminados
export const getOrdersWithTrashed = () => api.get('/orders/with-trashed')

// Obtener un pedido por ID
export const getOrder = (id) => api.get(`/orders/${id}`)

// Crear un nuevo pedido
export const createOrder = (orderData) => api.post('/orders', orderData)

// Actualizar un pedido
export const updateOrder = (id, orderData) => api.put(`/orders/${id}`, orderData)

// Eliminar un pedido (soft delete)
export const deleteOrder = (id) => api.delete(`/orders/${id}`)

// Obtener todos los pedidos eliminados
export const getTrashedOrders = () => api.get('/orders/trashed')

// Restaurar un pedido
export const restoreOrder = (id) => api.post(`/orders/${id}/restore`)

// Eliminar un pedido permanentemente
export const forceDeleteOrder = (id) => api.delete(`/orders/${id}/force`)
