import { Link } from "react-router-dom";

function ProductCard({product}) {
  const imagePath = product?.images?.[0]?.path

  return product ?
    <div key={product.id} className="flex flex-col overflow-hidden rounded-2xl border border-base-300 bg-white shadow-sm">
      <div className="group relative h-40 shrink-0 overflow-hidden bg-neutral-100 flex items-center justify-center sm:h-56">
        {product.discount > 0 && (
          <div className="absolute top-2 left-2 z-10 rounded-full bg-primary px-2 py-1 text-[10px] font-semibold text-white duration-700 group-hover:blur-[2px] sm:top-3 sm:left-3 sm:px-4 sm:text-xs">
            <p>-{parseInt(product.discount)}%</p>
          </div>
        )}
        <div className='relative h-full w-full'>
          {imagePath ? (
            <img src={`http://127.0.0.1:8000/storage/${imagePath}`} alt={product.name} className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:blur-[2px]"/>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-primary/10 transition-all duration-700 group-hover:scale-110 group-hover:blur-[2px]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-10 text-primary">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
            </div>
          )}

          {/* Se muestran los iconos de ver y añadir al carrito */}
          <div className='absolute inset-0 flex items-center justify-center gap-7 opacity-0 translate-y-8 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-700'>
            <button className='bg-base-100/80 rounded-full p-4 hover:bg-base-100 cursor-pointer transition-all duration-500'>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-black">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </button>

            <button className='bg-primary/80 rounded-full p-4 shadow-lg hover:bg-primary cursor-pointer transition-all duration-500'>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col px-3 pb-3 pt-2 sm:px-4 sm:pb-4 sm:pt-3">
        <p className="text-xs font-medium uppercase line-clamp-1 tracking-wider text-base-400">{product.category.name}</p>
        <Link to='/products' className="mt-1 line-clamp-2 text-base font-medium transition-all hover:text-primary sm:mt-2 sm:text-[20px]">
          {product.name}
        </Link>

        <p className="mt-1 w-full line-clamp-3 whitespace-normal text-xs text-base-300 sm:mt-2 sm:text-sm">
          {product.description || ''}
        </p>
        <div className="pt-3 flex items-end justify-between gap-2 sm:pt-4 sm:gap-3">
          <div>
            {/* Se muestra el precio del producto y si tiene descuento se muestra el precio con el descuento aplicado */}
            <p className="text-base font-bold sm:text-xl">
              {product.discount > 0 ? (product.price * (1 - product.discount / 100)).toFixed(2) : product.price}€
            </p>
            {product.discount > 0 && (
              <p className="text-xs text-base-300 line-through">{product.price}€</p>
            )}
          </div>
          <button type="button" className="btn btn-primary btn-sm text-xs font-medium px-2 sm:text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
            <p className="hidden sm:block">Comprar</p>
          </button>
        </div>
      </div>
    </div>

    : null

}

export default ProductCard
