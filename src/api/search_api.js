import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Búsqueda combinada de productos y packs
 * @param {string} query - Término de búsqueda
 * @param {Object} filters - Filtros opcionales {category, price_min, price_max, only_packs}
 * @param {number} limit - Límite de resultados
 * @returns {Promise<Object>} { products, packs, suggestions, total }
 */
export const search = async (query, filters = {}, limit = 20) => {
  const params = new URLSearchParams()
  params.append('q', query)
  params.append('limit', limit)
  
  if (filters.category) params.append('category_id', filters.category)
  if (filters.price_min) params.append('price_min', filters.price_min)
  if (filters.price_max) params.append('price_max', filters.price_max)
  if (filters.only_packs) params.append('only_packs', true)
  
  const response = await api.get(`/search?${params.toString()}`)
  return response.data
}

/**
 * Búsqueda rápida para autocomplete (solo nombres y few fields)
 * @param {string} query - Término de búsqueda
 * @param {number} limit - Límite de resultados
 * @returns {Promise<Object>} { products, packs }
 */
export const quickSearch = async (query, limit = 5) => {
  if (!query || query.length < 2) {
    return { products: [], packs: [] }
  }
  
  const response = await api.get(`/search/quick?q=${encodeURIComponent(query)}&limit=${limit}`)
  return response.data
}

/**
 * Búsqueda por categoría
 * @param {number} categoryId - ID de la categoría
 * @returns {Promise<Array>} Lista de productos
 */
export const getProductsByCategory = async (categoryId) => {
  const response = await api.get(`/products?category_id=${categoryId}`)
  return response.data
}
