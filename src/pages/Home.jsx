import { HiArrowRight } from 'react-icons/hi'
import { FiHeadphones, FiShield, FiTruck } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getImportantProducts } from '../api/products_api'
function Home() {
  const navigate = useNavigate()
  const [importantProducts, setImportantProducts] = useState([])

  useEffect(() => {
    const fetchProducts = async () => {
      const products = await getImportantProducts()
      setImportantProducts(products.data)
    }

    fetchProducts()
  }, [])
  return (
    <div className=" bg-base-200">
      <div className='flex flex-col items-center justify-center'>
        <div className="max-w-390 px-4 py-6">
          <div className="grid gap-10 bg-base-200 lg:grid-cols-2 lg:items-center">
            <div className="max-w-4xl pt-4 lg:pl-10 lg:pt-8">
              <h1 className="max-w-4xl text-5xl leading-none font-black tracking-tight sm:text-6xl lg:text-7xl">
                <span className="block whitespace-nowrap">
                  El mejor <span className="text-primary">servicio</span>
                </span>
                <span className="block">en un solo lugar</span>
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-base-400 sm:text-2xl">
                Descubre nuestra seleccion de herramientas y materiales de ferreteria profesional. Calidad garantizada al mejor precio
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <button type="button" className="btn btn-primary h-12">
                  <p>Ver productos</p>
                  <HiArrowRight className="h-5 w-5" />
                </button>

                <button type="button" className="btn btn-secondary h-12">
                  <p>Ver categorias</p>
                  <HiArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="lg:justify-self-end">
              <div className="overflow-hidden rounded-2xl bg-stone-300">
                <img src="http://127.0.0.1:8000/storage/images/imagen_principal.png" alt="Cerrajero trabajando en una puerta" className="h-72 w-full object-cover sm:h-80 lg:h-96 lg:w-xl"/>
              </div>
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
                <h2 className="mt-1 text-4xl font-medium tracking-tight sm:text-3xl">Productos Destacados</h2>
              </div>

              <button type="button" className="hidden items-center gap-2 text-lg font-medium text-primary md:flex">
                Ver todos
                <HiArrowRight className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {importantProducts.map((product) => (
                <article className="overflow-hidden rounded-2xl border border-base-300 bg-white shadow-sm">
                  <div className="relative h-56 overflow-hidden rounded-t-3xl bg-neutral-100 flex items-center justify-center">
                    <div className="absolute top-3 left-3 z-10 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
                      <p>-30%</p>
                    </div>
                    <img src={`http://127.0.0.1:8000/storage/${product.images[0].path}`} alt="" className='w-full h-full object-cover' />
                  </div>

                  <div className="px-4 pb-4 pt-3">
                    <p className="text-xs font-medium uppercase tracking-wider text-base-300">{product.category.name}</p>
                    <h3 className="mt-2 text-[20px] leading-6 font-medium hover:text-primary">{product.name}</h3>
                    <div className="mt-1 flex items-center gap-1 text-primary">
                      <span className="text-sm tracking-wider">★★★★★</span>
                      <span className="ml-1 text-xs text-base-300">(128)</span>
                    </div>
                    <p className="mt-2 leading-5 text-base-300 w-full">{product.description}</p>
                    <div className="mt-4 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-xl font-bold tracking-tight">{product.price}€</p>
                        <p className="text-xs text-base-300 line-through">139 €</p>
                      </div>
                      <button type="button" className="btn h-9 min-h-9 rounded-full border-0 bg-primary px-4 text-xs font-medium text-white shadow-none">
                        Comprar
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <button type="button" className="mt-6 flex items-center gap-2 text-lg font-medium text-primary md:hidden">
              Ver todos
              <HiArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      <div className='w-full bg-primary'>
        <p>Funciona</p>
      </div>
    </div>
  )
}

export default Home
