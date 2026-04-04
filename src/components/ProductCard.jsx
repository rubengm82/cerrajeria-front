import { Link } from "react-router-dom";

function ProductCard({product, onView}) {
  const mainImage = product?.images?.find((image) => image.is_important == 1) || product?.images?.[0]
  const imagePath = mainImage?.path
  const handleCardClick = () => onView?.(product)

  return product ?
    <div key={product.id} className={`product-card border-base-300 ${onView ? "product-card--interactive" : ""}`} onClick={onView ? handleCardClick : undefined}>
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

          {/* Se muestran los iconos de ver */}
          <div className='product-card__actions'>
            <button
              type="button"
              className='product-card__action product-card__action--view bg-base-100/80'
              onClick={(event) => {
                event.stopPropagation()
                handleCardClick()
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="product-card__action-icon">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="product-card__body">
        <p className="product-card__category text-base-400">{product.category?.name}</p>
        <Link to='/products' className="product-card__name" onClick={(event) => onView && event.preventDefault()}>
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
        </div>
      </div>
    </div>

    : null

}

export default ProductCard
