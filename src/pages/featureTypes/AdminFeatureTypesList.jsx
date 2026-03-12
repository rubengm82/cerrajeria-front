import { useEffect, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { getFeatureTypesWithTrashed, deleteFeatureType, restoreFeatureType, forceDeleteFeatureType } from '../../api/features_api'
import LoadingAnimation from '../../components/LoadingAnimation'
import Notifications from '../../components/Notifications'
import ConfirmableModal from '../../components/ConfirmableModal'
import { HiTrash, HiPencilSquare, HiPhoto } from 'react-icons/hi2'

function AdminFeatureTypesList() {
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
    getFeatureTypesWithTrashed()
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

  const handleToggle = (id, isActive) => {
    if (isActive) {
      // Si está activa, hacer softdelete (desactivar)
      deleteFeatureType(id)
        .then(() => {
          fetchTypes()
          setNotification({ id: Date.now(), type: "success", message: "Tipus de caracteristica desactivat correctament"})
        })
        .catch(err => {
          console.error(err)
          setNotification({ id: Date.now(), type: "error", message: "No s'ha pogut desactivar el tipus de caracteristica"})
        })
    } else {
      // Si está inactiva, restaurar (activar)
      restoreFeatureType(id)
        .then(() => {
          fetchTypes()
          setNotification({ id: Date.now(), type: "success", message: "Tipus de caracteristica restaurat correctament"})
        })
        .catch(err => {
          console.error(err)
          setNotification({ id: Date.now(), type: "error", message: "No s'ha pogut restaurar el tipus de caracteristica"})
        })
    }
  }

  const handleForceDelete = (id) => {
    forceDeleteFeatureType(id)
      .then(() => {
        fetchTypes()
        setNotification({ id: Date.now(), type: "success", message: "Tipus de caracteristica eliminat permanentment"})
      })
      .catch(err => {
        console.error(err)
        setNotification({ id: Date.now(), type: "error", message: "No s'ha pogut eliminar permanentment el tipus de caracteristica"})
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
        <h1 className='text-2xl font-bold text-base-content'>Tipus de Característiques</h1>
        <button onClick={() => navigate('/admin/feature-types/new')} className='btn btn-primary flex items-center'> Nou tipus</button>
      </div>

      <div className='flex flex-col md:flex-row gap-4 w-full mb-5'>
          <input type="search" name="search" id="search" placeholder='Buscar tipus per nom...' className='w-full p-2 rounded-lg bg-base-100 border border-base-300'/>
      </div>

      <div className="overflow-x-auto border border-base-300 bg-base-100 rounded-lg shadow-md">
        <table className="table">
          <thead>
              <tr className='text-neutral'>
                  <th>Nom</th>
                  <th className='text-center'>Estat</th>
                  <th className='text-center'>Accions</th>
              </tr>
          </thead>
          <tbody>
            {types.length > 0 ? types.map((type) => (
              <tr key={type.id} className='hover:bg-base-200/30'>
                <td className='border-base-300 font-medium'>{type.name || '-'}</td>
                <td className='border-base-300'>
                  <div className='flex justify-center'>
                    <input 
                      type="checkbox" 
                      className="toggle toggle-primary" 
                      checked={!type.deleted_at}
                      onChange={() => handleToggle(type.id, !type.deleted_at)}
                    />
                  </div>
                </td>
                <td className='border-base-300'>
                  <div className='flex items-center justify-center gap-3'>
                    {type.deleted_at ? (
                      <>
                        <ConfirmableModal title="Eliminar tipus permanentment"  message={`Segur que vols eliminar permanentment el tipus de caracteristica "${type.name}"? Aquesta acció no es pot desfer.`}  onConfirm={() => handleForceDelete(type.id)}>
                          <button className="text-base-400 hover:text-error-content transition-colors cursor-pointer">
                            <HiTrash className="size-6" />
                          </button>
                        </ConfirmableModal>
                      </>
                    ) : (
                      <button onClick={() => navigate(`/admin/feature-types/${type.id}/edit`)} className="text-base-400 hover:text-primary transition-colors cursor-pointer">
                        <HiPencilSquare className="size-6" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )) :
              <tr>
                <td colSpan={3} className='p-6'>
                  <div className='w-full flex justify-center items-center gap-2'>
                    <p>Actualment no hi ha tipus de caracteristiques creats</p>
                    <Link to="/admin/feature-types/new" className='text-primary'>crea'n un de nou!</Link>
                  </div>
                </td>
              </tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminFeatureTypesList
