import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { quickSearch } from '../api/search_api'
import { HiOutlineEye, HiSparkles, HiSearch } from 'react-icons/hi'
import { FiPackage } from 'react-icons/fi'
import { BiCube } from 'react-icons/bi'

const SearchBar = ({ placeholder = "Buscar productos, marcas o packs..." }) => {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const wrapperRef = useRef(null)
  const inputRef = useRef(null)

  // Consulta debounced - solo hace fetch si query >= 2 caracteres
  const { data: results, isLoading } = useQuery({
    queryKey: ['quickSearch', query],
    queryFn: () => quickSearch(query, 5),
    enabled: query.length >= 2 && isOpen,
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchOnWindowFocus: false,
  })

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
      setIsOpen(false)
      setQuery('')
    }
  }

  const handleResultClick = (type, id) => {
    // Navegar a la página de resultados de búsqueda
    // El usuario verá todos los resultados y podrá hacer clic en el item deseado
    navigate(`/search?q=${encodeURIComponent(query)}`)
    setIsOpen(false)
    setQuery('')
  }

  const handleFocus = () => {
    setIsOpen(true)
  }

  const hasResults = results && (results.products?.length > 0 || results.packs?.length > 0)

  return (
    <div className="search-bar-wrapper" ref={wrapperRef}>
      <form onSubmit={handleSubmit} className="search-bar-form">
        <div className="search-bar-input-container">
          <HiSearch className="search-bar-icon" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleFocus}
            placeholder={placeholder}
            className="search-bar-input"
            aria-label="Buscar productos"
            aria-expanded={isOpen}
            aria-autocomplete="list"
            aria-controls="search-results-list"
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="search-bar-clear"
              aria-label="Limpiar búsqueda"
            >
              ×
            </button>
          )}
        </div>
      </form>

      {/* Dropdown de resultados */}
      {isOpen && query.length >= 2 && (
        <div id="search-results-list" className="search-dropdown" role="listbox">
          {isLoading ? (
            <div className="search-dropdown__loading">
              <div className="loading-spinner"></div>
              <span>Buscando...</span>
            </div>
          ) : hasResults ? (
            <>
              {/* Sección: Productos */}
              {results.products?.length > 0 && (
                <div className="search-dropdown__section">
                  <h3 className="search-dropdown__section-title">
                    <HiSparkles className="search-dropdown__section-icon" />
                    Productos
                  </h3>
                  <ul className="search-dropdown__list">
                    {results.products.map((product) => (
                      <li key={`product-${product.id}`} role="option">
                        <button
                          type="button"
                          className="search-dropdown__item"
                          onClick={() => handleResultClick('product', product.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleResultClick('product', product.id)
                          }}
                        >
                          <div className="search-dropdown__item-image-wrap">
                            {product.images?.[0]?.path ? (
                              <img 
                                src={`/storage/${product.images[0].path}`} 
                                alt={product.name}
                                className="search-dropdown__item-image"
                                loading="lazy"
                              />
                            ) : (
                              <div className="search-dropdown__item-placeholder">
                                Sin imagen
                              </div>
                            )}
                          </div>
                          <div className="search-dropdown__item-content">
                            <span className="search-dropdown__item-title">
                              {product.name}
                            </span>
                            <span className="search-dropdown__item-meta">
                              {product.category?.name && (
                                <span className="search-dropdown__badge">
                                  {product.category.name}
                                </span>
                              )}
                               <span className="search-dropdown__price">
                                 {product.price ? parseFloat(product.price).toFixed(2) : '0.00'}€
                               </span>
                            </span>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Sección: Packs */}
              {results.packs?.length > 0 && (
                <div className="search-dropdown__section">
                  <h3 className="search-dropdown__section-title">
                    <FiPackage className="search-dropdown__section-icon" />
                    Packs
                  </h3>
                  <ul className="search-dropdown__list">
                    {results.packs.map((pack) => (
                      <li key={`pack-${pack.id}`} role="option">
                        <button
                          type="button"
                          className="search-dropdown__item search-dropdown__item--pack"
                          onClick={() => handleResultClick('pack', pack.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleResultClick('pack', pack.id)
                          }}
                        >
                          <div className="search-dropdown__item-image-wrap">
                            {pack.images?.[0]?.path ? (
                              <img 
                                src={`/storage/${pack.images[0].path}`} 
                                alt={pack.name}
                                className="search-dropdown__item-image"
                                loading="lazy"
                              />
                            ) : (
                              <div className="search-dropdown__item-placeholder">
                                <BiCube />
                              </div>
                            )}
                          </div>
                          <div className="search-dropdown__item-content">
                            <span className="search-dropdown__item-title">
                              {pack.name}
                            </span>
                            <span className="search-dropdown__item-meta">
                              <span className="search-dropdown__badge search-dropdown__badge--pack">
                                PACK
                              </span>
                               <span className="search-dropdown__price">
                                 {pack.price ? parseFloat(pack.price).toFixed(2) : '0.00'}€
                               </span>
                              {pack.product_count && (
                                <span className="search-dropdown__count">
                                  {pack.product_count} productos
                                </span>
                              )}
                            </span>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Footer - Ver todos */}
              <div className="search-dropdown__footer">
                <button
                  type="button"
                  className="search-dropdown__see-all"
                  onClick={() => handleSubmit({ preventDefault: () => {} })}
                >
                  Ver todos los resultados para "{query}"
                  <HiOutlineEye />
                </button>
              </div>
            </>
          ) : (
            <div className="search-dropdown__empty">
              <p>No se encontraron resultados para "{query}"</p>
              <span className="search-dropdown__empty-hint">
                Intenta con otros términos o revisa la ortografía
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchBar
