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
 */
function SearchBarTableSimple({ 
  data = [], 
  searchFields = [], 
  placeholder = "Buscar...",
  inputClassName = "",
  children 
}) {
  const [query, setQuery] = useState("")

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
  const defaultInputClass = ""
  const inputClassNameFinal = inputClassName ? `${defaultInputClass} ${inputClassName}` : defaultInputClass

  // Renderizar children (función o componente)
  if (typeof children === 'function') {
    return (
      <>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={inputClassNameFinal}
        />
        {children(filteredData)}
      </>
    )
  }

  // Si es componente, clonar con prop data
  return (
    <>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className={inputClassNameFinal}
      />
      {React.cloneElement(children, { data: filteredData })}
    </>
  )
}

export default SearchBarTableSimple
