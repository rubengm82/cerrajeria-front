import api from './axiosConfig'

// Obtener todos los pedidos
export const getOrders = () => api.get('/orders')

// Obtener todos los pedidos incluyendo eliminados
export const getOrdersWithTrashed = () => api.get('/orders/with-trashed')

// Obtener un pedido por ID
export const getOrder = (id) => api.get(`/orders/${id}`)

// Obtener el carrito del usuario autenticado
export const getCartOrder = () => api.get('/orders/cart')

// Fusionar el carrito invitado con el carrito autenticado
export const mergeGuestCart = (items, token = null) => api.post(
  '/orders/cart/merge',
  { items },
  token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
)

// Crear un pedido desde checkout público o invitado
export const createCheckoutOrder = (checkoutData) => api.post('/checkout/orders', checkoutData)

// Añadir un producto al carrito del usuario autenticado
export const addProductToCart = (cartData) => api.post('/orders/cart/products', cartData)

// Añadir un pack al carrito del usuario autenticado
export const addPackToCart = (cartData) => api.post('/orders/cart/packs', cartData)

// Actualizar la cantidad de un producto del carrito autenticado
export const updateCartProduct = (productId, cartData) => api.put(`/orders/cart/products/${productId}`, cartData)

// Actualizar la cantidad de un pack del carrito autenticado
export const updateCartPack = (packId, cartData) => api.put(`/orders/cart/packs/${packId}`, cartData)

// Eliminar un producto del carrito autenticado
export const removeCartProduct = (productId) => api.delete(`/orders/cart/products/${productId}`)

// Eliminar un pack del carrito autenticado
export const removeCartPack = (packId) => api.delete(`/orders/cart/packs/${packId}`)

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
