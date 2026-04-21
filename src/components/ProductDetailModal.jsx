import { useEffect, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "../context/AuthContext"
import { HiXMark, HiOutlinePhoto, HiOutlineShoppingCart } from "react-icons/hi2"
import Notifications from "./Notifications"
import { addPackToCart, addProductToCart, getCartOrder } from "../api/orders_api"
import { addProductToLocalCart, getLocalCartItems } from "../utils/localCart"

const formatPrice = (price) => {
  const numericPrice = Number(price || 0)
  return new Intl.NumberFormat("ca-ES", {
    style: "currency",
    currency: "EUR",
  }).format(numericPrice)
}

const getItemQuantity = (item) => Number(item?.pivot?.quantity || 1)

const getPackProductIds = (pack) => (pack.products || [])
  .filter((packProduct) => !packProduct?.deleted_at)
  .map((packProduct) => packProduct.id)

const getCartDemandForProduct = (cartItems, productId) => cartItems.reduce((total, item) => {
  const quantity = getItemQuantity(item)

  if (item.cartItemType === "pack") {
    return getPackProductIds(item).includes(productId) ? total + quantity : total
  }

  return item.id === productId ? total + quantity : total
}, 0)

function ProductDetailModal({
  product,
  isOpen,
  onClose,
  entityType = "product",
  isLoading = false,
}) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const isAdmin = user?.role === "admin"

  const [quantity, setQuantity] = useState(1)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [notification, setNotification] = useState(null)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [localCartVersion, setLocalCartVersion] = useState(0)
  const [isContentReady, setIsContentReady] = useState(false)
  const [installationRequested, setInstallationRequested] = useState(false)
  const { data: cartOrder } = useQuery({
    queryKey: ["cart-order"],
    queryFn: async () => {
      const response = await getCartOrder()
      return response.data
    },
    enabled: Boolean(user && isOpen && !isAdmin),
    retry: 1,
  })

  const isPack = entityType === "pack"
  const isStockBreak = !isPack && !!product?.is_stock_break
  const canRequestInstallation = !isPack && Boolean(product?.is_installable)
  const showSkeleton = !isContentReady

  const productImages = [
    ...(product?.images || []).filter((img) => img.is_important),
    ...(product?.images || []).filter((img) => !img.is_important),
  ]

  const activeImage = productImages[activeImageIndex]

  const productFeatures =
    product?.features?.filter(
      (f) => f?.type?.name && f?.value
    ) || []

  const packProducts =
    product?.products?.filter((p) => !p?.deleted_at) || []

  const cartItems = user
    ? [
      ...(cartOrder?.products || []).map((cartProduct) => ({ ...cartProduct, cartItemType: "product" })),
      ...(cartOrder?.packs || []).map((cartPack) => ({ ...cartPack, cartItemType: "pack" })),
    ]
    : getLocalCartItems(localCartVersion)

  const availableStock = isPack && packProducts.length > 0
    ? Math.min(...packProducts.map((packProduct) => {
      const cartDemand = getCartDemandForProduct(cartItems, packProduct.id)
      return Number(packProduct.stock || 0) - cartDemand
    }))
    : Number(product?.stock || 0) - getCartDemandForProduct(cartItems, product?.id)
  const normalizedAvailableStock = Number.isFinite(availableStock) ? Math.max(0, availableStock) : 0
  const maxQuantity = normalizedAvailableStock > 0 ? normalizedAvailableStock : 1
  const isQuantityAvailable = quantity <= normalizedAvailableStock
  const isOutOfStock = normalizedAvailableStock <= 0
  const productId = product?.id || null
  const hasProduct = Boolean(product)

  useEffect(() => {
    if (!isOpen || isLoading || !hasProduct) {
      setIsContentReady(false)
      return undefined
    }

    setIsContentReady(false)
    setInstallationRequested(false)
    const timeoutId = window.setTimeout(() => {
      setIsContentReady(true)
    }, 120)

    return () => window.clearTimeout(timeoutId)
  }, [isOpen, isLoading, hasProduct, productId, entityType])

  const currentPrice = isPack
    ? (product?.total_price ? parseFloat(product.total_price).toFixed(2) : '0.00')
    : product?.discount > 0
      ? (parseFloat(product?.price || 0) * (1 - (product?.discount || 0) / 100)).toFixed(2)
      : parseFloat(product?.price || 0).toFixed(2)

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value) || 1
    const nextQuantity = Math.min(Math.max(1, value), maxQuantity)
    setQuantity(nextQuantity)

    if (value > normalizedAvailableStock) {
      setNotification({
        id: Date.now(),
        type: "info",
        message: isOutOfStock
          ? "Aquest producte no té estoc disponible."
          : isPack
            ? `Només hi ha ${normalizedAvailableStock} packs disponibles tenint en compte el carret.`
            : `Només hi ha ${normalizedAvailableStock} unitats disponibles tenint en compte el carret.`,
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
            ? `Només hi ha ${normalizedAvailableStock} packs disponibles tenint en compte el carret.`
            : `Només hi ha ${normalizedAvailableStock} unitats disponibles tenint en compte el carret.`,
      })
      return
    }

    setIsAddingToCart(true)

    try {
      let wasAdded = false

      if (user) {
         const response = isPack
           ? await addPackToCart({
             pack_id: product?.id,
             quantity,
           })
           : await addProductToCart({
             product_id: product?.id,
             quantity,
             installation_requested: installationRequested,
           })

        wasAdded = Boolean(response.data?.added)

        if (response.data?.order) {
          queryClient.setQueryData(["cart-order"], response.data.order)
        } else {
          queryClient.invalidateQueries({ queryKey: ["cart-order"] })
        }
      } else {
         const result = addProductToLocalCart({
           ...(product || {}),
           stock: normalizedAvailableStock,
        }, quantity, isPack ? "pack" : "product", installationRequested)
        wasAdded = result.added
        setLocalCartVersion((currentVersion) => currentVersion + 1)
      }

       setNotification({
         id: Date.now(),
         type: wasAdded ? "success" : "info",
         message: wasAdded
           ? `${product?.name || 'Producte'} s'ha afegit al carret.`
           : `${product?.name || 'Producte'} ja és al carret. Modifica la quantitat des del carret.`,
       })
    } catch (error) {
      const validationMessage = error.response?.data?.errors
        ? Object.values(error.response.data.errors)[0]?.[0]
        : null

      setNotification({
        id: Date.now(),
        type: "error",
        message: validationMessage || error.response?.data?.message || "No hem pogut afegir el producte al carret.",
      })
    } finally {
      setIsAddingToCart(false)
    }
  }

  const modalTitleId = `product-detail-title-${product?.id || 'null'}`
  const modalDescriptionId = `product-detail-description-${product?.id || 'null'}`
  const quantityInputId = `quantity-${product?.id || 'null'}`
  const cartFeedbackId = `cart-feedback-${product?.id || 'null'}`

  const skeletonContent = (
    <div className="product-pack-show__skeleton" aria-hidden="true">
        <div className="product-pack-show__skeleton-gallery">
          <div className="skeleton product-pack-show__skeleton-main-image"></div>
        {productImages.length > 1 && (
          <div className="product-pack-show__skeleton-thumbs">
            {productImages.map((image, index) => (
              <div key={image.id || index} className="skeleton product-pack-show__skeleton-thumb"></div>
            ))}
          </div>
        )}
      </div>

      <div className="product-pack-show__skeleton-content">
        <div className="product-pack-show__skeleton-info">
          {!isPack && (
            <div className="skeleton product-pack-show__skeleton-line product-pack-show__skeleton-line--tag"></div>
          )}
          <div className="skeleton product-pack-show__skeleton-line product-pack-show__skeleton-line--title"></div>
          <div className="skeleton product-pack-show__skeleton-line product-pack-show__skeleton-line--price"></div>
          {product?.description && (
            <>
              <div className="skeleton product-pack-show__skeleton-line"></div>
              <div className="skeleton product-pack-show__skeleton-line product-pack-show__skeleton-line--short"></div>
            </>
          )}
        </div>

        <div className="product-pack-show__skeleton-details">
          <div className="skeleton product-pack-show__skeleton-line product-pack-show__skeleton-line--label"></div>
          <div className="product-pack-show__skeleton-table">
            <div className="skeleton product-pack-show__skeleton-row"></div>
            <div className="skeleton product-pack-show__skeleton-row"></div>
            <div className="skeleton product-pack-show__skeleton-row"></div>
          </div>
        </div>

        {!isAdmin && (
          <div className="product-pack-show__skeleton-purchase">
            <div className="skeleton product-pack-show__skeleton-quantity"></div>
            <div className="skeleton product-pack-show__skeleton-button"></div>
            <div className="skeleton product-pack-show__skeleton-line product-pack-show__skeleton-line--feedback"></div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div
      id="product-view-modal"
      className="modal modal-bottom md:modal-middle modal-lg"
      open={isOpen}
      role="dialog"
      aria-modal="true"
       aria-describedby={product?.description ? modalDescriptionId : undefined}
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
          {showSkeleton ? skeletonContent : (
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
                   alt={product?.name || ''}
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
                   {product?.category?.name || "Sense categoria"}
                 </p>
               )}

               <h3 id={modalTitleId} className="product-pack-show__title">
                 {product?.name || ''}
               </h3>

              <div className="product-pack-show__price-row">
                <p className="product-pack-show__price">
                  {formatPrice(currentPrice)}
                </p>

                  {!isPack && product?.discount > 0 && (
                   <p className="product-pack-show__old-price text-base-400">
                     {formatPrice(product?.price)}
                   </p>
                 )}
              </div>

              {isStockBreak && (
                <p className="product-pack-show__stock-break" role="status">
                  Este producto esta en rotura de stock
                </p>
              )}

               {product?.description && (
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

               {isPack ? (
                packProducts.length > 0 ? (
                  <div className="product-pack-show__table product-pack-show__table--packs">
                    {packProducts.map((p) => (
                      <div
                        key={p.id}
                        className="product-pack-show__table-row"
                      >
                        <span className="product-pack-show__pack-product-name">
                          {p.name}
                          {p.is_stock_break && (
                            <span
                              className="product-pack-show__pack-product-stock-break-wrap tooltip tooltip-top"
                              data-tip="Este producto esta en rotura de stock"
                              tabIndex={0}
                            >
                              <span
                                className="product-pack-show__pack-product-stock-break"
                                aria-label="Este producto esta en rotura de stock"
                              >
                                R
                              </span>
                            </span>
                          )}
                        </span>
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

            {!showSkeleton && !isAdmin && (
              <div className="product-pack-show__purchase">
                {canRequestInstallation && (
                  <label className="product-pack-show__installation">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      checked={installationRequested}
                      onChange={(event) => setInstallationRequested(event.target.checked)}
                    />
                    <span>Afegir instal·lació</span>
                  </label>
                )}

                <input
                  id={quantityInputId}
                  type="number"
                  min="1"
                  step="1"
                  max={normalizedAvailableStock}
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="input input-bordered product-pack-show__quantity-input"
                  aria-describedby={cartFeedbackId}
                />

                 <button
                   type="button"
                   className="btn btn-primary product-pack-show__cart-button"
                   aria-label={`Afegir ${quantity} unitats de ${product?.name || 'producte'} al carret`}
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
                      ? `${normalizedAvailableStock} packs disponibles.`
                      : `${normalizedAvailableStock} unitats disponibles.`}
                </p>
              </div>
            )}
          </div>
        </section>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductDetailModal
