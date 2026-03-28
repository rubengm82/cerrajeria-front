import { Link } from "react-router-dom";

function ProductCard({product, onView}) {
  const imagePath = product?.images?.[0]?.path

  return product ?
    <div key={product.id} className="product-card border-base-300">
      <div className="product-card__media">
        {product.discount > 0 && (
          <div className="product-card__discount bg-primary">
            <p>-{parseInt(product.discount)}%</p>
          </div>
        )}

        <div className='product-card__image-box'>
          {imagePath ? (
            <img src={`/storage/${imagePath}`} alt={product.name} className="product-card__image"/>
          ) : (
            <div className="product-card__empty bg-primary/10">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="product-card__empty-icon text-primary">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
            </div>
          )}

          {/* Se muestran los iconos de ver y añadir al carrito */}
          <div className='product-card__actions'>
            <button className='product-card__action product-card__action--view bg-base-100/80' onClick={() => onView && onView(product)}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="product-card__action-icon">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </button>

            <button className='product-card__action product-card__action--buy bg-primary/80'>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="product-card__action-icon text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="product-card__body">
        <p className="product-card__category text-base-400">{product.category?.name}</p>
        <Link to='/products' className="product-card__name">
          {product.name}
        </Link>

        <p className="product-card__desc text-base-300">
          {product.description || ''}
        </p>

        <div className="product-card__bottom">
          <div>
            {/* Se muestra el precio del producto y si tiene descuento se muestra el precio con el descuento aplicado */}
            <p className="product-card__price">
              {product.discount > 0 ? (product.price * (1 - product.discount / 100)).toFixed(2) : product.price}€
            </p>
            {product.discount > 0 && (
              <p className="product-card__old-price text-base-300">{product.price}€</p>
            )}
          </div>

          <button type="button" className="btn btn-primary btn-sm product-card__buy-btn">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="product-card__buy-icon">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
            <p className="product-card__buy-text">Comprar</p>
          </button>
        </div>
      </div>
    </div>

    : null

}

export default ProductCard
