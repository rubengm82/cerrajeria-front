import { Link } from "react-router-dom";
import { HiOutlinePhoto, HiOutlineEye } from "react-icons/hi2";

function ProductCard({ product, onView }) {
  const isPack = product?.total_price != null
  const isStockBreak = !isPack && !!product?.is_stock_break
  const mainImage = product?.images?.find((image) => image.is_important === 1) || product?.images?.[0]
  const imagePath = mainImage?.path
  const handleCardClick = (event) => {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
      if (event.nativeEvent) {
        event.nativeEvent.stopImmediatePropagation()
      }
    }
    onView?.(product)
  }
  const currentPrice = isPack 
    ? (product.total_price ? parseFloat(product.total_price).toFixed(2) : '0.00')
    : product.discount > 0 
      ? (parseFloat(product.price || 0) * (1 - product.discount / 100)).toFixed(2) 
      : parseFloat(product.price || 0).toFixed(2)
  const actionLabel = isPack ? `Veure el detall del pack ${product?.name}` : `Veure el detall del producte ${product?.name}`
  const cardLabel = isPack ? `${product?.name}. Pack. Preu ${currentPrice} euros` : `${product?.name}. Categoria ${product?.category?.name || 'sense categoria'}. Preu ${currentPrice} euros`
  const productDescriptionId = product ? `product-card-${product.id}-description` : undefined
  const productPriceId = product ? `product-card-${product.id}-price` : undefined
  const productDescribedBy = product ? `${productDescriptionId} ${productPriceId}` : undefined
  const handleCardKeyDown = (event) => {
    if (onView && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault()
      handleCardClick()
    }
  }

  return product ?
    <div
      key={product.id}
      className={`product-card border-base-300 ${onView ? "product-card--interactive" : ""}`}
      onClick={onView ? handleCardClick : undefined}
      onKeyDown={handleCardKeyDown}
      role={onView ? "button" : "article"}
      tabIndex={onView ? 0 : undefined}
      aria-label={onView ? cardLabel : undefined}
      aria-describedby={productDescribedBy}
    >
      <div className="product-card__media">
        {!isPack && product.discount > 0 && (
          <div className="product-card__discount bg-primary" aria-label={`Descompte del ${parseInt(product.discount)} per cent`}>
            <p>-{parseInt(product.discount)}%</p>
          </div>
        )}

        {isStockBreak && (
          <div
            className="product-card__stock-break"
            aria-label="Este producto esta en rotura de stock"
            title="Este producto esta en rotura de stock"
          >
            <span className="product-card__stock-break-icon" aria-hidden="true">R</span>
            <span className="product-card__stock-break-tooltip" role="tooltip">
              Este producto esta en rotura de stock
            </span>
          </div>
        )}

        <div className='product-card__image-box'>
          {imagePath ? (
            <img src={`/storage/${imagePath}`} alt={product.name} className="product-card__image"/>
          ) : (
            <div className="product-card__empty bg-primary/10" aria-label={`Sense imatge per a ${product.name}`}>
              <HiOutlinePhoto className="product-card__empty-icon text-primary" aria-hidden="true" />
            </div>
          )}

          {/* Se muestran los iconos de ver */}
          <div className='product-card__actions'>
            {/* <button className='product-card__action product-card__action--view bg-base-100/80' onClick={() => onView && onView(product)}>
             
            </button> */}
            <button type="button" className='product-card__action product-card__action--view' onClick={(event) => {
                event.stopPropagation()
                handleCardClick()}} aria-label={actionLabel}>
               <HiOutlineEye className="product-card__action-icon" aria-hidden="true"/>
               <span className="product-card__action-text">Visualitzar</span>
            </button>
          </div>
        </div>
      </div>

      <div className="product-card__body">
        <p className="product-card__category text-base-400">{isPack ? "Pack" : product.category?.name}</p>
         <span className="product-card__name" role="button" tabIndex={0} onClick={handleCardClick} onKeyDown={handleCardKeyDown} aria-label={actionLabel}>{product.name}</span>

        <p id={productDescriptionId} className="product-card__desc text-base-300">
          {product.description || ''}
        </p>

        <div className="product-card__bottom">
          <div>
            <p id={productPriceId} className="product-card__price">
              {currentPrice}€
            </p>
            {!isPack && product.discount > 0 && (
              <p className="product-card__old-price text-base-300" aria-label={`Preu anterior ${parseFloat(product.price || 0).toFixed(2)} euros`}>{parseFloat(product.price || 0).toFixed(2)}€</p>
            )}
          </div>

        </div>
      </div>
    </div>

    : null

}

export default ProductCard
