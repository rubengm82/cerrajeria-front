import { useEffect, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { getFeatures, deleteFeature } from '../../api/features_api'
import LoadingAnimation from '../../components/LoadingAnimation'
import Notifications from '../../components/Notifications'
import ConfirmableModal from '../../components/ConfirmableModal'
import { HiPencilSquare, HiTrash } from 'react-icons/hi2'

function AdminFeaturesList() {
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
        setNotification({ type: "success", message: "Caracteristica eliminada correctament"})
      })
      .catch(err => {
        console.error(err)
        setNotification({ type: "error", message: "No s'ha pogut eliminar la caracteristica"})
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
        <h1 className='text-2xl font-bold text-base-content'>Característiques</h1>
        <button onClick={() => navigate('/admin/features/new')} className='btn btn-primary flex items-center'>Nou valor de Caracteristica</button>
      </div>

      <div className='flex flex-col md:flex-row gap-4 w-full mb-5'>
          <input type="search" name="search" id="search" placeholder='Buscar per valor o tipus (Ex: Acer, Color...)' className='w-full p-2 rounded-lg bg-base-100 border border-base-300'/>
      </div>

      <div className="overflow-x-auto border border-base-300 bg-base-100 rounded-lg shadow-md">
        <table className="table">
          <thead>
              <tr className='text-neutral'>
                  <th>Tipus</th>
                  <th>Valor</th>
                  <th className='text-center'>Accions</th>
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
                      <HiPencilSquare className="size-6" />
                    </button>

                    <ConfirmableModal title="Eliminar caracteristica"  message={`Segur que vols eliminar la caracteristica "${feature.value}"? Aquesta acció no es pot desfer.`}  onConfirm={() => handleDelete(feature.id)}>
                      <button className="text-base-400 hover:text-error-content transition-colors cursor-pointer">
                        <HiTrash className="size-6" />
                      </button>
                    </ConfirmableModal>
                  </div>
                </td>
              </tr>
            )) :
              <tr>
                <td colSpan={3} className='p-6'>
                  <div className='w-full flex justify-center items-center gap-2'>
                    <p>Actualment no hi ha caracteristiques creades</p>
                    <Link to="/admin/features/new" className='text-primary'>crea'n una de nova!</Link>
                  </div>
                </td>
              </tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminFeaturesList
