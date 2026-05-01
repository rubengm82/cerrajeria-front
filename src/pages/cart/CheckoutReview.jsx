import { useEffect, useRef, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { HiArrowLeft, HiOutlinePhoto } from "react-icons/hi2"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "../../context/AuthContext"
import { getCommerceSettings } from "../../api/commerce_settings_api"
import { confirmStripeCheckoutSession, createCheckoutOrder, createStripeCheckoutSession, getCartOrder } from "../../api/orders_api"
import { getProducts } from "../../api/products_api"
import CheckoutSteps from "../../components/CheckoutSteps"
import CheckoutSkeleton from "../../components/CheckoutSkeleton"
import Notifications from "../../components/Notifications"
import OrderSummary from "../../components/OrderSummary"
import { formatPrice, getCartTotals, getPriceExcludingVat, getProductPrice } from "../../utils/cartTotals"
import { clearLocalCart, getLocalCartItems } from "../../utils/localCart"
import "../../../scss/main_shop.scss"

const checkoutDataKey = "checkoutCustomerData"
const checkoutPaymentKey = "checkoutPaymentMethod"
const shopNotificationKey = "shopNotification"
const checkoutSuccessNotification = {
  notificationType: "success",
  notificationMessage: "Compra realitzada correctament. Gràcies per la teva comanda.",
}

const paymentLabels = {
  card: "Targeta de crèdit",
  paypal: "PayPal",
  bizum: "Bizum",
}

const getImportantImage = (product) => (
  product?.images?.find((image) => image.is_important === true || image.is_important === 1) || product?.images?.[0]
)

const buildCheckoutItems = (items) => items.map((item) => {
  const baseItem = {
    type: item.cartItemType || "product",
    id: item.id,
    quantity: Number(item.pivot?.quantity || 1),
    installation_requested: Boolean(item.pivot?.installation_requested),
    keys_requested: Boolean(item.pivot?.keys_requested),
    keys_quantity: Number(item.pivot?.keys_quantity || 1),
  }

  if (item.cartItemType === "pack" && item.products) {
    baseItem.products = item.products.map((product) => ({
      id: product.id,
      pivot: {
        installation_requested: Boolean(product.pivot?.installation_requested),
        keys_requested: Boolean(product.pivot?.keys_requested),
        keys_quantity: Number(product.pivot?.keys_quantity || 1),
      },
    }))
  }

  return baseItem
})

function CheckoutReviewProduct({ product }) {
  const quantity = Number(product?.pivot?.quantity || 1)
  const currentPrice = getPriceExcludingVat(getProductPrice(product))
  const lineTotal = currentPrice * quantity
  const image = getImportantImage(product)
  const itemTypeLabel = product.cartItemType === "pack" ? "Pack" : product.category?.name || "Producte"
  const hasInstallation = Boolean(Number(product.pivot?.installation_requested))
  const hasKeys = Boolean(product.pivot?.keys_requested)
  const keysQuantity = Number(product.pivot?.keys_quantity || 1)
  const priceKeys = Number(product.price_keys || 0)
  const keysLineTotal = hasKeys ? priceKeys * keysQuantity : 0

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
        {hasInstallation && (
          <p className="text-primary font-semibold">Amb instal·lació</p>
        )}
        {hasKeys && (
          <p className="text-primary font-semibold">Amb {keysQuantity} clau/s ({formatPrice(priceKeys)}/unitat)</p>
        )}
      </div>

      <strong className="checkout-review-product__total">{formatPrice(lineTotal + keysLineTotal)}</strong>
    </article>
  )
}

