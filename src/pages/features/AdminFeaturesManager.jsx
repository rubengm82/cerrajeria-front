import { useEffect, useState, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { 
  getFeatureTypesWithTrashed, 
  deleteFeatureType, 
  restoreFeatureType, 
  forceDeleteFeatureType,
  createFeatureType,
  updateFeatureType,
  createFeature,
  updateFeature,
  deleteFeature,
  restoreFeature,
  forceDeleteFeature
} from '../../api/features_api'
import LoadingAnimation from '../../components/LoadingAnimation'
import Notifications from '../../components/Notifications'
import ConfirmableModal from '../../components/ConfirmableModal'
import { HiTrash, HiPencilSquare, HiPlus, HiChevronDown, HiChevronRight, HiXMark } from 'react-icons/hi2'

function AdminFeaturesManager() {
  const [featureTypes, setFeatureTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState(null)
  const [expandedTypes, setExpandedTypes] = useState({})

  // Estados para modal de crear/editar tipo
  const [showTypeModal, setShowTypeModal] = useState(false)
  const [editingType, setEditingType] = useState(null)
  const [typeForm, setTypeForm] = useState({ name: '' })
  const [typeLoading, setTypeLoading] = useState(false)
  const [typeErrors, setTypeErrors] = useState({})

  // Estados para modal de crear/editar valor
  const [showValueModal, setShowValueModal] = useState(false)
  const [editingValue, setEditingValue] = useState(null)
  const [selectedTypeId, setSelectedTypeId] = useState(null)
  const [valueForm, setValueForm] = useState({ value: '' })
  const [valueLoading, setValueLoading] = useState(false)
  const [valueErrors, setValueErrors] = useState({})

  const location = useLocation()
  const locationState = location.state

  useEffect(() => {
    if (locationState) {
      window.history.replaceState({}, document.title)
    }
  }, [locationState])

  const fetchFeatureTypes = useCallback(() => {
    getFeatureTypesWithTrashed()
      .then(response => {
        setFeatureTypes(response.data)
        // Expandir todos por defecto si no hay ninguno expandido
        if (Object.keys(expandedTypes).length === 0) {
          const allExpanded = {}
          response.data.forEach(ft => { allExpanded[ft.id] = true })
          setExpandedTypes(allExpanded)
        }
      })
      .catch(err => {
        console.error(err)
        setFeatureTypes([])
      })
      .finally(() => setLoading(false))
  }, [expandedTypes])

  useEffect(() => {
    fetchFeatureTypes()
  }, [fetchFeatureTypes])

  const toggleType = (typeId) => {
    setExpandedTypes(prev => ({
      ...prev,
      [typeId]: !prev[typeId]
    }))
  }

  // --- OPERACIONES DE TIPOS ---

  const handleOpenTypeModal = (type = null) => {
    if (type) {
      setEditingType(type)
      setTypeForm({ name: type.name })
    } else {
      setEditingType(null)
      setTypeForm({ name: '' })
    }
    setTypeErrors({})
    setShowTypeModal(true)
  }

  const handleCloseTypeModal = () => {
    setShowTypeModal(false)
    setEditingType(null)
    setTypeForm({ name: '' })
    setTypeErrors({})
  }

  const handleSaveType = async (event) => {
    event.preventDefault()
    setTypeLoading(true)
    setTypeErrors({})

    try {
      if (editingType) {
        await updateFeatureType(editingType.id, typeForm)
        setNotification({ id: Date.now(), type: "success", message: "Tipus de característica actualitzat correctament" })
      } else {
        await createFeatureType(typeForm)
        setNotification({ id: Date.now(), type: "success", message: "Tipus de característica creat correctament" })
      }
      fetchFeatureTypes()
      handleCloseTypeModal()
    } catch (error) {
      if (error.response?.status === 422) {
        setTypeErrors(error.response.data.errors)
      } else {
        setNotification({ id: Date.now(), type: "error", message: "Error en guardar el tipus" })
      }
    } finally {
      setTypeLoading(false)
    }
  }

  const handleToggleType = (id, isActive) => {
    if (isActive) {
      deleteFeatureType(id)
        .then(() => {
          fetchFeatureTypes()
          setNotification({ id: Date.now(), type: "success", message: "Tipus de característica desactivat" })
        })
        .catch(err => {
          console.error(err)
          setNotification({ id: Date.now(), type: "error", message: "Error en desactivar" })
        })
    } else {
      restoreFeatureType(id)
        .then(() => {
          fetchFeatureTypes()
          setNotification({ id: Date.now(), type: "success", message: "Tipus de característica restaurat" })
        })
        .catch(err => {
          console.error(err)
          setNotification({ id: Date.now(), type: "error", message: "Error en restaurar" })
        })
    }
  }

  const handleForceDeleteType = (id) => {
    forceDeleteFeatureType(id)
      .then(() => {
        fetchFeatureTypes()
        setNotification({ id: Date.now(), type: "success", message: "Tipus eliminat permanentment" })
      })
      .catch(err => {
        console.error(err)
        setNotification({ id: Date.now(), type: "error", message: "Error en eliminar" })
      })
  }

  // --- OPERACIONES DE VALORES ---

  const handleOpenValueModal = (typeId, value = null) => {
    setSelectedTypeId(typeId)
    if (value) {
      setEditingValue(value)
      setValueForm({ value: value.value })
    } else {
      setEditingValue(null)
      setValueForm({ value: '' })
    }
    setValueErrors({})
    setShowValueModal(true)
  }

  const handleCloseValueModal = () => {
    setShowValueModal(false)
    setEditingValue(null)
    setSelectedTypeId(null)
    setValueForm({ value: '' })
    setValueErrors({})
  }

  const handleSaveValue = async (event) => {
    event.preventDefault()
    setValueLoading(true)
    setValueErrors({})

    try {
      if (editingValue) {
        await updateFeature(editingValue.id, valueForm)
        setNotification({ id: Date.now(), type: "success", message: "Valor actualitzat correctament" })
      } else {
        await createFeature({ type_id: selectedTypeId, ...valueForm })
        setNotification({ id: Date.now(), type: "success", message: "Valor creat correctament" })
      }
      fetchFeatureTypes()
      handleCloseValueModal()
    } catch (error) {
      if (error.response?.status === 422) {
        setValueErrors(error.response.data.errors)
      } else {
        setNotification({ id: Date.now(), type: "error", message: "Error en guardar el valor" })
      }
    } finally {
      setValueLoading(false)
    }
  }

  const handleToggleValue = (id, isActive) => {
    if (isActive) {
      deleteFeature(id)
        .then(() => {
          fetchFeatureTypes()
          setNotification({ id: Date.now(), type: "success", message: "Valor desactivat" })
        })
        .catch(err => {
          console.error(err)
          setNotification({ id: Date.now(), type: "error", message: "Error en desactivar" })
        })
    } else {
      restoreFeature(id)
        .then(() => {
          fetchFeatureTypes()
          setNotification({ id: Date.now(), type: "success", message: "Valor restaurat" })
        })
        .catch(err => {
          console.error(err)
          setNotification({ id: Date.now(), type: "error", message: "Error en restaurar" })
        })
    }
  }

  const handleForceDeleteValue = (id) => {
    forceDeleteFeature(id)
      .then(() => {
        fetchFeatureTypes()
        setNotification({ id: Date.now(), type: "success", message: "Valor eliminat permanentment" })
      })
      .catch(err => {
        console.error(err)
        setNotification({ id: Date.now(), type: "error", message: "Error en eliminar" })
      })
  }

  return loading ?
  <LoadingAnimation />
  : (
    <div>
      {notification && (
        <Notifications key={notification.id} type={notification.type} message={notification.message} onClose={() => setNotification(null)}/>
      )}

      {locationState && ( <Notifications type={locationState.notificationType || ""} message={locationState.notificationMessage}/>)}

      <div className='w-full flex flex-row justify-between mb-5'>
        <h1 className='text-2xl font-bold text-base-content'>Característiques</h1>
        <button onClick={() => handleOpenTypeModal()} className='btn btn-primary flex items-center gap-2'> 
          <HiPlus className="size-5" />
          Nou tipus
        </button>
      </div>

      {featureTypes.length === 0 ? (
        <div className="text-center py-10 bg-base-100 rounded-lg border border-base-300">
          <p className="text-base-content/60 mb-4">Actualment no hi ha tipus de característiques creats</p>
          <button onClick={() => handleOpenTypeModal()} className='btn btn-primary'>Crea el primer tipus!</button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {featureTypes.map((type) => (
            <div key={type.id} className="border border-base-300 bg-base-100 rounded-lg shadow-sm overflow-hidden">
              {/* Cabecera del tipo */}
              <div 
                className={`flex items-center justify-between p-4 cursor-pointer hover:bg-base-200/50`}
                onClick={() => toggleType(type.id)}
              >
                <div className="flex items-center gap-3">
                  {expandedTypes[type.id] ? (
                    <HiChevronDown className="size-5 text-base-content/60" />
                  ) : (
                    <HiChevronRight className="size-5 text-base-content/60" />
                  )}
                  <span className={`font-semibold text-lg`}>
                    {type.name}
                  </span>
                  <span className="badge badge-ghost">{type.features?.length || 0} valors</span>
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={() => handleOpenValueModal(type.id)} 
                    className="btn btn-sm btn-ghost text-primary"
                    title="Afegir valor"
                  >
                    <HiPlus className="size-4" />
                  </button>
                  <button 
                    onClick={() => handleOpenTypeModal(type)} 
                    className="btn btn-sm btn-ghost"
                    title="Editar tipus"
                  >
                    <HiPencilSquare className="size-4" />
                  </button>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-base-content/60">Actiu</span>
                    <input 
                      type="checkbox" 
                      className="toggle toggle-sm toggle-primary" 
                      checked={!type.deleted_at}
                      onChange={() => handleToggleType(type.id, !type.deleted_at)}
                    />
                  </div>
                  {type.deleted_at && (
                    <ConfirmableModal 
                      title="Eliminar tipus permanentment"  
                      message={`Segur que vols eliminar permanentment el tipus "${type.name}" i tots els seus valors? Aquesta acció no es pot desfer.`}  
                      onConfirm={() => handleForceDeleteType(type.id)}
                    >
                      <button className="btn btn-sm btn-ghost">
                        <HiTrash className="size-4 text-red-500" />
                      </button>
                    </ConfirmableModal>
                  )}
                </div>
              </div>

              {/* Valores del tipo */}
              {expandedTypes[type.id] && (
                <div className="border-t border-base-300 bg-base-200/20">
                  {type.features && type.features.length > 0 ? (
                    <div className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {type.features.map((feature) => (
                        <div 
                          key={feature.id} 
                          className={`flex items-center justify-between p-3 bg-base-100 rounded border border-base-300`}
                        >
                          <span className={``}>
                            {feature.value}
                          </span>
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => handleOpenValueModal(type.id, feature)} 
                              className="btn btn-xs btn-ghost"
                              title="Editar valor"
                            >
                              <HiPencilSquare className="size-4" />
                            </button>
                            <input 
                              type="checkbox" 
                              className="toggle toggle-xs toggle-primary" 
                              checked={!feature.deleted_at}
                              onChange={() => handleToggleValue(feature.id, !feature.deleted_at)}
                            />
                            {feature.deleted_at && (
                              <ConfirmableModal 
                                title="Eliminar valor permanentment"  
                                message={`Segur que vols eliminar permanentment el valor "${feature.value}"? Aquesta acció no es pot desfer.`}  
                                onConfirm={() => handleForceDeleteValue(feature.id)}
                              >
                                <button className="btn btn-xs btn-ghost">
                                  <HiTrash className="size-4 text-red-500" />
                                </button>
                              </ConfirmableModal>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-base-content/60">
                      <p>No hi ha valors per a aquest tipus</p>
                      <button 
                        onClick={() => handleOpenValueModal(type.id)} 
                        className="btn btn-sm btn-ghost text-primary mt-2"
                      >
                        <HiPlus className="size-4" />
                        Afegir primer valor
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal para Tipo */}
      {showTypeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editingType ? 'Editar tipus' : 'Nou tipus de característica'}</h2>
              <button onClick={handleCloseTypeModal} className="btn btn-sm btn-ghost">
                <HiXMark className="size-5" />
              </button>
            </div>
            <form onSubmit={handleSaveType}>
              <div className="mb-4">
                <label className="label text-base-content" htmlFor="typeName">Nom del tipus *</label>
                <input 
                  type="text" 
                  name="name" 
                  id='typeName' 
                  value={typeForm.name} 
                  onChange={(e) => setTypeForm({...typeForm, name: e.target.value})} 
                  placeholder="Ex: Material, Color, Mida..." 
                  className="input input-bordered w-full" 
                  required
                />
                {typeErrors.name && (
                  <p className="text-error text-sm mt-1">{typeErrors.name[0]}</p>
                )}
              </div>
              <div className="flex gap-2 justify-end">
                <button type='button' onClick={handleCloseTypeModal} className='btn btn-ghost'>Cancel·lar</button>
                <button type='submit' className='btn btn-primary' disabled={typeLoading}>
                  {typeLoading ? 'Guardant...' : (editingType ? 'Actualitzar' : 'Crear')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Valor */}
      {showValueModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editingValue ? 'Editar valor' : 'Nou valor'}</h2>
              <button onClick={handleCloseValueModal} className="btn btn-sm btn-ghost">
                <HiXMark className="size-5" />
              </button>
            </div>
            <form onSubmit={handleSaveValue}>
              <div className="mb-4">
                <label className="label text-base-content" htmlFor="valueName">Valor *</label>
                <input 
                  type="text" 
                  name="value" 
                  id='valueName' 
                  value={valueForm.value} 
                  onChange={(e) => setValueForm({...valueForm, value: e.target.value})} 
                  placeholder="Ex: Acer inoxidable, Vermell, 30mm..." 
                  className="input input-bordered w-full" 
                  required
                />
                {valueErrors.value && (
                  <p className="text-error text-sm mt-1">{valueErrors.value[0]}</p>
                )}
              </div>
              <div className="flex gap-2 justify-end">
                <button type='button' onClick={handleCloseValueModal} className='btn btn-ghost'>Cancel·lar</button>
                <button type='submit' className='btn btn-primary' disabled={valueLoading}>
                  {valueLoading ? 'Guardant...' : (editingValue ? 'Actualitzar' : 'Crear')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminFeaturesManager
