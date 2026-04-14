import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { HiArrowLeft } from "react-icons/hi2"
import { useAuth } from "../../context/AuthContext"
import { getCartOrder } from "../../api/orders_api"
import CheckoutSteps from "../../components/CheckoutSteps"
import LoadingAnimation from "../../components/LoadingAnimation"
import OrderSummary from "../../components/OrderSummary"
import { getCartTotals } from "../../utils/cartTotals"
import { getLocalCartItems } from "../../utils/localCart"
import "../../../scss/main_shop.scss"

const checkoutPaymentKey = "checkoutPaymentMethod"

function CheckoutPayment() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [paymentMethod, setPaymentMethod] = useState(sessionStorage.getItem(checkoutPaymentKey) || "bizum")
  const { data: cartOrder, isLoading, isError } = useQuery({
    queryKey: ["cart-order"],
    queryFn: async () => {
      const response = await getCartOrder()
      return response.data
    },
    enabled: Boolean(user),
    retry: 1,
  })

  const products = [
    ...(user ? cartOrder?.products || [] : getLocalCartItems().filter((item) => (item.cartItemType || "product") === "product")).map((product) => ({ ...product, cartItemType: "product" })),
    ...(user ? cartOrder?.packs || [] : getLocalCartItems().filter((item) => item.cartItemType === "pack")).map((pack) => ({ ...pack, cartItemType: "pack" })),
  ]
  const { itemCount, subtotal, shipping, total } = getCartTotals(products)
  const paymentDescriptionId = "checkout-payment-description"
  const paymentFormId = "checkout-payment-form"

  const handleSubmit = (event) => {
    event.preventDefault()
    sessionStorage.setItem(checkoutPaymentKey, paymentMethod)
    navigate("/checkout/review")
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
      <CheckoutSteps activeStep={2} />

      <div className="checkout-page__layout">
        <section className="checkout-page__panel checkout-page__panel--payment border-base-300 bg-base-100" aria-labelledby="checkout-payment-title" aria-describedby={paymentDescriptionId}>
          <header className="checkout-page__panel-header">
            <h2 id="checkout-payment-title">Pagament</h2>
            <p id={paymentDescriptionId} className="text-base-400">Selecciona un mètode de pagament.</p>
          </header>

          <form id={paymentFormId} className="payment-methods" onSubmit={handleSubmit} aria-label="Mètodes de pagament">
            <label className="payment-method border-base-300" htmlFor="payment-card">
              <span className="payment-method__choice">
                <input id="payment-card" className="radio radio-primary" type="radio" name="paymentMethod" value="card" checked={paymentMethod === "card"} onChange={(event) => setPaymentMethod(event.target.value)} />
                <span>Targeta de crèdit</span>
              </span>
              <span className="payment-method__logos" aria-label="Visa, Mastercard, American Express i targetes compatibles">
                <span>VISA</span>
                <span>MC</span>
                <span>AMEX</span>
              </span>
            </label>

            <label className="payment-method border-base-300" htmlFor="payment-paypal">
              <span className="payment-method__choice">
                <input id="payment-paypal" className="radio radio-primary" type="radio" name="paymentMethod" value="paypal" checked={paymentMethod === "paypal"} onChange={(event) => setPaymentMethod(event.target.value)} />
                <span>PayPal</span>
              </span>
              <span className="payment-method__brand payment-method__brand--paypal" aria-hidden="true">PayPal</span>
            </label>

            <label className="payment-method border-base-300" htmlFor="payment-bizum">
              <span className="payment-method__choice">
                <input id="payment-bizum" className="radio radio-primary" type="radio" name="paymentMethod" value="bizum" checked={paymentMethod === "bizum"} onChange={(event) => setPaymentMethod(event.target.value)} />
                <span>Bizum</span>
              </span>
              <span className="payment-method__brand payment-method__brand--bizum" aria-hidden="true">bizum</span>
            </label>
          </form>
        </section>

        <OrderSummary
          subtotal={subtotal}
          shipping={shipping}
          total={total}
          itemCount={itemCount}
          buttonLabel="Revisar la comanda"
          buttonType="submit"
          formId={paymentFormId}
        />
      </div>
    </>
  )

  return (
    <section className="checkout-page" aria-label="Configurar pagament">
      <div className="checkout-page__container">
        <Link to="/checkout" className="checkout-page__back text-primary">
          <HiArrowLeft className="checkout-page__back-icon" aria-hidden="true" />
          Tornar a les dades
        </Link>

        <header className="checkout-page__header">
          <h1>Tramitar comanda</h1>
        </header>

        {content}
      </div>
    </section>
  )
}

export default CheckoutPayment
