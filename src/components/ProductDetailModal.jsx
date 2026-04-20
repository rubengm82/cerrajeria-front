import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { HiXMark, HiOutlinePhoto, HiOutlineShoppingCart } from "react-icons/hi2"
import LoadingAnimation from "./LoadingAnimation"
import Notifications from "./Notifications"
import { addPackToCart, addProductToCart } from "../api/orders_api"
import { addProductToLocalCart } from "../utils/localCart"

const formatPrice = (price) => {
  const numericPrice = Number(price || 0)
  return new Intl.NumberFormat("ca-ES", {
    style: "currency",
    currency: "EUR",
  }).format(numericPrice)
}

function ProductDetailModal({
  product,
  isOpen,
  onClose,
  entityType = "product",
  isLoading = false,
}) {
  const { user } = useAuth()
  const isAdmin = user?.role === "admin"

  const [quantity, setQuantity] = useState(1)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [notification, setNotification] = useState(null)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  if (!product) return null

  const isPack = entityType === "pack"

  const productImages = [
    ...(product.images || []).filter((img) => img.is_important),
    ...(product.images || []).filter((img) => !img.is_important),
  ]

  const activeImage = productImages[activeImageIndex]

  const productFeatures =
    product.features?.filter(
      (f) => f?.type?.name && f?.value
    ) || []

  const packProducts =
    product.products?.filter((p) => !p?.deleted_at) || []

  const availableStock = isPack && packProducts.length > 0
    ? Math.min(...packProducts.map((packProduct) => Number(packProduct.stock || 0)))
    : Number(product.stock || 0)
  const isQuantityAvailable = quantity <= availableStock
  const isOutOfStock = availableStock <= 0 || !Number.isFinite(availableStock)

  const currentPrice = isPack
    ? (product.total_price ? parseFloat(product.total_price).toFixed(2) : '0.00')
    : product.discount > 0
      ? (parseFloat(product.price || 0) * (1 - product.discount / 100)).toFixed(2)
      : parseFloat(product.price || 0).toFixed(2)

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value) || 1
    const nextQuantity = Math.max(1, value)
    setQuantity(nextQuantity)

    if (nextQuantity > availableStock) {
      setNotification({
        id: Date.now(),
        type: "info",
        message: isOutOfStock
          ? "Aquest producte no té estoc disponible."
          : isPack
            ? `Només hi ha ${availableStock} packs disponibles.`
            : `Només hi ha ${availableStock} unitats disponibles.`,
      })
    }
  }

  const handleAddToCart = async () => {
    setNotification(null)

    if (isOutOfStock || !isQuantityAvailable) {
      setNotification({
        id: Date.now(),
        type: "info",
        message: isOutOfStock
          ? "Aquest producte no té estoc disponible."
          : isPack
            ? `Només hi ha ${availableStock} packs disponibles.`
            : `Només hi ha ${availableStock} unitats disponibles.`,
      })
      return
    }

    setIsAddingToCart(true)

    try {
      let wasAdded = false

      if (user) {
        const response = isPack
          ? await addPackToCart({
            pack_id: product.id,
            quantity,
          })
          : await addProductToCart({
            product_id: product.id,
            quantity,
          })

        wasAdded = Boolean(response.data?.added)
      } else {
        const result = addProductToLocalCart({
          ...product,
          stock: availableStock,
        }, quantity, isPack ? "pack" : "product")
        wasAdded = result.added
      }

      setNotification({
        id: Date.now(),
        type: wasAdded ? "success" : "info",
        message: wasAdded
          ? `${product.name} s'ha afegit al carret.`
          : `${product.name} ja és al carret. Modifica la quantitat des del carret.`,
      })
    } catch {
      setNotification({
        id: Date.now(),
        type: "error",
        message: "No hem pogut afegir el producte al carret.",
      })
    } finally {
      setIsAddingToCart(false)
    }
  }

  const modalTitleId = `product-detail-title-${product.id}`
  const modalDescriptionId = `product-detail-description-${product.id}`
  const quantityInputId = `quantity-${product.id}`
  const cartFeedbackId = `cart-feedback-${product.id}`

  return (
    <div
      id="product-view-modal"
      className="modal modal-bottom md:modal-middle modal-lg"
      open={isOpen}
      role="dialog"
      aria-modal="true"
      aria-describedby={product.description ? modalDescriptionId : undefined}
    >
      {notification && (
        <Notifications
          key={notification.id}
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="modal-backdrop join" onClick={onClose}>
        <button aria-label="Tancar el modal"></button>
      </div>
      <div className="modal-box product-pack-show__container p-4">
        <div className="product-pack-show__header">
          <button
            type="button"
            className="btn btn-circle btn-ghost product-pack-show__close text-[30px]"
            onClick={onClose}
            aria-label="Tancar el detall del producte"
          >
            <HiXMark className="size-6" />
          </button>
        </div>
        <div className="product-pack-show__body">
          <section
            className="product-pack-show__summary"
            aria-labelledby={modalTitleId}
          >
          {/* Gallery */}
          <div className="product-pack-show__gallery">
            <div className="product-pack-show__main-image bg-base-500">
              {activeImage ? (
                <img
                  src={`/storage/${activeImage.path}`}
                  alt={product.name}
                />
              ) : (
                <HiOutlinePhoto className="product-pack-show__placeholder text-base-300" />
              )}
            </div>

            {productImages.length > 1 && (
              <div
                className="product-pack-show__thumbs"
                aria-label="Miniatures de les imatges"
              >
                {productImages.map((image, index) => (
                  <button
                    key={image.id || index}
                    type="button"
                    className={`product-pack-show__thumb bg-base-500 ${
                      index === activeImageIndex
                        ? "product-pack-show__thumb--active"
                        : ""
                    }`}
                    onClick={() => setActiveImageIndex(index)}
                    aria-label={`Veure imatge ${index + 1}`}
                    aria-current={index === activeImageIndex}
                  >
                     <img src={`/storage/${image.path}`} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="product-pack-show__content">
            <div className="product-pack-show__info">
              {!isPack && (
                <p className="product-pack-show__category text-primary">
                  {product.category?.name || "Sense categoria"}
                </p>
              )}

              <h3 id={modalTitleId} className="product-pack-show__title">
                {product.name}
              </h3>

              <div className="product-pack-show__price-row">
                <p className="product-pack-show__price">
                  {formatPrice(currentPrice)}
                </p>

                {!isPack && product.discount > 0 && (
                  <p className="product-pack-show__old-price text-base-400">
                    {formatPrice(product.price)}
                  </p>
                )}
              </div>

              {product.description && (
                <p
                  id={modalDescriptionId}
                  className="product-pack-show__description text-base-400"
                >
                  {product.description}
                </p>
              )}
            </div>

            {/* Details */}
            <section className="product-pack-show__details">
              <h2 className="product-pack-show__details-title">
                {isPack ? "Productes inclosos" : "Especificacions"}
              </h2>

               {isLoading ? (
                 <div className="flex justify-center py-6">
                   <LoadingAnimation heightClass="h-20" />
                 </div>
               ) : isPack ? (
                packProducts.length > 0 ? (
                  <div className="product-pack-show__table">
                    {packProducts.map((p) => (
                      <div
                        key={p.id}
                        className="product-pack-show__table-row"
                      >
                        <span>{p.name}</span>
                        <strong>{formatPrice(p.price)}</strong>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="product-pack-show__muted text-base-400">
                    Aquest pack no té productes associats.
                  </p>
                )
              ) : productFeatures.length > 0 ? (
                <div className="product-pack-show__table">
                  {productFeatures.map((f) => (
                    <div
                      key={f.id}
                      className="product-pack-show__table-row"
                    >
                      <span>{f.type.name}</span>
                      <strong>{f.value}</strong>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="product-pack-show__muted text-base-400">
                  Aquest producte no té especificacions disponibles.
                </p>
              )}
            </section>

            {!isLoading && !isAdmin && (
              <div className="product-pack-show__purchase">
                <input
                  id={quantityInputId}
                  type="number"
                  min="1"
                  step="1"
                  max={availableStock}
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="input input-bordered product-pack-show__quantity-input"
                  aria-describedby={cartFeedbackId}
                />

                <button
                  type="button"
                  className="btn btn-primary product-pack-show__cart-button"
                  aria-label={`Afegir ${quantity} unitats de ${product.name} al carret`}
                  aria-describedby={cartFeedbackId}
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || isOutOfStock || !isQuantityAvailable}
                >
                  <HiOutlineShoppingCart className="product-pack-show__cart-icon" />
                  {isAddingToCart ? "Afegint..." : "Afegir al carret"}
                </button>

                <p id={cartFeedbackId} className="product-pack-show__cart-feedback text-base-400">
                  {isOutOfStock
                    ? "Aquest producte no té estoc disponible."
                    : isPack
                      ? `${availableStock} packs disponibles.`
                      : `${availableStock} unitats disponibles.`}
                </p>
              </div>
            )}
          </div>
        </section>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailModal
