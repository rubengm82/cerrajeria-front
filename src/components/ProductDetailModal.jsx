import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { HiXMark, HiOutlinePhoto, HiOutlineShoppingCart } from "react-icons/hi2";
import LoadingAnimation from "./LoadingAnimation";


function ProductDetailModal({ product, isOpen, onClose, entityType = "product", isLoading = false }) {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [quantity, setQuantity] = useState(1)
  const isPack = entityType === "pack"
  const productImages = [
    ...(product?.images || []).filter((image) => image.is_important === true),
    ...(product?.images || []).filter((image) => image.is_important !== true)
  ]

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value) || 1
    setQuantity(Math.max(1, value))
  }

  const productFeatures = product?.features?.filter(
    (feature) => feature?.type?.name && feature?.value
  ) || []
  const packProducts = product?.products?.filter((packProduct) => !packProduct?.deleted_at) || []
  const currentPrice = isPack ? product?.total_price : product?.discount > 0 ? (product.price * (1 - product.discount / 100)).toFixed(2) : product?.price
  const modalTitleId = `product-detail-title-${product?.id || 'empty'}`
  const modalDescriptionId = `product-detail-description-${product?.id || 'empty'}`
  const quantityInputId = `quantity-${product?.id || 'product'}`

  return (
    product && (
      <dialog
        id="product-view-modal"
        className="modal modal-bottom sm:modal-middle"
        open={isOpen}
        aria-describedby={product.description ? modalDescriptionId : undefined}
      >
        <div className="modal-box product-detail-modal__content product-detail-modal">
        <form method="dialog">
          <button type="button" className="btn btn-circle btn-ghost absolute right-2 top-2 z-10 text-[30px]" onClick={onClose} aria-label="Tancar el detall del producte">
            <HiXMark className="size-6" aria-hidden="true" />
          </button>
        </form>

        <div className={`product-detail-modal__gallery ${productImages.length <= 1 ? "product-detail-modal__gallery--single" : ""}`}>
          {/* Carousel de imágenes */}
          <div className="product-detail-modal__carousel">
            {productImages.length > 0 ? (
              productImages.map((image, index) => (
                <div
                  key={image.id || index}
                  id={`product-item${product.id}-${index + 1}`}
                  className="product-detail-modal__carousel-item"
                >
                  <img
                    src={`/storage/${image.path}`}
                    alt={`${product.name} - ${index + 1}`}
                  />
                </div>
              ))
            ) : (
              <div className="product-detail-modal__carousel-item flex items-center justify-center">
                <HiOutlinePhoto className="w-16 h-16 text-base-300" aria-hidden="true" />
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {productImages.length > 1 && (
            <div className="product-detail-modal__carousel-thumbnails" aria-label="Miniatures de les imatges del producte">
              {productImages.map((image, index) => (
                <a
                  key={image.id || index}
                  href={`#product-item${product.id}-${index + 1}`}
                  className={`product-detail-modal__carousel-thumb ${index === 0 ? 'active' : ''}`}
                  aria-label={`Veure imatge ${index + 1} de ${productImages.length}`}
                >
                  <img
                    src={`/storage/${image.path}`}
                    alt={`Miniatura ${index + 1}`}
                  />
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="product-detail-modal__details">
          {!isPack && (
            <p className="product-detail-modal__category text-base-400">
              {product.category?.name || 'Sense categoria'}
            </p>
          )}

          <h3 id={modalTitleId} className="product-detail-modal__title">{product.name}</h3>

          <div className="product-detail-modal__price-container">
            <p className="product-detail-modal__price" aria-label={`Preu actual ${currentPrice} euros`}>
              {currentPrice}€
            </p>
            {!isPack && product.discount > 0 && (
              <p className="product-detail-modal__old-price text-base-400" aria-label={`Preu anterior ${product.price} euros`}>
                {product.price}€
              </p>
            )}
          </div>

          {product.description && (
            <p id={modalDescriptionId} className="product-detail-modal__description text-base-300">
              {product.description}
            </p>
          )}

          {isLoading ? (
            <div className="flex justify-center py-6">
              <LoadingAnimation heightClass="" />
            </div>
          ) : isPack ? (
            <div className="product-detail-modal__features-table-wrapper">
              <h4 className="font-semibold mb-3">Productes inclosos</h4>
              {packProducts.length > 0 ? (
                <table className="product-detail-modal__features-table table table-sm">
                  <tbody>
                    {packProducts.map((packProduct) => (
                      <tr key={packProduct.id}>
                        <th className="product-detail-modal__features-label">
                          {packProduct.name}
                        </th>
                        <td className="product-detail-modal__features-value">
                          {packProduct.price}€
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-base-300">Aquest pack no té productes associats.</p>
              )}
            </div>
          ) : productFeatures.length > 0 && (
            <div className="product-detail-modal__features-table-wrapper">
              <table className="product-detail-modal__features-table table table-sm">
                <tbody>
                  {productFeatures.map((feature) => (
                    <tr key={feature.id}>
                      <th className="product-detail-modal__features-label">
                        {feature.type.name}:
                      </th>
                      <td className="product-detail-modal__features-value">{feature.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {/* Cantidad */}
          {!isLoading && !isAdmin && (
            <div className="product-detail-modal__quantity">
              <label htmlFor={quantityInputId} className="product-detail-modal__quantity-label">Quantitat:</label>
              <input id={quantityInputId} type="number" min="1" value={quantity} onChange={handleQuantityChange} className="input input-bordered product-detail-modal__quantity-input w-14" aria-describedby={modalTitleId}/>
              <button type="button" className="btn btn-primary product-detail-modal__action-btn product-detail-modal__action-btn--add product-detail-modal__quantity-add-btn" aria-label={`Afegir ${quantity} unitats de ${product.name} al carret`}>
               <HiOutlineShoppingCart className="w-5 h-5" aria-hidden="true"/>
                <span className="product-detail-modal__quantity-add-text">Afegir al carret</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </dialog>
    )
  )
}

export default ProductDetailModal
