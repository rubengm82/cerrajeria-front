import { Link } from "react-router-dom";
import { HiOutlinePhoto, HiOutlineEye, HiOutlineShoppingCart } from "react-icons/hi2";

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
              <HiOutlinePhoto className="product-card__empty-icon text-primary" />
            </div>
          )}

          {/* Se muestran los iconos de ver */}
          <div className='product-card__actions'>
            {/* <button className='product-card__action product-card__action--view bg-base-100/80' onClick={() => onView && onView(product)}>
             
            </button> */}

            <button
              type="button"
              className='product-card__action product-card__action--view bg-base-100/80'
              onClick={(event) => {
                event.stopPropagation()
                handleCardClick()
              }}
            >
               <HiOutlineEye className="product-card__action-icon"/>
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
