import { useEffect, useState } from "react"
import { getFeatureTypes } from "../api/features_api"

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

  if (!isOpen || !product) return null

  return (
    <dialog id="product-view-modal" className="modal modal-bottom sm:modal-middle" open>
      <div className="modal-box product-detail-modal__content product-detail-modal">
        <form method="dialog">
          <button 
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={onClose}
          >
            ✕
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
                    src={`http://127.0.0.1:8000/storage/${image.path}`}
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
                    src={`http://127.0.0.1:8000/storage/${image.path}`}
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

          {/* Características y tipos para seleccionar */}
          {product.features && product.features.length > 0 && (
            <div className="product-detail-modal__features">
              {featuresTypes.map((featureType) => {
                const featuresForType = product.features.filter(
                  (f) => f.pivot?.feature_type_id === featureType.id
                )
                if (featuresForType.length === 0) return null

                return (
                  <div key={featureType.id} className="product-detail-modal__feature-group">
                    <span className="product-detail-modal__feature-label">
                      {featureType.name}
                    </span>
                    <div className="product-detail-modal__feature-options">
                      {featuresForType.map((feature) => (
                        <button
                          key={feature.id}
                          className={`product-detail-modal__feature-option ${selectedFeatureOptions[featureType.id] === feature.id ? 'selected' : ''}`}
                          onClick={() => toggleFeatureOption(feature.id)}
                        >
                          {feature.value}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Cantidad */}
          <div className="product-detail-modal__quantity">
            <span className="product-detail-modal__quantity-label">Quantitat:</span>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={handleQuantityChange}
              className="input input-bordered w-20"
            />
          </div>

          {/* Botones de acción */}
          <div className="product-detail-modal__actions">
            <button className="btn btn-primary product-detail-modal__add-btn">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
              </svg>
              Afegir al carret
            </button>
          </div>
        </div>

        <form method="dialog" className="modal-backdrop">
          <button onClick={onClose}>close</button>
        </form>
      </div>
    </dialog>
  )
}

export default ProductDetailModal