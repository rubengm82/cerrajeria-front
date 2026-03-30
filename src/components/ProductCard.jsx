import { Link } from "react-router-dom";
import { HiOutlinePhoto, HiOutlineEye, HiOutlineShoppingCart } from "react-icons/hi2";

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
              <HiOutlinePhoto className="product-card__empty-icon text-primary" />
            </div>
          )}

          {/* Se muestran los iconos de ver y añadir al carrito */}
          <div className='product-card__actions'>
            <button className='product-card__action product-card__action--view bg-base-100/80' onClick={() => onView && onView(product)}>
              <HiOutlineEye className="product-card__action-icon"/>
            </button>

            <button className='product-card__action product-card__action--buy bg-primary/80'>
              <HiOutlineShoppingCart className="product-card__action-icon text-white" />
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
            <HiOutlineShoppingCart className="product-card__buy-icon" />
            <p className="product-card__buy-text">Comprar</p>
          </button>
        </div>
      </div>
    </div>

    : null

}

export default ProductCard
