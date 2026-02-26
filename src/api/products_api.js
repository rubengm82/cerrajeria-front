import axios from 'axios';

// Obtener todos los productos
export const getProducts = () => axios.get('/api/products');

// Obtener un producto por ID
export const getProduct = (id) => axios.get(`/api/products/${id}`);

// Crear un nuevo producto
export const createProduct = (productData) => axios.post('/api/products', productData);

// Actualizar un producto
export const updateProduct = (id, productData) => axios.put(`/api/products/${id}`, productData);

// Eliminar un producto
export const deleteProduct = (id) => axios.delete(`/api/products/${id}`);
