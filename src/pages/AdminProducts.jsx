import { useEffect, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { getProducts } from '../api/products_api'
import LoadingAnimation from '../components/LoadingAnimation'
import Notifications from '../components/Notifications'

function AdminProducts() {
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
        <h1 className='text-2xl font-bold text-base-content'>Productos</h1>
        <button onClick={() => navigate('/admin/products/new')} className='btn btn-primary flex items-center'> Nuevo producto</button>
      </div>
      {/* Buscador */}
      <div className='flex flex-col md:flex-row gap-4 w-full mb-5'>
          <input type="search" name="search" id="search" placeholder='Buscar pedido por numero, cliente...' className='w-full md:w-[50%] lg:w-[70%] p-2 rounded-lg bg-base-100 border border-base-300'/>

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
                  <th>Imagen</th>
                  <th>Producto</th>
                  <th>Codigo</th>
                  <th>Categoria</th>
                  <th className='text-right'>Precio</th>
                  <th className='text-center'>Stock</th>
                  <th>Estado</th>
                  <th className='text-center'>Acciones</th>
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
                        {product.images[0] ? <img src={`http://127.0.0.1:8000/storage/${product.images[0].path}`} alt="Imagen" /> : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-base-400"> <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /> </svg>}
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
                  </div>
                </td>
              </tr>
            )) :
              <tr>
                <td colSpan={8} className='p-6'>
                  <div className='w-full flex justify-center items-center gap-2'>
                    <p>Actualmente no hay productos creados</p>
                    <Link to="/admin/products/new" className='text-primary'>crea uno nuevo!</Link>
                  </div>
                </td>
              </tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
export default AdminProducts
