import React, { useState } from 'react'

/**
 * Componente simple de búsqueda para tablas
 * Mantiene el input y la tabla separados en el código (estructuralmente)
 * @param {Object} props
 * @param {Array} props.data - Array de objetos a filtrar
 * @param {Array<string>} props.searchFields - Campos por los que buscar
 * @param {string} props.placeholder - Placeholder del input
 * @param {string} props.inputClassName - Clases CSS personalizadas para el input
 * @param {React.ReactNode} props.children - La tabla a renderizar
 * @param {React.ReactNode} props.extraFilters - Controles extra de filtro a mostrar
 */
function SearchBarTableSimple({ 
  data = [], 
  searchFields = [], 
  placeholder = "Buscar...",
  inputClassName = "",
  children,
  extraFilters
}) {
  const [query, setQuery] = useState("")

  // DEBUG
  console.log('SearchBarTableSimple render - extraFilters:', extraFilters ? 'PRESENT' : 'null')

  // Función auxiliar para obtener valores de objetos anidados
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null
    }, obj)
  }

  // Filtrar datos
  const filteredData = data.filter(item => {
    if (!query.trim()) return true
    
    const lowerQuery = query.toLowerCase().trim()
    return searchFields.some(field => {
      const value = getNestedValue(item, field)
      if (value === null || value === undefined) return false
      return value.toString().toLowerCase().includes(lowerQuery)
    })
  })

  // Clases por defecto + clases personalizadas
  const inputClassNameFinal = inputClassName || ""

  return (
    <>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className={inputClassNameFinal}
      />
      {extraFilters}
      {typeof children === 'function' 
        ? children(filteredData)
        : React.cloneElement(children, { data: filteredData })}
    </>
  )
}

export default SearchBarTableSimple
