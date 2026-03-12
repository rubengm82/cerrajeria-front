import { HiArrowRight } from 'react-icons/hi'
import { FiHeadphones, FiShield, FiTruck } from 'react-icons/fi'
import { useEffect, useState } from 'react'
import { getImportantProducts } from '../api/products_api'
function Home() {
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
                <article key={product.id} className="flex flex-col overflow-hidden rounded-2xl border border-base-300 bg-white shadow-sm">
                  <div className="group relative h-56 shrink-0 overflow-hidden bg-neutral-100 flex items-center justify-center ">
                    {product.discount > 0 && (
                      <div className="absolute top-3 left-3 z-10 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-white duration-700 group-hover:blur-[2px]">
                        <p>-{parseInt(product.discount)}%</p>
                      </div>
                    )}
                    <div className='relative'>
                      <img src={`http://127.0.0.1:8000/storage/${product.images[0].path}`} alt={product.name} className="w-full h-full object-cover aspect-square transition-all duration-700 group-hover:scale-110 group-hover:blur-[2px]"/>

                      {/* Se muestran los iconos de ver y añadir al carrito */}
                      <div className='absolute inset-0 flex items-center justify-center gap-7 opacity-0 translate-y-8 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-700'>
                        <button className='bg-white rounded-full p-4 hover:bg-white/80 cursor-pointer transition-all'>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-black">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          </svg>
                        </button>

                        <button className='bg-primary rounded-full p-4 shadow-lg hover:bg-primary/80 cursor-pointer transition-all'>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-white">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
                    <p className="text-xs font-medium uppercase tracking-wider text-base-400">{product.category.name}</p>
                    <h3 className="mt-2 text-[20px] leading-6 font-medium hover:text-primary cursor-pointer transition-all wrap-break-word">{product.name}</h3>

                    <p className="mt-2 leading-5 text-base-300 w-full wrap-break-word whitespace-normal text-sm">
                      {product.description && product.description.length > 70 ? product.description.substring(0, 70) + '...' : product.description || ''}
                    </p>
                    <div className="mt-auto pt-4 flex items-end justify-between gap-3">
                      <div>
                        {/* Se muestra el precio del producto y si tiene descuento se muestra el precio con el descuento aplicado */}
                        <p className="text-xl font-bold tracking-tight">
                          {product.discount > 0 ? (product.price * (1 - product.discount / 100)).toFixed(2) : product.price}€
                        </p>
                        {product.discount > 0 && (
                          <p className="text-xs text-base-300 line-through">{product.price}€</p>
                        )}
                      </div>
                      <button type="button" className="btn btn-primary text-sm font-medium py-1 px-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                        </svg>
                        <p>Comprar</p>
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
