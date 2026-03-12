function ProductCard({product}) {
  return product ?
    <div key={product.id} className="flex flex-col overflow-hidden rounded-2xl border border-base-300 bg-white shadow-sm">
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
    </div>

    : null

}

export default ProductCard