import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { HiArrowLeft } from "react-icons/hi2"
import { useAuth } from "../../context/AuthContext"
import { getCommerceSettings } from "../../api/commerce_settings_api"
import { getCartOrder } from "../../api/orders_api"
import { getProducts } from "../../api/products_api"
import CheckoutSteps from "../../components/CheckoutSteps"
import CheckoutSkeleton from "../../components/CheckoutSkeleton"
import OrderSummary from "../../components/OrderSummary"
import { getCartTotals } from "../../utils/cartTotals"
import { getLocalCartItems } from "../../utils/localCart"
import "../../../scss/main_shop.scss"

const checkoutPaymentKey = "checkoutPaymentMethod"
const checkoutDataKey = "checkoutCustomerData"

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
  const { data: commerceSettings } = useQuery({
    queryKey: ["commerce-settings"],
    queryFn: async () => {
      const response = await getCommerceSettings()
      return response.data
    },
    retry: 1,
  })
  const { data: currentProducts = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await getProducts()
      return response.data
    },
    retry: 1,
  })

  const currentProductsById = new Map(currentProducts.map((product) => [product.id, product]))

  const mappedProducts = user
    ? (cartOrder?.products || [])
        .filter(p => !p.pivot?.pack_id)
        .map(p => ({
          ...p,
          ...currentProductsById.get(p.id),
          cartItemType: "product",
          pivot: p.pivot
        }))
    : getLocalCartItems()
      .filter(item => (item.cartItemType || "product") === "product")
      .map((item) => {
        const currentProduct = currentProductsById.get(item.id)
        return currentProduct
          ? { ...item, ...currentProduct, cartItemType: "product", pivot: item.pivot }
          : item
      })

  const packProducts = user 
    ? (cartOrder?.products || [])
        .filter(p => p.pivot?.pack_id)
        .map(p => ({
          ...p,
          ...currentProductsById.get(p.id),
          pivot: p.pivot
        }))
    : []

  const mappedPacks = user
    ? (cartOrder?.packs || []).map(pack => ({
        ...pack,
        cartItemType: "pack",
        products: packProducts.filter(p => p.pivot?.pack_id === pack.id)
      }))
    : getLocalCartItems()
      .filter(item => item.cartItemType === "pack")
      .map(packItem => {
        const productsWithPivot = (packItem.products || []).map(p => ({
          ...p,
          ...currentProductsById.get(p.id),
          pivot: {
            quantity: p.pivot?.quantity || packItem.pivot?.quantity || 1,
            installation_requested: p.pivot?.installation_requested ?? false,
            keys_requested: p.pivot?.keys_requested ?? false,
            keys_quantity: p.pivot?.keys_quantity || 1,
          },
        }))
        return { ...packItem, cartItemType: "pack", products: productsWithPivot }
      })

  const products = [...mappedProducts, ...mappedPacks]
  const { itemCount, subtotalExcludingVat, iva, shipping, installation, keys, total } = getCartTotals(products, commerceSettings)
  const paymentDescriptionId = "checkout-payment-description"
  const paymentFormId = "checkout-payment-form"
  const customerData = JSON.parse(sessionStorage.getItem(checkoutDataKey) || "{}")
  const hasCartItems = products.length > 0
  const hasCustomerData = Boolean(
    customerData.name &&
    customerData.email &&
    customerData.shipping_address &&
    customerData.zip_code &&
    customerData.country &&
    (!customerData.use_billing_address || (customerData.billing_address && customerData.billing_zip_code && customerData.billing_country)) &&
    (!customerData.use_installation_address || (customerData.installation_address && customerData.installation_zip_code && customerData.installation_province))
  )

  useEffect(() => {
    if (authLoading || (user && isLoading)) {
      return
    }

    if (!isError && (!hasCartItems || !hasCustomerData)) {
      navigate("/cart", { replace: true })
    }
  }, [authLoading, hasCartItems, hasCustomerData, isError, isLoading, navigate, user])

  if (!isError && !authLoading && !(user && isLoading) && (!hasCartItems || !hasCustomerData)) {
    return null
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    sessionStorage.setItem(checkoutPaymentKey, paymentMethod)
    navigate("/checkout/review")
  }

  const content = authLoading || (user && isLoading) ? (
    <CheckoutSkeleton step={2} />
  ) : user && isError ? (
    <div className="checkout-page__notice border-base-300 bg-base-100" role="alert">
      <h2>No hem pogut carregar la comanda</h2>
      <p className="text-base-400">Torna-ho a provar d'aquí a uns instants.</p>
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
          subtotal={subtotalExcludingVat}
          iva={iva}
          shipping={shipping}
          installation={installation}
          keys={keys}
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
