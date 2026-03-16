import { HiArrowRight } from 'react-icons/hi'
import { FiHeadphones, FiShield, FiTruck } from 'react-icons/fi'
import { useEffect, useState } from 'react'
import { getImportantProducts } from '../api/products_api'
import { getImportantCategories } from "../api/categories_api";
import ProductCard from '../components/ProductCard'
import CategoryCard from '../components/CategoryCard'
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'
function Home() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [importantProducts, setImportantProducts] = useState([])
  const [importantCategories, setImportantCategories] = useState([])

  useEffect(() => {
    const fetchProducts = async () => {
      const products = await getImportantProducts()
      setImportantProducts(products.data)
    }

    const fetchCategories = async () => {
      const categories = await getImportantCategories()
      setImportantCategories(categories.data)
    }

    fetchProducts()
    fetchCategories()
  }, [])
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-base-200 pt-4">
      {/* Botones de autenticacion temporales */}
      <div className="flex items-center gap-2 mb-4 ml-auto mr-4">
        {user 
          ? (
            <>
              <button className="btn btn-sm btn-primary" onClick={() => navigate('/dashboard')}>
                Panell d'Administració
              </button>
              <button className="btn btn-sm btn-error" onClick={() => {
                logout()
                navigate('/')
              }}>
                Tancar Sessió
              </button>
            </>
          ) : (
            <button className="btn btn-sm btn-primary" onClick={() => navigate('/login')}>
              Iniciar Sessió
            </button>
          )}
      </div>
      
      <div className='flex flex-col items-center justify-center'>
        <div className="w-full max-w-390 px-4 py-6">
          <div className="grid gap-10 bg-base-200 lg:grid-cols-2 lg:items-center">
            <div className="max-w-4xl pt-4 lg:pl-10 lg:pt-8">
              <h1 className="max-w-4xl text-[40px] leading-none font-black tracking-tight sm:text-6xl lg:text-7xl">
                <span className="block xl:whitespace-nowrap">
                  El mejor <span className="text-primary">servicio</span>
                </span>
                <span className="block">en un solo lugar</span>
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-6 md:leading-8 text-base-400 sm:text-2xl">
                Descubre nuestra seleccion de herramientas y materiales de ferreteria profesional. Calidad garantizada al mejor precio
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link to='/products' type="button" className="btn btn-primary h-12">
                  <p>Ver productos</p>
                  <HiArrowRight className="h-5 w-5" />
                </Link>

                <Link to='/categories' type="button" className="btn btn-secondary h-12">
                  <p>Ver categorias</p>
                  <HiArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>

            <div className="w-full lg:justify-self-end">
              <img src="http://127.0.0.1:8000/storage/images/imagen_principal.png" alt="Cerrajero trabajando en una puerta" className="block h-72 rounded-lg w-full max-w-full object-cover sm:h-80 lg:h-96"/>
            </div>
          </div>

          <div className="mt-8 grid overflow-hidden border-y border-base-300 bg-base-100 md:grid-cols-3">
            <div className="flex items-center gap-5 border-b border-base-300 px-6 py-7 md:border-r md:border-b-0 md:px-10 lg:gap-6">
              <FiTruck className="h-9 w-9 shrink-0 text-primary" strokeWidth={1.8} />
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Envio gratuito</h2>
                <p className="mt-1 text-sm text-base-300">En pedidos de mas de 60 €</p>
              </div>
            </div>

            <div className="flex items-center gap-5 border-b border-base-300 px-6 py-7 md:border-r md:border-b-0 md:px-10 lg:gap-6">
              <FiShield className="h-9 w-9 shrink-0 text-primary" strokeWidth={1.8} />
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Garantia de calidad</h2>
                <p className="mt-1 text-sm text-base-300">Todos los productos de alta calidad</p>
              </div>
            </div>
            <div className="flex items-center gap-5 px-6 py-7 md:px-10 lg:gap-6">
              <FiHeadphones className="h-9 w-9 shrink-0 text-primary" strokeWidth={1.8} />
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Atencion experta</h2>
                <p className="mt-1 text-sm text-base-300">Atencion profesional de calidad</p>
              </div>
            </div>
          </div>

          <div className="px-0 py-12 sm:py-16 lg:px-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-lg font-medium uppercase tracking-wide text-primary">Lo mas destacado</p>
                <h2 className="mt-1 text-3xl font-medium tracking-tight sm:text-3xl">Productos Destacados</h2>
              </div>

              <button onClick={() => navigate("/products")} type="button" className="hidden items-center gap-2 text-lg font-medium text-primary md:flex">
                Ver todos
                <HiArrowRight className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              { importantProducts.length > 0 ? importantProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              )) :
              <p className='col-span-full font-semibold text-2xl'>Actualmente no hay productos destacados</p>
              }
            </div>

            <button type="button" className="mt-6 flex items-center gap-2 text-lg font-medium text-primary md:hidden">
              Ver todos
              <HiArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      {/* Banner naranja */}
      <div className='w-full bg-primary py-10 flex items-center justify-center shadow-lg'>
        <h3 className='text-base-100 text-lg md:text-2xl italic font-sans text-center'>La llave de tu tranquilidad, a un solo clic</h3>
      </div>

      {/* Categorias */}
      <div className='flex flex-col items-center justify-center w-full px-4 py-6'>
        <div className="w-full max-w-390 px-0 py-12 sm:py-16 lg:px-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-lg font-medium uppercase tracking-wide text-primary">Explora nuestro catalogo</p>
              <h2 className="mt-1 text-3xl font-medium tracking-tight sm:text-3xl">Categorias principales</h2>
            </div>

            <button type="button" className="hidden items-center gap-2 text-lg font-medium text-primary md:flex">
              Ver todas
              <HiArrowRight className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {importantCategories.length > 0 ? importantCategories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            )) : (
              <p className="col-span-full text-2xl font-semibold">Actualmente no hay categorias destacadas</p>
            )}
          </div>

          <button type="button" className="mt-6 flex items-center gap-2 text-lg font-medium text-primary md:hidden">
            Ver todas
            <HiArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Banner naranja de contacto */}
      <div className='w-full bg-primary py-10 flex flex-col items-center justify-center gap-5 shadow-lg mb-10'>
        <h3 className='text-base-100 text-2xl md:text-3xl font-bold text-center'>Contacta con nosotros ahora</h3>
        <p className='text-base-100 text-lg w-90 text-center'>Contacta con nosotros ahora, somos especialistas en cerrajeria</p>

        <button className='btn btn-secondary text-md rounded-full'>Contacta con nosotros ahora</button>
      </div>

    </div>
  )
}

export default Home
