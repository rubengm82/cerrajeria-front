import { useEffect, useState } from "react"
import { getFeatureTypes } from "../api/features_api"
import { HiXMark, HiOutlinePlus, HiOutlineMinus, HiOutlineArrowTopRightOnSquare } from 'react-icons/hi2'
 
function ProductDetailModal({ product, isOpen, onClose }) {
  const [featuresTypes, setFeaturesTypes] = useState([])
  const [selectedFeatureOptions, setSelectedFeatureOptions] = useState({})
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    getFeatureTypes()
      .then((res) => setFeaturesTypes(res.data))
      .catch((err) => console.error(err))
  }, [])

  const toggleFeatureOption = (featureId) => {
    setSelectedFeatureOptions((prev) => {
      const feature = product?.features?.find(f => f.id === featureId)
      if (!feature) return prev
      const typeId = feature.pivot?.feature_type_id
      return {
        ...prev,
        [typeId]: prev[typeId] === featureId ? null : featureId
      }
    })
  }

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value) || 1
    setQuantity(Math.max(1, value))
  }

  const decreaseQuantity = () => {
    setQuantity((currentQuantity) => Math.max(1, currentQuantity - 1))
  }

  const increaseQuantity = () => {
    setQuantity((currentQuantity) => currentQuantity + 1)
  }

  if (!isOpen || !product) return null

  return (
    <dialog id="product-view-modal" className="modal modal-bottom sm:modal-middle" open>
      <div className="modal-box product-detail-modal__content product-detail-modal">
        <form method="dialog">
          <button className="btn btn-circle btn-ghost absolute right-2 top-2 z-10 text-[30px]" onClick={onClose}>
            <HiXMark className="size-6" />
          </button>
        </form>

        <div className="product-detail-modal__gallery">
          {/* Carousel de imágenes */}
          <div className="product-detail-modal__carousel">
            {product.images && product.images.length > 0 ? (
              product.images.map((image, index) => (
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
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-base-300">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="product-detail-modal__carousel-thumbnails">
              {product.images.map((image, index) => (
                <a
                  key={image.id || index}
                  href={`#product-item${product.id}-${index + 1}`}
                  className={`product-detail-modal__carousel-thumb ${index === 0 ? 'active' : ''}`}
                >
                  <img
                    src={`/storage/${image.path}`}
                    alt={`Thumbnail ${index + 1}`}
                  />
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="product-detail-modal__details">
          <p className="product-detail-modal__category text-base-400">
            {product.category?.name || 'Sense categoria'}
          </p>

          <h3 className="product-detail-modal__title">{product.name}</h3>

          <div className="product-detail-modal__price-container">
            <p className="product-detail-modal__price">
              {product.discount > 0
                ? (product.price * (1 - product.discount / 100)).toFixed(2)
                : product.price}€
            </p>
            {product.discount > 0 && (
              <p className="product-detail-modal__old-price text-base-400">
                {product.price}€
              </p>
            )}
          </div>

          {product.description && (
            <p className="product-detail-modal__description text-base-300">
              {product.description}
            </p>
          )}

          {/* Cantidad */}
          <div className="product-detail-modal__quantity">
            <button type="button" className="product-detail-modal__quantity-button product-detail-modal__quantity-button-left" onClick={decreaseQuantity}>
              <HiOutlineMinus className="product-detail-modal__quantity-button-icon" />
            </button>
            <input type="number" min="1" value={quantity} onChange={handleQuantityChange} className="input input-bordered product-detail-modal__quantity-input w-14"/>
            <button type="button" className="product-detail-modal__quantity-button product-detail-modal__quantity-button-right" onClick={increaseQuantity}>
              <HiOutlinePlus className="product-detail-modal__quantity-button-icon" />
            </button>
            <button className="btn btn-primary product-detail-modal__action-btn product-detail-modal__action-btn--add product-detail-modal__quantity-add-btn">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
              </svg>
              <span className="product-detail-modal__quantity-add-text">Afegir al carret</span>
            </button>
          </div>

          {/* Botones de acción */}
          <div className="product-detail-modal__actions">
            <button className="btn btn-secondary product-detail-modal__action-btn product-detail-modal__action-btn--details">
              <span>Veure tots els detalls</span>
              <HiOutlineArrowTopRightOnSquare className="product-detail-modal__action-icon" />
            </button>
          </div>
        </div>


      </div>
    </dialog>
  )
}

export default ProductDetailModal
