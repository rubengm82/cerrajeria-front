import { useEffect, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { getFeatureTypes, deleteFeatureType } from '../../api/features_api'
import LoadingAnimation from '../../components/LoadingAnimation'
import Notifications from '../../components/Notifications'
import ConfirmableModal from '../../components/ConfirmableModal'

function AdminFeatureTypes() {
  const [types, setTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState(null)
  const navigate = useNavigate()

  const location = useLocation()
  const locationState = location.state

  useEffect(() => {
    if (locationState) {
      window.history.replaceState({}, document.title)
    }
  }, [locationState])

  const fetchTypes = () => {
    setLoading(true)
    getFeatureTypes()
      .then(response => setTypes(response.data))
      .catch(err => {
        console.error(err)
        setTypes([])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchTypes()
  }, [])

  const handleDelete = (id) => {
    deleteFeatureType(id)
      .then(() => {
        fetchTypes()
        setNotification({ type: "success", message: "Tipo de característica eliminado correctamente"})
      })
      .catch(err => {
        console.error(err)
        setNotification({ type: "error", message: "No se pudo eliminar el tipo de característica"})
      })
  }

  return loading ?
  <LoadingAnimation />
  : (
    <div>
      {notification && (
        <Notifications type={notification.type} message={notification.message} onClose={() => setNotification(null)}/>
      )}

      {locationState && ( <Notifications type={locationState.notificationType || ""} message={locationState.notificationMessage}/>)}

      <div className='w-full flex flex-row justify-between mb-5'>
        <h1 className='text-2xl font-bold text-base-content'>Tipos de Características</h1>
        <button onClick={() => navigate('/admin/feature-types/new')} className='btn btn-primary flex items-center'> Nuevo tipo</button>
      </div>

      <div className='flex flex-col md:flex-row gap-4 w-full mb-5'>
          <input type="search" name="search" id="search" placeholder='Buscar tipo por nombre...' className='w-full p-2 rounded-lg bg-base-100 border border-base-300'/>
      </div>

      <div className="overflow-x-auto border border-base-300 bg-base-100 rounded-lg shadow-md">
        <table className="table">
          <thead>
              <tr className='text-neutral'>
                  <th>Nombre</th>
                  <th className='text-center'>Acciones</th>
              </tr>
          </thead>
          <tbody>
            {types.length > 0 ? types.map((type) => (
              <tr key={type.id} className='hover:bg-base-200/30'>
                <td className='border-base-300 font-medium'>{type.name || '-'}</td>
                <td className='border-base-300'>
                  <div className='flex items-center justify-center gap-3'>
                    <button onClick={() => navigate(`/admin/feature-types/${type.id}/edit`)} className="text-base-400 hover:text-primary transition-colors cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                      </svg>
                    </button>

                    <ConfirmableModal title="Eliminar tipo"  message={`¿Estás seguro de que quieres eliminar el tipo de característica "${type.name}"? Esta acción no se puede deshacer.`}  onConfirm={() => handleDelete(type.id)}>
                      <button className="text-base-400 hover:text-error-content transition-colors cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    </ConfirmableModal>
                  </div>
                </td>
              </tr>
            )) :
              <tr>
                <td colSpan={2} className='p-6'>
                  <div className='w-full flex justify-center items-center gap-2'>
                    <p>Actualmente no hay tipos de características creados</p>
                    <Link to="/admin/feature-types/new" className='text-primary'>crea uno nuevo!</Link>
                  </div>
                </td>
              </tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminFeatureTypes
