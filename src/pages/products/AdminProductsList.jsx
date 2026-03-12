import { useEffect, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { getProductsWithTrashed, deleteProduct, restoreProduct, forceDeleteProduct } from '../../api/products_api'
import LoadingAnimation from '../../components/LoadingAnimation'
import Notifications from '../../components/Notifications'
import ConfirmableModal from '../../components/ConfirmableModal'

function AdminProductsList() {
  const [products, setProducts] = useState([])
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

  // Se obtienen los productos
  useEffect(() => {
    getProductsWithTrashed()
      .then(response => setProducts(response.data))
      .catch(err => {
        console.error(err)
        setProducts([])
      })
      .finally(() => setLoading(false))
  }, [])

  const handleToggle = (id, isActive) => {
    if (isActive) {
      // Si está activo, hacer softdelete (desactivar)
      deleteProduct(id)
        .then(() => {
          getProductsWithTrashed()
            .then(response => setProducts(response.data))
          setNotification({ id: Date.now(), type: "success", message: "Producte desactivat correctament"})
        })
        .catch(err => {
          console.error(err)
          setNotification({ id: Date.now(), type: "error", message: "No s'ha pogut desactivar el producte"})
        })
    } else {
      // Si está inactivo, restaurar (activar)
      restoreProduct(id)
        .then(() => {
          getProductsWithTrashed()
            .then(response => setProducts(response.data))
          setNotification({ id: Date.now(), type: "success", message: "Producte restaurat correctament"})
        })
        .catch(err => {
          console.error(err)
          setNotification({ id: Date.now(), type: "error", message: "No s'ha pogut restaurar el producte"})
        })
    }
  }

  const handleForceDelete = (id) => {
    forceDeleteProduct(id)
      .then(() => {
        getProductsWithTrashed()
          .then(response => setProducts(response.data))
        setNotification({ id: Date.now(), type: "success", message: "Producte eliminat permanentment"})
      })
      .catch(err => {
        console.error(err)
        setNotification({ id: Date.now(), type: "error", message: "No s'ha pogut eliminar permanentment el producte"})
      })
  }

  return loading ?
  <LoadingAnimation />
  : (
    <div>
      {/* Notificaciones locales */}
      {notification && (
        <Notifications key={notification.id} type={notification.type} message={notification.message} onClose={() => setNotification(null)}/>
      )}

      {/* Se muestra la notificacion si es que hay */}
      {locationState && ( <Notifications type={locationState.notificationType || ""} title={locationState.title || ""} message={locationState.notificationMessage}/>)}
      <div className='w-full flex flex-row justify-between mb-5'>
        <h1 className='text-2xl font-bold text-base-content'>Productes</h1>
        <button onClick={() => navigate('/admin/products/new')} className='btn btn-primary flex items-center'> Nou producte</button>
      </div>
      {/* Buscador */}
      <div className='flex flex-col md:flex-row gap-4 w-full mb-5'>
          <input type="search" name="search" id="search" placeholder='Buscar producte per número, client...' className='w-full md:w-[50%] lg:w-[70%] p-2 rounded-lg bg-base-100 border border-base-300'/>

          <div className='flex flex-row gap-2 w-full md:w-[50%] lg:w-[30%]'>
            <select name="status" id="status" className='flex-1 p-2 rounded-lg bg-base-100 border border-base-300'>
                <option value="Test1">Test1</option>
                <option value="Test2">Test2</option>
            </select>

            <select name="status" id="status" className='flex-1 p-2 rounded-lg bg-base-100 border border-base-300'>
                <option value="Test1">Test1</option>
                <option value="Test2">Test2</option>
            </select>

            <button className='btn btn-secondary flex-1 border-base-300 bg-transparent px-1'>
                Descargar
            </button>
          </div>
      </div>
      {/* Tabla de productos */}
      <div className="overflow-x-auto border border-base-300 bg-base-100 rounded-lg shadow-md">
        <table className="table">
          <thead>
              <tr className='text-neutral'>
                  <th>Imatge</th>
                  <th>Producte</th>
                  <th>Codi</th>
                  <th>Categoria</th>
                  <th className='text-right'>Preu</th>
                  <th className='text-center'>Estoc</th>
                  <th className='text-center'>Estat</th>
                  <th className='text-center'>Accions</th>
              </tr>
          </thead>
          <tbody>
            {products.length > 0 ? products.map((product) => (
              <tr key={product.id} className='hover:bg-[#F9F6F5]'>
                <td className='border-base-300'>
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      <div className={`mask h-12 w-12 rounded-lg ${product.images?.[0] ? "" : "flex items-center justify-center bg-primary/15"}`}>
                        {/* Se muestra la imagen del producto y si no tiene se muestra un svg */}
                        {product.images?.[0] ? <img src={`http://127.0.0.1:8000/storage/${product.images[0].path}`} alt="Imagen" /> : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-base-400"> <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /> </svg>}
                      </div>
                    </div>
                  </div>
                </td>
                <td className='border-base-300'>{product.name || '-'}</td>
                <td className='border-base-300 text-base-400'>{product.code || '-'}</td>
                <td className='border-base-300'>{product.category?.name || '-'}</td>
                <td className='border-base-300 text-right'>{product.price || '-'}€</td>
                <td className='border-base-300 text-center'>{product.stock || '-'}</td>
                <td className='border-base-300'>
                  <div className='flex justify-center'>
                    <input 
                      type="checkbox" 
                      className="toggle toggle-primary" 
                      checked={!product.deleted_at}
                      onChange={() => handleToggle(product.id, !product.deleted_at)}
                    />
                  </div>
                </td>
                <td className='border-base-300'>
                  <div className='flex items-center justify-center gap-3'>
                    {product.deleted_at ? (
                      <>
                        <ConfirmableModal title="Eliminar producte permanentment"  message={`Segur que vols eliminar permanentment el producte "${product.name}"? Aquesta acció no es pot desfer.`}  onConfirm={() => handleForceDelete(product.id)}>
                          <button className="text-base-400 hover:text-error-content transition-colors cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                          </button>
                        </ConfirmableModal>
                      </>
                    ) : (
                      <>
                        <button onClick={() => navigate(`/admin/products/${product.id}/show`)} className="text-base-400 hover:text-primary transition-colors cursor-pointer">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          </svg>
                        </button>
                        <button onClick={() => navigate(`/admin/products/${product.id}/edit`)} className="text-base-400 hover:text-primary transition-colors cursor-pointer">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )) :
              <tr>
                <td colSpan={8} className='p-6'>
                  <div className='w-full flex justify-center items-center gap-2'>
                    <p>Actualment no hi ha productes creats</p>
                    <Link to="/admin/products/new" className='text-primary'>crea'n un de nou!</Link>
                  </div>
                </td>
              </tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
export default AdminProductsList
