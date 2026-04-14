import { useEffect, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { getCategoriesWithTrashed, deleteCategory, restoreCategory, forceDeleteCategory } from '../../api/categories_api'
import LoadingAnimation from '../../components/LoadingAnimation'
import Notifications from '../../components/Notifications'
import ConfirmableModal from '../../components/ConfirmableModal'
import { HiPhoto, HiTrash, HiPencilSquare } from 'react-icons/hi2'

function AdminCategoriesList() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState(null)
  const navigate = useNavigate()

  // Se obtiene la notificacion del historial si es que hay
  const location = useLocation()
  const locationState = location.state

  // Se limpia el historial despues de mostrar una notificacion
  useEffect(() => {
    if (locationState) {
      window.history.replaceState({}, document.title)
    }
  }, [locationState])

  // Se obtienen las categorias
  useEffect(() => {
    getCategoriesWithTrashed()
      .then(response => {
        setCategories(response.data)
      })
      .catch(err => {
        console.error(err)
        setCategories([])
      })
      .finally(() => setLoading(false))
  }, [])

  const handleToggle = (id, isActive) => {
    if (isActive) {
      // Si está activa, hacer softdelete (desactivar)
      deleteCategory(id)
        .then(() => {
          getCategoriesWithTrashed()
            .then(response => {
              setCategories(response.data)
            })
          setNotification({ id: Date.now(), type: "success", message: "Categoria desactivada correctament"})
        })
        .catch(err => {
          console.error(err)
          setNotification({ id: Date.now(), type: "error", message: "No s'ha pogut desactivar la categoria"})
        })
    } else {
      // Si está inactiva, restaurar (activar)
      restoreCategory(id)
        .then(() => {
          getCategoriesWithTrashed()
            .then(response => {
              setCategories(response.data)
            })
          setNotification({ id: Date.now(), type: "success", message: "Categoria restaurada correctament"})
        })
        .catch(err => {
          console.error(err)
          setNotification({ id: Date.now(), type: "error", message: "No s'ha pogut restaurar la categoria"})
        })
    }
  }

  const handleForceDelete = (id) => {
    forceDeleteCategory(id)
      .then(() => {
        getCategoriesWithTrashed()
          .then(response => {
            setCategories(response.data)
          })
        setNotification({ id: Date.now(), type: "success", message: "Categoria eliminada permanentment"})
      })
      .catch(err => {
        console.error(err)
        setNotification({ id: Date.now(), type: "error", message: "No s'ha pogut eliminar permanentment la categoria"})
      })
  }

  return loading ?
  <LoadingAnimation />
  : (
    <div>
      {/* Notificaciones locales (borrado) */}
      {notification && (
        <Notifications key={notification.id} type={notification.type} title={notification.title} message={notification.message} onClose={() => setNotification(null)}/>
      )}

      {/* Se muestra la notificacion si es que hay del router */}
      {locationState && ( <Notifications type={locationState.notificationType || ""} title={locationState.title || ""} message={locationState.notificationMessage}/>)}

      <div className='w-full flex flex-row justify-between mb-5'>
        <h1 className='text-2xl font-bold text-base-content'>Categories</h1>
        <button onClick={() => navigate('/admin/categories/new')} className='btn btn-primary flex items-center'> Nova categoria</button>
      </div>

      {/* Tabla de categorías */}
      <div className="overflow-x-auto border border-base-300 bg-base-100 rounded-lg shadow-md">
        <table className="table">
          <thead>
              <tr className='text-neutral'>
                  <th>Imatge</th>
                  <th>Nom</th>
                  <th className='text-center'>Estat</th>
                  <th className='text-center'>Accions</th>
              </tr>
          </thead>
          <tbody>
            {categories.length > 0 ? categories.map((category) => (
              <tr key={category.id} className='hover:bg-[#F9F6F5]'>
                <td className='border-base-300'>
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      <div className={`mask h-12 w-12 rounded-lg ${category.image ? "" : "flex items-center justify-center bg-primary/15"}`}>
                        {category.image ? <img src={`/storage/${category.image}`} alt={category.name} /> : <HiPhoto className="size-6 text-base-400" />}
                      </div>
                    </div>
                  </div>
                </td>
                <td className='border-base-300 font-medium'>{category.name || ''}</td>
                <td className='border-base-300'>
                  <div className='flex justify-center'>
                    <input 
                      type="checkbox" 
                      className="toggle toggle-primary" 
                      checked={!category.deleted_at}
                      onChange={() => handleToggle(category.id, !category.deleted_at)}
                    />
                  </div>
                </td>
                <td className='border-base-300'>
                  <div className='flex items-center justify-center gap-3'>
                    {category.deleted_at ? (
                      <>
                        <ConfirmableModal title="Eliminar categoria permanentment"  message={`Segur que vols eliminar permanentment la categoria "${category.name}"? Aquesta acció no es pot desfer.`}  onConfirm={() => handleForceDelete(category.id)}>
                          <button className="text-base-400 hover:text-error-content transition-colors cursor-pointer">
                            <HiTrash className="size-6" />
                          </button>
                        </ConfirmableModal>
                      </>
                    ) : (
                      <button onClick={() => navigate(`/admin/categories/${category.id}/edit`)} className="text-base-400 hover:text-primary transition-colors cursor-pointer">
                        <HiPencilSquare className="size-6" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )) :
              <tr>
                <td colSpan={4} className='p-6'>
                  <div className='w-full flex justify-center items-center gap-2'>
                    <p>Actualment no hi ha categories creades</p>
                    <Link to="/admin/categories/new" className='text-primary'>crea'n una de nova!</Link>
                  </div>
                </td>
              </tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminCategoriesList
