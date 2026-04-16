import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { HiArrowLeft, HiOutlinePhoto, HiOutlineTrash } from "react-icons/hi2"
import { useAuth } from "../../context/AuthContext"
import { getPack } from "../../api/packs_api"
import { getCartOrder, removeCartPack, removeCartProduct, updateCartPack, updateCartProduct } from "../../api/orders_api"
import ConfirmableModal from "../../components/ConfirmableModal"
import LoadingAnimation from "../../components/LoadingAnimation"
import Notifications from "../../components/Notifications"
import OrderSummary from "../../components/OrderSummary"
import ProductDetailModal from "../../components/ProductDetailModal"
import { formatPrice, getCartTotals, getProductPrice } from "../../utils/cartTotals"
import { getLocalCartItems, localCartKey, removeLocalCartProduct, updateLocalCartProduct } from "../../utils/localCart"
import "../../../scss/main_shop.scss"

const getImportantImage = (product) => (
  product?.images?.find((image) => image.is_important === true || image.is_important === 1) || product?.images?.[0]
)

const getItemQuantity = (item) => Number(item?.pivot?.quantity || 1)

const getPackProductIds = (pack) => (pack.products || [])
  .filter((packProduct) => !packProduct?.deleted_at)
  .map((packProduct) => packProduct.id)

const getOtherCartDemandForProduct = (cartItems, currentItem, productId) => cartItems.reduce((total, item) => {
  if (item === currentItem) {
    return total
  }

  const quantity = getItemQuantity(item)

  if (item.cartItemType === "pack") {
    return getPackProductIds(item).includes(productId) ? total + quantity : total
  }

  return item.id === productId ? total + quantity : total
}, 0)

const getAvailableStockForCartItem = (item, cartItems) => {
  if (item.cartItemType !== "pack") {
    const otherDemand = getOtherCartDemandForProduct(cartItems, item, item.id)
    return Math.max(0, Number(item.stock || 0) - otherDemand)
  }

  const packStocks = (item.products || [])
    .filter((packProduct) => !packProduct?.deleted_at)
    .map((packProduct) => {
      const otherDemand = getOtherCartDemandForProduct(cartItems, item, packProduct.id)
      return Number(packProduct.stock || 0) - otherDemand
    })

  const availableStock = Math.min(...packStocks)

  return Number.isFinite(availableStock) ? Math.max(0, availableStock) : 0
}

const getApiErrorMessage = (error, fallbackMessage) => {
  const validationMessage = error.response?.data?.errors
    ? Object.values(error.response.data.errors)[0]?.[0]
    : null

  return validationMessage || error.response?.data?.message || fallbackMessage
}

