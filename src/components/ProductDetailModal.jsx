import { useEffect, useState } from "react"
import { getFeatureTypes } from "../api/features_api"
import { HiXMark, HiOutlinePhoto, HiOutlineShoppingCart } from "react-icons/hi2";


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
                <HiOutlinePhoto className="w-16 h-16 text-base-300" />
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
                    alt={`Miniatura ${index + 1}`}
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
            <input type="number" min="1" value={quantity} onChange={handleQuantityChange} className="input input-bordered w-20"
            />
          </div>

          {/* Botones de acción */}
          <div className="product-detail-modal__actions">
            <button className="btn btn-primary product-detail-modal__add-btn">
              <HiOutlineShoppingCart className="w-5 h-5"/>
              Afegir al carret
            </button>
          </div>
        </div>


      </div>
    </dialog>
  )
}

export default ProductDetailModal
