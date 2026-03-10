import { useEffect, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { getProducts } from '../../api/products_api'
import LoadingAnimation from '../../components/LoadingAnimation'
import Notifications from '../../components/Notifications'
import { HiPhoto, HiEye, HiPencilSquare } from 'react-icons/hi2'

function AdminProductsList() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
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
    getProducts()
      .then(response => setProducts(response.data))
      .catch(err => {
        console.error(err)
        setProducts([])
      })
      .finally(() => setLoading(false))
  }, [])

  return loading ?
  <LoadingAnimation />
  : (
    <div>
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
                  <th>Estat</th>
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
                        {product.images[0] ? <img src={`http://127.0.0.1:8000/storage/${product.images[0].path}`} alt="Imagen" /> : <HiPhoto className="size-6 text-base-400" />}
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
                  <p className={`p-1 text-center border rounded-lg w-24 font-medium ${product.is_active == null ? "" : product.is_active == 1 ? "bg-success text-success-content" : "bg-error text-error-content"}`}>{product.is_active == null ? "-" : product.is_active == 1 ? "Actiu" : "Inactiu"}</p>
                </td>
                <td className='border-base-300'>
                  <div className='flex items-center justify-center gap-3'>
                    <button onClick={() => navigate(`/admin/products/${product.id}/show`)} className="text-base-400 hover:text-primary transition-colors cursor-pointer">
                      <HiEye className="size-6" />
                    </button>
                    <button onClick={() => navigate(`/admin/products/${product.id}/edit`)} className="text-base-400 hover:text-primary transition-colors cursor-pointer">
                      <HiPencilSquare className="size-6" />
                    </button>
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
