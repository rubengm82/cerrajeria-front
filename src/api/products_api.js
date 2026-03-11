import api from './axiosConfig'

// Obtener todos los productos
export const getProducts = () => api.get('/products')

// Obtener un producto por ID
export const getProduct = (id) => api.get(`/products/${id}`)

// Crear un nuevo producto
export const createProduct = (productData) => api.post('/products', productData)

// Actualizar un producto
export const updateProduct = (id, productData) => api.put(`/products/${id}`, productData)

// Eliminar un producto
export const deleteProduct = (id) => api.delete(`/products/${id}`)

// Crear imagen de producto
export const createProductImage = (productImageData) => api.post("/product-images", productImageData)

// Obtener productos destacados
export const getImportantProducts = () => api.get('/products/important')

// Eliminar imagen del producto
export const deleteProductImage = (id) => api.delete(`/product-images/${id}`)
