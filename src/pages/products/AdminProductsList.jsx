import { useEffect, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { getProductsWithTrashed, deleteProduct, restoreProduct, forceDeleteProduct } from '../../api/products_api'
import LoadingAnimation from '../../components/LoadingAnimation'
import Notifications from '../../components/Notifications'
import ConfirmableModal from '../../components/ConfirmableModal'
import { HiPhoto, HiTrash, HiPencilSquare, HiEye } from 'react-icons/hi2'

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
            {products.length > 0 ? products.map((product) => {
              const importantImage = product.images?.find((image) => image.is_important == 1)
              return (
              <tr key={product.id} className='hover:bg-[#F9F6F5]'>
                <td className='border-base-300'>
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      <div className={`mask h-12 w-12 rounded-lg ${product.images?.[0] ? "" : "flex items-center justify-center bg-primary/10"}`}>
                        {/* Se muestra la imagen del producto y si no tiene se muestra un svg */}
                        {importantImage ? <img src={`/storage/${importantImage.path}`} alt="Imagen" /> : product.images?.[0] ?  <img src={`/storage/${product.images?.[0].path}`} alt="Imagen" /> : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-base-400"> <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /> </svg>}
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
                            <HiTrash className="size-6" />
                          </button>
                        </ConfirmableModal>
                      </>
                    ) : (
                      <>
                        <button onClick={() => navigate(`/admin/products/${product.id}/show`)} className="text-base-400 hover:text-primary transition-colors cursor-pointer">
                          <HiEye className="size-6" />
                        </button>
                        <button onClick={() => navigate(`/admin/products/${product.id}/edit`)} className="text-base-400 hover:text-primary transition-colors cursor-pointer">
                          <HiPencilSquare className="size-6" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )}) :
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