function CartItem({ product, onQuantityChange, onRemove, onView }) {
  const quantity = Number(product?.pivot?.quantity || 1)
  const availableStock = Number(product?.stock || 0)
  const isPack = product.cartItemType === "pack"
  const quantityId = `cart-quantity-${product.id}`
  const descriptionId = `cart-item-description-${product.id}`
  const currentPrice = getProductPrice(product)
  const lineTotal = currentPrice * quantity
  const oldLineTotal = Number(product.price || 0) * quantity
  const hasDiscount = Number(product.discount || 0) > 0
  const image = getImportantImage(product)

  return (
    <article className="cart-item border-base-300" aria-describedby={descriptionId}>
      <div className="cart-item__media">
        <div className="cart-item__image bg-base-500">
          {hasDiscount && (
            <span className="cart-item__discount bg-primary" aria-label={`Descompte del ${parseInt(product.discount, 10)} per cent`}>
              -{parseInt(product.discount, 10)}%
            </span>
          )}

          {image?.path ? (
            <img src={`/storage/${image.path}`} alt={product.name} />
          ) : (
            <div className="cart-item__empty" aria-label={`Sense imatge per a ${product.name}`}>
              <HiOutlinePhoto className="cart-item__empty-icon text-primary" aria-hidden="true" />
            </div>
          )}
        </div>
      </div>

      <div className="cart-item__body">
        <div className="cart-item__heading">
          <div className="cart-item__copy">
            <p className="cart-item__category">{isPack ? "Pack" : product.category?.name || "Producte"}</p>
            <button type="button" className="cart-item__name-button" onClick={() => onView(product)} aria-label={`Veure el detall de ${product.name}`}>
              <h2 className="cart-item__name">{product.name}</h2>
            </button>
          </div>

          <ConfirmableModal
            title="Eliminar del carret"
            message={`Vols eliminar ${product.name} del carret?`}
            onConfirm={() => onRemove(product)}
          >
            <button type="button" className="cart-item__remove" aria-label={`Eliminar ${product.name} del carret`}>
              <HiOutlineTrash aria-hidden="true" />
            </button>
          </ConfirmableModal>
        </div>

        <p id={descriptionId} className="cart-item__description text-base-400">
          {product.description || "Sense descripció disponible."}
        </p>

        <div className="cart-item__footer">
          <label className="cart-item__quantity" htmlFor={quantityId}>
            <span>Quantitat</span>
            <input
              id={quantityId}
              type="number"
              min="1"
              max={availableStock}
              value={quantity}
              onChange={(event) => onQuantityChange(product, Number(event.target.value || 1))}
              aria-label={`Quantitat de ${product.name}`}
            />
          </label>

          <div className="cart-item__prices">
            {hasDiscount && <span className="cart-item__old-price text-base-300">{formatPrice(oldLineTotal)}</span>}
            <strong className="cart-item__price">{formatPrice(lineTotal)}</strong>
          </div>
        </div>
      </div>
    </article>
  )
}

function Cart() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [notification, setNotification] = useState(null)
  const [localCartVersion, setLocalCartVersion] = useState(0)
  const [selectedItem, setSelectedItem] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoadingSelectedItem, setIsLoadingSelectedItem] = useState(false)
  const { data: cartOrder, isLoading, isError, refetch } = useQuery({
    queryKey: ["cart-order"],
    queryFn: async () => {
      const response = await getCartOrder()
      return response.data
    },
    enabled: Boolean(user),
    retry: 1,
  })

  const showNotification = (type, message) => {
    setNotification({
      id: Date.now(),
      type,
      message,
    })
  }

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === localCartKey) {
        setLocalCartVersion((currentVersion) => currentVersion + 1)
      }
    }

    window.addEventListener("storage", handleStorage)

    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  const products = user ? cartOrder?.products || [] : getLocalCartItems(localCartVersion)
  const packs = user ? cartOrder?.packs || [] : []
  const rawCartItems = [
    ...products.map((product) => ({ ...product, cartItemType: product.cartItemType || "product" })),
    ...packs.map((pack) => ({ ...pack, cartItemType: "pack" })),
  ]
  const cartItems = rawCartItems.map((item) => ({
    ...item,
    stock: getAvailableStockForCartItem(item, rawCartItems),
  }))
  const { itemCount, subtotal, shipping, total } = getCartTotals(cartItems)
  const stockConflictItem = cartItems.find((item) => getItemQuantity(item) > Number(item.stock || 0))

  const handleQuantityChange = async (product, nextQuantity) => {
    const availableStock = Number(product.stock || 0)
    const quantity = Math.max(1, nextQuantity)

    if (quantity > availableStock) {
      showNotification("info", product.cartItemType === "pack"
        ? `Només hi ha ${availableStock} packs disponibles de ${product.name} tenint en compte la resta del carret.`
        : `Només hi ha ${availableStock} unitats disponibles de ${product.name} tenint en compte la resta del carret.`
      )
      return
    }

    try {
      if (user) {
        if (product.cartItemType === "pack") {
          await updateCartPack(product.id, { quantity })
        } else {
          await updateCartProduct(product.id, { quantity })
        }
        await refetch()
      } else {
        updateLocalCartProduct(product.id, quantity, product.cartItemType || "product")
        setLocalCartVersion((currentVersion) => currentVersion + 1)
      }
    } catch (error) {
      showNotification("error", getApiErrorMessage(error, "No hem pogut actualitzar la quantitat."))
    }
  }

  const handleCheckout = () => {
    if (stockConflictItem) {
      showNotification("error", stockConflictItem.cartItemType === "pack"
        ? `Redueix la quantitat de ${stockConflictItem.name}. Només hi ha ${stockConflictItem.stock} packs disponibles tenint en compte la resta del carret.`
        : `Redueix la quantitat de ${stockConflictItem.name}. Només hi ha ${stockConflictItem.stock} unitats disponibles tenint en compte la resta del carret.`
      )
      return
    }

    navigate("/checkout")
  }

  const handleRemove = async (product) => {
    try {
      if (user) {
        if (product.cartItemType === "pack") {
          await removeCartPack(product.id)
        } else {
          await removeCartProduct(product.id)
        }
        await refetch()
      } else {
        removeLocalCartProduct(product.id, product.cartItemType || "product")
        setLocalCartVersion((currentVersion) => currentVersion + 1)
      }

      showNotification("success", `${product.name} s'ha eliminat del carret.`)
    } catch {
      showNotification("error", "No hem pogut eliminar el producte del carret.")
    }
  }

  const handleViewItem = async (product) => {
    setSelectedItem(product)
    setIsModalOpen(true)

    if (product.cartItemType === "pack") {
      setIsLoadingSelectedItem(true)

      try {
        const response = await getPack(product.id)
        setSelectedItem({
          ...response.data,
          cartItemType: "pack",
          pivot: product.pivot,
        })
      } catch {
        showNotification("error", "No hem pogut carregar el detall del pack.")
      } finally {
        setIsLoadingSelectedItem(false)
      }
    }
  }

  const closeItemModal = () => {
    setIsModalOpen(false)
    setSelectedItem(null)
    setIsLoadingSelectedItem(false)
  }

  const content = authLoading || (user && isLoading) ? (
    <LoadingAnimation heightClass="h-32" />
  ) : user && isError ? (
    <div className="cart-page__empty border-base-300 bg-base-100">
      <h2>No hem pogut carregar el carret</h2>
      <p className="text-base-400">Torna-ho a provar d'aquí a uns instants.</p>
    </div>
  ) : (user && !cartOrder) || cartItems.length === 0 ? (
    <div className="cart-page__empty">
      <h2>No tens productes al carret</h2>
      <p>Afegeix productes per preparar la teva comanda.</p>
      <Link to="/products" className="btn btn-primary">Afegir productes al carret</Link>
    </div>
  ) : (
    <div className="cart-page__layout">
      <div className="cart-page__items" aria-label="Productes del carret">
        {cartItems.map((product) => (
          <CartItem key={`${product.cartItemType}-${product.id}`} product={product} onQuantityChange={handleQuantityChange} onRemove={handleRemove} onView={handleViewItem} />
        ))}
      </div>

      <OrderSummary
        subtotal={subtotal}
        shipping={shipping}
        total={total}
        itemCount={itemCount}
        onAction={handleCheckout}
      />
    </div>
  )

  return (
    <section className="cart-page" aria-label="Carret">
      {notification && (
        <Notifications
          key={notification.id}
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="cart-page__container">
        <Link to="/products" className="cart-page__back text-primary">
          <HiArrowLeft className="cart-page__back-icon" aria-hidden="true" />
          Seguir comprant
        </Link>

        <header className="cart-page__header">
          <div>
            <h1 className="cart-page__title">Carret</h1>
          </div>
          <p className="cart-page__count text-primary">{itemCount} productes</p>
        </header>

        {content}
      </div>

      <ProductDetailModal
        key={selectedItem ? `${selectedItem.cartItemType}-${selectedItem.id}` : "cart-no-item"}
        product={selectedItem}
        isOpen={isModalOpen}
        onClose={closeItemModal}
        entityType={selectedItem?.cartItemType === "pack" ? "pack" : "product"}
        isLoading={isLoadingSelectedItem}
      />
    </section>
  )
}

export default Cart
