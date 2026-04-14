import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { HiArrowLeft, HiOutlinePhoto } from "react-icons/hi2"
import { useAuth } from "../../context/AuthContext"
import { createCheckoutOrder, getCartOrder, updateOrder } from "../../api/orders_api"
import CheckoutSteps from "../../components/CheckoutSteps"
import LoadingAnimation from "../../components/LoadingAnimation"
import OrderSummary from "../../components/OrderSummary"
import { formatPrice, getCartTotals, getProductPrice } from "../../utils/cartTotals"
import { clearLocalCart, getLocalCartItems } from "../../utils/localCart"
import "../../../scss/main_shop.scss"

const checkoutDataKey = "checkoutCustomerData"
const checkoutPaymentKey = "checkoutPaymentMethod"

const paymentLabels = {
  card: "Targeta de crèdit",
  paypal: "PayPal",
  bizum: "Bizum",
}

const getImportantImage = (product) => (
  product?.images?.find((image) => image.is_important === true || image.is_important === 1) || product?.images?.[0]
)

function CheckoutReviewProduct({ product }) {
  const quantity = Number(product?.pivot?.quantity || 1)
  const currentPrice = getProductPrice(product)
  const lineTotal = currentPrice * quantity
  const image = getImportantImage(product)
  const itemTypeLabel = product.cartItemType === "pack" ? "Pack" : product.category?.name || "Producte"

  return (
    <article className="checkout-review-product border-base-300" aria-label={`${product.name}, ${quantity} unitats`}>
      <div className="checkout-review-product__image bg-base-500">
        {image?.path ? (
          <img src={`/storage/${image.path}`} alt={product.name} />
        ) : (
          <HiOutlinePhoto className="checkout-review-product__empty-icon text-primary" aria-hidden="true" />
        )}
      </div>

      <div className="checkout-review-product__content">
        <p className="checkout-review-product__category text-base-400">{itemTypeLabel}</p>
        <h3>{product.name}</h3>
        <p className="text-base-400">{quantity} unitats x {formatPrice(currentPrice)}</p>
      </div>

      <strong className="checkout-review-product__total">{formatPrice(lineTotal)}</strong>
    </article>
  )
}

