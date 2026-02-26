import axios from 'axios';

// Obtener todos los pedidos
export const getOrders = () => axios.get('/api/orders');

// Obtener un pedido por ID
export const getOrder = (id) => axios.get(`/api/orders/${id}`);

// Crear un nuevo pedido
export const createOrder = (orderData) => axios.post('/api/orders', orderData);

// Actualizar un pedido
export const updateOrder = (id, orderData) => axios.put(`/api/orders/${id}`, orderData);

// Eliminar un pedido
export const deleteOrder = (id) => axios.delete(`/api/orders/${id}`);