function CheckoutReview() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const { user, loading: authLoading } = useAuth()
  const [cartOrder, setCartOrder] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [hasLoadedCartOrder, setHasLoadedCartOrder] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [isConfirmingStripeReturn, setIsConfirmingStripeReturn] = useState(false)
  const [notification, setNotification] = useState(null)
  const [dismissedStripeStatus, setDismissedStripeStatus] = useState(null)
  const isCompletingCheckoutRef = useRef(false)
  const customerData = JSON.parse(sessionStorage.getItem(checkoutDataKey) || "{}")
  const paymentMethod = sessionStorage.getItem(checkoutPaymentKey) || ""
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

  useEffect(() => {
    const loadCartOrder = async () => {
      if (authLoading || !user) {
        if (!authLoading && !user) {
          setHasLoadedCartOrder(true)
        }
        return
      }

      setIsLoading(true)
      setIsError(false)
      setHasLoadedCartOrder(false)

      try {
        const response = await getCartOrder()
        setCartOrder(response.data)
      } catch {
        setIsError(true)
      } finally {
        setIsLoading(false)
        setHasLoadedCartOrder(true)
      }
    }

    loadCartOrder()
  }, [authLoading, user])

  const currentProductsById = new Map(currentProducts.map((product) => [product.id, product]))

  const products = user ? (() => {
    const standaloneProducts = (cartOrder?.products || [])
      .filter(p => !p.pivot?.pack_id)
      .map(p => ({
        ...p,
        ...currentProductsById.get(p.id),
        cartItemType: "product",
        pivot: p.pivot
      }))
    
    const packProducts = (cartOrder?.products || [])
      .filter(p => p.pivot?.pack_id)
      .map(p => ({
        ...p,
        ...currentProductsById.get(p.id),
        pivot: p.pivot
      }))

    const packs = (cartOrder?.packs || []).map(pack => ({
      ...pack,
      cartItemType: "pack",
      products: packProducts.filter(p => p.pivot?.pack_id === pack.id)
    }))

    return [...standaloneProducts, ...packs]
  })() : getLocalCartItems()
    .filter(item => (item.cartItemType || "product") === "product" || item.cartItemType === "pack")
    .map((item) => {
      if (item.cartItemType === "pack") {
        const productsWithPivot = (item.products || []).map(p => ({
          ...p,
          ...currentProductsById.get(p.id),
          pivot: {
            quantity: p.pivot?.quantity || item.pivot?.quantity || 1,
            installation_requested: p.pivot?.installation_requested ?? false,
            keys_requested: p.pivot?.keys_requested ?? false,
            keys_quantity: p.pivot?.keys_quantity || 1,
          },
        }))
        return { ...item, products: productsWithPivot }
      }
      const currentProduct = currentProductsById.get(item.id)
      return currentProduct
        ? { ...item, ...currentProduct, cartItemType: "product", pivot: item.pivot }
        : item
    })
  const { itemCount, subtotalExcludingVat, iva, shipping, installation, keys, total } = getCartTotals(products, commerceSettings)
  const reviewDescriptionId = "checkout-review-description"
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
  const hasPaymentMethod = Boolean(paymentMethod)
  const isCardPayment = paymentMethod === "card"
  const stripeStatus = new URLSearchParams(location.search).get("stripe_status")
  const stripeSessionId = new URLSearchParams(location.search).get("session_id")
  const isSuccessfulStripeReturn = stripeStatus === "success"
  const stripeCancelledNotification = stripeStatus === "cancelled" && dismissedStripeStatus !== "cancelled"
    ? {
        id: "stripe-cancelled",
        type: "info",
        message: "Has cancel.lat el pagament amb targeta. Pots revisar la comanda i tornar-ho a provar.",
      }
    : null

  useEffect(() => {
    if (authLoading || (user && (!hasLoadedCartOrder || isLoading))) {
      return
    }

    if (!isCompletingCheckoutRef.current && !isConfirming && !isSuccessfulStripeReturn && !isError && (!hasCartItems || !hasCustomerData || !hasPaymentMethod)) {
      navigate("/cart", { replace: true })
    }
  }, [authLoading, hasCartItems, hasCustomerData, hasLoadedCartOrder, hasPaymentMethod, isConfirming, isError, isLoading, isSuccessfulStripeReturn, navigate, user])

  useEffect(() => {
    if (authLoading || !isSuccessfulStripeReturn) {
      return
    }

    if (!stripeSessionId) {
      setNotification({
        id: Date.now(),
        type: "error",
        message: "Stripe ha tornat sense identificador de sessió. No podem confirmar el pagament.",
      })
      return
    }

    const confirmStripeReturn = async () => {
      setIsConfirmingStripeReturn(true)

      try {
        const response = await confirmStripeCheckoutSession(stripeSessionId)
        const paymentStatus = response.data?.payment_status

        if (paymentStatus !== "paid") {
          isCompletingCheckoutRef.current = false
          setNotification({
            id: Date.now(),
            type: "info",
            message: "El pagament encara no consta com a completat. Si us plau, espera uns instants i torna-ho a provar.",
          })
          return
        }

        isCompletingCheckoutRef.current = true
        sessionStorage.removeItem(checkoutDataKey)
        sessionStorage.removeItem(checkoutPaymentKey)
        sessionStorage.setItem(shopNotificationKey, JSON.stringify(checkoutSuccessNotification))

        if (!user) {
          clearLocalCart()
        }

        queryClient.setQueryData(["cart-order"], null)
        queryClient.invalidateQueries({ queryKey: ["products"] })
        queryClient.invalidateQueries({ queryKey: ["packs"] })
        queryClient.invalidateQueries({ queryKey: ["cart-order"] })

        navigate("/", {
          replace: true,
          state: checkoutSuccessNotification,
        })
      } catch (error) {
        isCompletingCheckoutRef.current = false
        const validationMessage = error.response?.data?.errors
          ? Object.values(error.response.data.errors)[0]?.[0]
          : null

        setNotification({
          id: Date.now(),
          type: "error",
          message: validationMessage || error.response?.data?.message || "No hem pogut confirmar el pagament amb Stripe.",
        })
      } finally {
        setIsConfirmingStripeReturn(false)
      }
    }

    confirmStripeReturn()
  }, [authLoading, isSuccessfulStripeReturn, navigate, queryClient, stripeSessionId, user])

  if (!isCompletingCheckoutRef.current && !isConfirming && !isSuccessfulStripeReturn && !isError && !authLoading && !(user && (!hasLoadedCartOrder || isLoading)) && (!hasCartItems || !hasCustomerData || !hasPaymentMethod)) {
    return null
  }

  const buildCheckoutPayload = () => {
    const order = {
      shipping_address: customerData.shipping_address,
      shipping_zip_code: customerData.shipping_zip_code || customerData.zip_code,
      shipping_province: customerData.shipping_province || customerData.province,
      shipping_country: customerData.shipping_country || customerData.country,
      billing_address: customerData.use_billing_address ? customerData.billing_address : null,
      billing_zip_code: customerData.use_billing_address ? customerData.billing_zip_code : null,
      billing_province: customerData.use_billing_address ? customerData.billing_province : null,
      billing_country: customerData.use_billing_address ? customerData.billing_country : null,
      payment_method: paymentMethod,
    }

    if (customerData.use_installation_address) {
      order.installation_address = customerData.installation_address
      order.installation_zip_code = customerData.installation_zip_code
      order.installation_province = customerData.installation_province
      order.installation_country = customerData.installation_country
    }

    return {
      customer: {
        name: customerData.name,
        last_name_one: customerData.last_name_one,
        last_name_second: customerData.last_name_second,
        dni: customerData.dni,
        phone: customerData.phone,
        email: customerData.email,
        address: customerData.address,
        zip_code: customerData.zip_code,
        province: customerData.province,
        country: customerData.country,
        billing_address: customerData.use_billing_address ? customerData.billing_address : null,
        billing_zip_code: customerData.use_billing_address ? customerData.billing_zip_code : null,
        billing_province: customerData.use_billing_address ? customerData.billing_province : null,
        billing_country: customerData.use_billing_address ? customerData.billing_country : null,
      },
      order,
      items: buildCheckoutItems(products),
      success_url: `${window.location.origin}/checkout/review?stripe_status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${window.location.origin}/checkout/review?stripe_status=cancelled`,
      ...(user ? { user_id: user.id, cart_order_id: cartOrder?.id || null } : {}),
    }
  }

  const buildRegularCheckoutPayload = () => {
    const payload = buildCheckoutPayload()

    return {
      customer: payload.customer,
      order: payload.order,
      items: payload.items,
    }
  }

  const handleConfirm = () => {
    setNotification(null)

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
    isCompletingCheckoutRef.current = true
    setIsConfirming(true)

    try {
      if (isCardPayment) {
        const response = await createStripeCheckoutSession(buildCheckoutPayload())
        const checkoutUrl = response.data?.url || response.data?.checkout_url || response.data?.session_url

        if (!checkoutUrl) {
          throw new Error("stripe_checkout_url_missing")
        }

        window.location.href = checkoutUrl
        return
      }

      {
        const checkoutOrderData = buildRegularCheckoutPayload()
        await createCheckoutOrder(checkoutOrderData)

        if (!user) {
          clearLocalCart()
        } else {
          setCartOrder(null)
        }
      }

      sessionStorage.removeItem(checkoutDataKey)
      sessionStorage.removeItem(checkoutPaymentKey)
      sessionStorage.setItem(shopNotificationKey, JSON.stringify(checkoutSuccessNotification))
      queryClient.setQueryData(["cart-order"], null)
      queryClient.invalidateQueries({ queryKey: ["products"] })
      queryClient.invalidateQueries({ queryKey: ["packs"] })
      queryClient.invalidateQueries({ queryKey: ["cart-order"] })
      navigate("/", {
        replace: true,
        state: checkoutSuccessNotification,
      })
    } catch (error) {
      isCompletingCheckoutRef.current = false
      const validationMessage = error.response?.data?.errors
        ? Object.values(error.response.data.errors)[0]?.[0]
        : null

      setNotification({
        id: Date.now(),
        type: "error",
        message: validationMessage || error.response?.data?.message || (isCardPayment
          ? "No hem pogut iniciar el pagament amb Stripe. Revisa la configuració del backend i torna-ho a provar."
          : "No hem pogut generar la comanda. Revisa les dades i torna-ho a provar."),
      })
    } finally {
      setIsConfirming(false)
    }
  }

  const content = authLoading || (user && (!hasLoadedCartOrder || isLoading)) ? (
    <CheckoutSkeleton step={3} />
  ) : user && isError ? (
    <div className="checkout-page__notice border-base-300 bg-base-100" role="alert">
      <h2>No hem pogut carregar la comanda</h2>
      <p className="text-base-400">Torna-ho a provar d'aquí a uns instants.</p>
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
                <div><dt>Província</dt><dd>{customerData.province || "No indicada"}</dd></div>
                <div><dt>País</dt><dd>{customerData.country}</dd></div>
                {customerData.use_billing_address && customerData.billing_address && (
                  <div><dt>Adreça de facturació</dt><dd>{`${customerData.billing_address}, ${customerData.billing_zip_code || ""} ${customerData.billing_province || ""}, ${customerData.billing_country || ""}`}</dd></div>
                )}
              </dl>
            </section>

            <section className="checkout-review__section" aria-labelledby="checkout-review-address-title">
              <h3 id="checkout-review-address-title">Adreces de la comanda</h3>
              <dl className="checkout-review__details">
                <div><dt>Enviament</dt><dd>{`${customerData.shipping_address}, ${customerData.shipping_zip_code || ""} ${customerData.shipping_province || ""}, ${customerData.shipping_country || ""}`}</dd></div>
                {customerData.installation_address && (
                  <div><dt>Instal·lació</dt><dd>{`${customerData.installation_address}, ${customerData.installation_zip_code || ""} ${customerData.installation_province || ""}, ${customerData.installation_country || ""}`}</dd></div>
                )}
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
          subtotal={subtotalExcludingVat}
          iva={iva}
          shipping={shipping}
          installation={installation}
          keys={keys}
          total={total}
          itemCount={itemCount}
          buttonLabel={isConfirming || isConfirmingStripeReturn ? (isCardPayment ? "Connectant amb Stripe..." : "Generant comanda...") : (isCardPayment ? "Pagar amb targeta" : "Confirmar comanda")}
          disabled={isConfirming || isConfirmingStripeReturn}
          onAction={handleConfirm}
        />
      </div>
    </>
  )

  return (
    <section className="checkout-page" aria-label="Revisar comanda">
      {(notification || stripeCancelledNotification) && (
        <Notifications
          key={(notification || stripeCancelledNotification).id}
          type={(notification || stripeCancelledNotification).type}
          message={(notification || stripeCancelledNotification).message}
          onClose={() => {
            if (notification) {
              setNotification(null)
              return
            }

            setDismissedStripeStatus("cancelled")
          }}
        />
      )}

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