function CheckoutReview() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [cartOrder, setCartOrder] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const customerData = JSON.parse(sessionStorage.getItem(checkoutDataKey) || "{}")
  const paymentMethod = sessionStorage.getItem(checkoutPaymentKey) || ""

  useEffect(() => {
    const loadCartOrder = async () => {
      if (authLoading || !user) {
        return
      }

      setIsLoading(true)
      setIsError(false)

      try {
        const response = await getCartOrder()
        setCartOrder(response.data)
      } catch {
        setIsError(true)
      } finally {
        setIsLoading(false)
      }
    }

    loadCartOrder()
  }, [authLoading, user])

  const products = [
    ...(user ? cartOrder?.products || [] : getLocalCartItems().filter((item) => (item.cartItemType || "product") === "product")).map((product) => ({ ...product, cartItemType: "product" })),
    ...(user ? cartOrder?.packs || [] : getLocalCartItems().filter((item) => item.cartItemType === "pack")).map((pack) => ({ ...pack, cartItemType: "pack" })),
  ]
  const { itemCount, subtotal, shipping, total } = getCartTotals(products)
  const reviewDescriptionId = "checkout-review-description"
  const hasCustomerData = Boolean(customerData.name && customerData.email && customerData.shipping_address && customerData.installation_address)
  const hasPaymentMethod = Boolean(paymentMethod)

  const handleConfirm = () => {
    setErrorMessage("")

    if (!hasCustomerData) {
      navigate("/checkout", {
        state: {
          notificationType: "error",
          notificationMessage: "Completa les dades abans de revisar la comanda.",
        },
      })
    } else if (!hasPaymentMethod) {
      navigate("/checkout/payment", {
        state: {
          notificationType: "error",
          notificationMessage: "Selecciona un mètode de pagament abans de confirmar.",
        },
      })
    } else {
      handleCreateOrder()
    }
  }

  const handleCreateOrder = async () => {
    setIsConfirming(true)

    try {
      if (user) {
        await updateOrder(cartOrder.id, {
          user_id: user.id,
          customer_name: customerData.name,
          customer_last_name_one: customerData.last_name_one,
          customer_last_name_second: customerData.last_name_second,
          customer_dni: customerData.dni,
          customer_phone: customerData.phone,
          customer_email: customerData.email,
          customer_address: customerData.address,
          customer_zip_code: customerData.zip_code,
          installation_address: customerData.installation_address,
          shipping_address: customerData.shipping_address,
          payment_method: paymentMethod,
          status: "pending",
        })
      } else {
        await createCheckoutOrder({
          customer: {
            name: customerData.name,
            last_name_one: customerData.last_name_one,
            last_name_second: customerData.last_name_second,
            dni: customerData.dni,
            phone: customerData.phone,
            email: customerData.email,
            address: customerData.address,
            zip_code: customerData.zip_code,
          },
          order: {
            installation_address: customerData.installation_address,
            shipping_address: customerData.shipping_address,
            payment_method: paymentMethod,
          },
          items: products.map((product) => ({
            type: product.cartItemType || "product",
            id: product.id,
            quantity: Number(product.pivot?.quantity || 1),
          })),
        })

        clearLocalCart()
      }

      sessionStorage.removeItem(checkoutDataKey)
      sessionStorage.removeItem(checkoutPaymentKey)
      navigate(user ? "/my-orders" : "/products", {
        state: {
          notificationType: "success",
          notificationMessage: "La comanda s'ha generat correctament.",
        },
      })
    } catch {
      setErrorMessage("No hem pogut generar la comanda. Revisa les dades i torna-ho a provar.")
    } finally {
      setIsConfirming(false)
    }
  }

  const content = authLoading || (user && isLoading) ? (
    <LoadingAnimation heightClass="h-32" />
  ) : user && isError ? (
    <div className="checkout-page__notice border-base-300 bg-base-100" role="alert">
      <h2>No hem pogut carregar la comanda</h2>
      <p className="text-base-400">Torna-ho a provar d'aquí a uns instants.</p>
    </div>
  ) : (user && !cartOrder) || products.length === 0 ? (
    <div className="checkout-page__notice checkout-page__notice--empty">
      <h2>No hi ha productes per tramitar</h2>
      <p className="text-base-400">Afegeix productes al carret abans de continuar.</p>
      <Link to="/products" className="btn btn-primary">Veure productes</Link>
    </div>
  ) : (
    <>
      <CheckoutSteps activeStep={3} />

      <div className="checkout-page__layout">
        <section className="checkout-page__panel checkout-page__panel--review border-base-300 bg-base-100" aria-labelledby="checkout-review-title" aria-describedby={reviewDescriptionId}>
          <header className="checkout-page__panel-header">
            <h2 id="checkout-review-title">Resum de la comanda</h2>
            <p id={reviewDescriptionId} className="text-base-400">Revisa les dades abans de confirmar la compra.</p>
          </header>

          {errorMessage && <p className="checkout-review__error text-error" role="alert">{errorMessage}</p>}

          <div className="checkout-review">
            <section className="checkout-review__section" aria-labelledby="checkout-review-customer-title">
              <h3 id="checkout-review-customer-title">Dades del client</h3>
              <dl className="checkout-review__details">
                <div><dt>Nom</dt><dd>{customerData.name} {customerData.last_name_one} {customerData.last_name_second}</dd></div>
                <div><dt>DNI</dt><dd>{customerData.dni || "No indicat"}</dd></div>
                <div><dt>Telèfon</dt><dd>{customerData.phone || "No indicat"}</dd></div>
                <div><dt>Correu</dt><dd>{customerData.email}</dd></div>
                <div><dt>Adreça</dt><dd>{customerData.address}</dd></div>
                <div><dt>Codi postal</dt><dd>{customerData.zip_code}</dd></div>
              </dl>
            </section>

            <section className="checkout-review__section" aria-labelledby="checkout-review-address-title">
              <h3 id="checkout-review-address-title">Adreces de la comanda</h3>
              <dl className="checkout-review__details">
                <div><dt>Instal·lació</dt><dd>{customerData.installation_address}</dd></div>
                <div><dt>Enviament</dt><dd>{customerData.shipping_address}</dd></div>
              </dl>
            </section>

            <section className="checkout-review__section" aria-labelledby="checkout-review-payment-title">
              <h3 id="checkout-review-payment-title">Forma de pagament</h3>
              <p className="checkout-review__payment">{paymentLabels[paymentMethod] || "No seleccionada"}</p>
            </section>

            <section className="checkout-review__section" aria-labelledby="checkout-review-products-title">
              <h3 id="checkout-review-products-title">Productes seleccionats</h3>
              <div className="checkout-review__products" aria-label="Productes de la comanda">
                {products.map((product) => (
                  <CheckoutReviewProduct key={`${product.cartItemType}-${product.id}`} product={product} />
                ))}
              </div>
            </section>
          </div>
        </section>

        <OrderSummary
          subtotal={subtotal}
          shipping={shipping}
          total={total}
          itemCount={itemCount}
          buttonLabel={isConfirming ? "Generant comanda..." : "Confirmar comanda"}
          disabled={isConfirming}
          onAction={handleConfirm}
        />
      </div>
    </>
  )

  return (
    <section className="checkout-page" aria-label="Revisar comanda">
      <div className="checkout-page__container">
        <Link to="/checkout/payment" className="checkout-page__back text-primary">
          <HiArrowLeft className="checkout-page__back-icon" aria-hidden="true" />
          Tornar al pagament
        </Link>

        <header className="checkout-page__header">
          <h1>Tramitar comanda</h1>
        </header>

        {content}
      </div>
    </section>
  )
}

export default CheckoutReview
