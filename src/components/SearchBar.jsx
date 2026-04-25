import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { quickSearch } from '../api/search_api'
import { HiSparkles, HiSearch } from 'react-icons/hi'
import { HiOutlinePhoto } from 'react-icons/hi2'
import { FiPackage } from 'react-icons/fi'
import { BiCube } from 'react-icons/bi'

const SearchBar = ({ placeholder = "Cercar productes, marques o packs...", onItemSelect, autoFocus = false, onActionComplete }) => {
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

  useEffect(() => {
    if (!autoFocus || !inputRef.current) {
      return
    }

    const focusTimeout = window.setTimeout(() => {
      inputRef.current?.focus()
    }, 60)

    return () => window.clearTimeout(focusTimeout)
  }, [autoFocus])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
      setIsOpen(false)
      setQuery('')
      onActionComplete?.()
    }
  }

  const handleResultClick = (event, selectedItem = null) => {
    const button = event.currentTarget
    const id = button.dataset.id
    const type = button.dataset.type

    if (id && type && onItemSelect) {
      onItemSelect(id, type, selectedItem)
      setIsOpen(false)
      setQuery('')
      onActionComplete?.()
      return
    }

    // Fallback: navigate to search page (for "Ver todos" button)
    navigate(`/search?q=${encodeURIComponent(query)}`)
    setIsOpen(false)
    setQuery('')
    onActionComplete?.()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleResultClick(e)
    }
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
              aria-label="Cercar productes"
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
            aria-label="Netejar cerca"
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
              <span>Cercant...</span>
            </div>
          ) : hasResults ? (
            <>
              {/* Sección: Productos */}
              {results.products?.length > 0 && (
               <div className="search-dropdown__section">
                 <h3 className="search-dropdown__section-title">
                   <HiSparkles className="search-dropdown__section-icon" />
                   Productes
                 </h3>
                  <ul className="search-dropdown__list">
                    {results.products.map((product) => (
                      <li key={`product-${product.id}`} role="option">
                        <button
                          type="button"
                          className="search-dropdown__item"
                          data-id={product.id}
                          data-type="product"
                          onClick={(event) => handleResultClick(event, product)}
                          onKeyDown={handleKeyDown}
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
                               <div className="search-dropdown__item-placeholder search-dropdown__item-placeholder--product" aria-label={`Sense imatge per a ${product.name}`}>
                                 <HiOutlinePhoto className="search-dropdown__item-placeholder-icon" aria-hidden="true" />
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
                   Paquets
                 </h3>
                  <ul className="search-dropdown__list">
                    {results.packs.map((pack) => (
                      <li key={`pack-${pack.id}`} role="option">
                        <button
                          type="button"
                          className="search-dropdown__item search-dropdown__item--pack"
                          data-id={pack.id}
                          data-type="pack"
                          onClick={(event) => handleResultClick(event, pack)}
                          onKeyDown={handleKeyDown}
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
                                 PAQUET
                               </span>
                               <span className="search-dropdown__price">
                                 {pack.price ? parseFloat(pack.price).toFixed(2) : '0.00'}€
                               </span>
                               {pack.product_count && (
                                 <span className="search-dropdown__count">
                                   {pack.product_count} productes
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
                      onClick={handleResultClick}
                    >
                      Veure tots els resultats per a "{query}"
                    </button>
               </div>
            </>
           ) : (
             <div className="search-dropdown__empty">
               <p>No s'han trobat resultats per a "{query}"</p>
               <span className="search-dropdown__empty-hint">
                 Intenta amb altres termes o revisa l'ortografia
               </span>
             </div>
           )}
        </div>
      )}
    </div>
  )
}

export default SearchBar
