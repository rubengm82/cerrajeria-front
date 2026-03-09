import { useEffect, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { getFeatures, deleteFeature } from '../../api/features_api'
import LoadingAnimation from '../../components/LoadingAnimation'
import Notifications from '../../components/Notifications'
import ConfirmableModal from '../../components/ConfirmableModal'

function AdminFeatures() {
  const [features, setFeatures] = useState([])
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

  const fetchFeatures = () => {
    setLoading(true)
    getFeatures()
      .then(response => setFeatures(response.data))
      .catch(err => {
        console.error(err)
        setFeatures([])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchFeatures()
  }, [])

  const handleDelete = (id) => {
    deleteFeature(id)
      .then(() => {
        fetchFeatures()
        setNotification({ type: "success", message: "Característica eliminada correctamente"})
      })
      .catch(err => {
        console.error(err)
        setNotification({ type: "error", message: "No se pudo eliminar la característica"})
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
        <h1 className='text-2xl font-bold text-base-content'>Características</h1>
        <button onClick={() => navigate('/admin/features/new')} className='btn btn-primary flex items-center'> Nueva característica</button>
      </div>

      <div className='flex flex-col md:flex-row gap-4 w-full mb-5'>
          <input type="search" name="search" id="search" placeholder='Buscar por valor o tipo (Ej: Acero, Color...)' className='w-full p-2 rounded-lg bg-base-100 border border-base-300'/>
      </div>

      <div className="overflow-x-auto border border-base-300 bg-base-100 rounded-lg shadow-md">
        <table className="table">
          <thead>
              <tr className='text-neutral'>
                  <th>Tipo</th>
                  <th>Valor</th>
                  <th className='text-center'>Acciones</th>
              </tr>
          </thead>
          <tbody>
            {features.length > 0 ? features.map((feature) => (
              <tr key={feature.id} className='hover:bg-base-200/30'>
                <td className='border-base-300 font-medium'>{feature.type?.name || '-'}</td>
                <td className='border-base-300'>{feature.value || '-'}</td>
                <td className='border-base-300'>
                  <div className='flex items-center justify-center gap-3'>
                    <button onClick={() => navigate(`/admin/features/${feature.id}/edit`)} className="text-base-400 hover:text-primary transition-colors cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                      </svg>
                    </button>

                    <ConfirmableModal title="Eliminar característica"  message={`¿Estás seguro de que quieres eliminar la característica "${feature.value}"? Esta acción no se puede deshacer.`}  onConfirm={() => handleDelete(feature.id)}>
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
                <td colSpan={3} className='p-6'>
                  <div className='w-full flex justify-center items-center gap-2'>
                    <p>Actualmente no hay características creadas</p>
                    <Link to="/admin/features/new" className='text-primary'>crea una nueva!</Link>
                  </div>
                </td>
              </tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminFeatures
