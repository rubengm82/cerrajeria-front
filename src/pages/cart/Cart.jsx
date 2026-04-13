import { useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { HiArrowLeft, HiOutlinePhoto, HiOutlineTrash } from "react-icons/hi2"
import { useAuth } from "../../context/AuthContext"
import { getCartOrder } from "../../api/orders_api"
import LoadingAnimation from "../../components/LoadingAnimation"
import OrderSummary from "../../components/OrderSummary"
import { formatPrice, getCartTotals, getProductPrice } from "../../utils/cartTotals"
import "../../../scss/main_shop.scss"

const getImportantImage = (product) => (
  product?.images?.find((image) => image.is_important === true || image.is_important === 1) || product?.images?.[0]
)

function CartItem({ product }) {
  const quantity = Number(product?.pivot?.quantity || 1)
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
            <p className="cart-item__category">{product.category?.name || "Producte"}</p>
            <h2 className="cart-item__name">{product.name}</h2>
          </div>

          <button type="button" className="cart-item__remove" aria-label={`Eliminar ${product.name} del carret`}>
            <HiOutlineTrash aria-hidden="true" />
          </button>
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
              defaultValue={quantity}
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
  const { data: cartOrder, isLoading, isError } = useQuery({
    queryKey: ["cart-order"],
    queryFn: async () => {
      const response = await getCartOrder()
      return response.data
    },
    enabled: Boolean(user),
    retry: 1,
  })

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/products", {
        replace: true,
        state: {
          notificationType: "error",
          notificationMessage: "Primer has d'iniciar sessió per veure el carret.",
        },
      })
    }
  }, [authLoading, navigate, user])

  const products = cartOrder?.products || []
  const { itemCount, subtotal, shipping, total } = getCartTotals(products)

  const content = authLoading || !user || isLoading ? (
    <LoadingAnimation heightClass="h-32" />
  ) : isError ? (
    <div className="cart-page__empty border-base-300 bg-base-100">
      <h2>No hem pogut carregar el carret</h2>
      <p className="text-base-400">Torna-ho a provar d'aquí a uns instants.</p>
    </div>
  ) : !cartOrder || products.length === 0 ? (
    <div className="cart-page__empty border-base-300 bg-base-100">
      <h2>El carret és buit</h2>
      <p className="text-base-400">Afegeix productes al carret per continuar amb la comanda.</p>
      <Link to="/products" className="btn btn-primary">Veure productes</Link>
    </div>
  ) : (
    <div className="cart-page__layout">
      <div className="cart-page__items" aria-label="Productes del carret">
        {products.map((product) => (
          <CartItem key={product.id} product={product} />
        ))}
      </div>

      <OrderSummary
        subtotal={subtotal}
        shipping={shipping}
        total={total}
        itemCount={itemCount}
        actionTo="/checkout"
      />
    </div>
  )

  return (
    <section className="cart-page" aria-label="Carret">
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
    </section>
  )
}

export default Cart
