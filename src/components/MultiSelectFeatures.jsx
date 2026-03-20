import { useState, useRef, useEffect } from 'react'
import { HiChevronDown, HiXMark } from 'react-icons/hi2'

function MultiSelectFeatures({ 
  features = [], 
  selectedIds = [], 
  onChange,
  label = "Seleccionar características"
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Cerrar el dropdown cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Agrupar características por tipo
  const groupedFeatures = features
    .filter(feature => feature.type?.name)
    .reduce((acc, feature) => {
      const typeName = feature.type.name
      if (!acc[typeName]) acc[typeName] = []
      acc[typeName].push(feature)
      return acc
    }, {})

  const handleToggleFeature = (featureId) => {
    const newSelected = selectedIds.includes(featureId)
      ? selectedIds.filter(id => id !== featureId)
      : [...selectedIds, featureId]
    onChange(newSelected)
  }

  const handleRemoveFeature = (featureId, e) => {
    e.stopPropagation()
    onChange(selectedIds.filter(id => id !== featureId))
  }

  // Obtener las características seleccionadas
  const selectedFeatures = features.filter(f => selectedIds.includes(f.id))

  return (
    <div className="w-full" ref={dropdownRef}>
      <label className="label text-base-content">
        <span className="label-text font-semibold">{label}</span>
      </label>
      
      {/* Dropdown button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full min-h-12 px-4 py-2 text-left bg-base-100 border border-base-300 rounded-lg shadow-sm hover:border-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors flex items-center justify-between"
        >
          <span className={selectedIds.length > 0 ? "text-base-content" : "text-base-content/50"}>
            {selectedIds.length === 0 
              ? "Selecciona las características..." 
              : `${selectedIds.length} característica${selectedIds.length > 1 ? 's' : ''} seleccionada${selectedIds.length > 1 ? 's' : ''}`}
          </span>
          <HiChevronDown className={`size-5 text-base-content/60 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown menu */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
            {Object.keys(groupedFeatures).length > 0 ? (
              Object.entries(groupedFeatures).map(([typeName, typeFeatures]) => (
                <div key={typeName} className="border-b border-base-300 last:border-b-0">
                  <div className="px-3 py-2 bg-base-200/50">
                    <span className="text-sm font-bold text-primary">{typeName}</span>
                  </div>
                  <div className="p-2">
                    {typeFeatures.map(feature => (
                      <label
                        key={feature.id}
                        className="flex items-center gap-3 px-2 py-2 rounded hover:bg-base-200 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm checkbox-primary"
                          checked={selectedIds.includes(feature.id)}
                          onChange={() => handleToggleFeature(feature.id)}
                        />
                        <span className="text-sm">{feature.value}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-base-content/60">
                No hay características disponibles
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected features as chips */}
      {selectedFeatures.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {selectedFeatures.map(feature => (
            <div
              key={feature.id}
              className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
            >
              <span>{feature.value}</span>
              <button
                type="button"
                onClick={(e) => handleRemoveFeature(feature.id, e)}
                className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
              >
                <HiXMark className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MultiSelectFeatures
