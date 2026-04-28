import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { HiArrowLeft, HiOutlinePhoto } from "react-icons/hi2"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "../../context/AuthContext"
import { getCommerceSettings } from "../../api/commerce_settings_api"
import { createCheckoutOrder, getCartOrder, updateOrder } from "../../api/orders_api"
import CheckoutSteps from "../../components/CheckoutSteps"
import CheckoutSkeleton from "../../components/CheckoutSkeleton"
import Notifications from "../../components/Notifications"
import OrderSummary from "../../components/OrderSummary"
import { formatPrice, getCartTotals, getPriceExcludingVat, getProductPrice } from "../../utils/cartTotals"
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
  const queryClient = useQueryClient()
  const { user, loading: authLoading } = useAuth()
  const [cartOrder, setCartOrder] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [notification, setNotification] = useState(null)
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

  const products = user ? (() => {
    const standaloneProducts = (cartOrder?.products || [])
      .filter(p => !p.pivot?.pack_id)
      .map((product) => ({ ...product, cartItemType: "product" }))
    
    const packProductsMap = new Map()
    ;(cartOrder?.products || [])
      .filter(p => p.pivot?.pack_id)
      .forEach(p => {
        const packId = p.pivot.pack_id
        if (!packProductsMap.has(packId)) {
          packProductsMap.set(packId, [])
        }
        packProductsMap.get(packId).push(p)
      })

    const packs = (cartOrder?.packs || []).map(pack => ({
      ...pack,
      cartItemType: "pack",
      products: (packProductsMap.get(pack.id) || []).map(p => ({
        ...p,
        pivot: {
          ...p.pivot,
          quantity: p.pivot?.quantity || pack.pivot?.quantity || 1,
        }
      }))
    }))

    return [...standaloneProducts, ...packs]
  })() : getLocalCartItems().filter((item) => (item.cartItemType || "product") === "product" || item.cartItemType === "pack")
    .map((item) => ({ ...item, cartItemType: item.cartItemType || "product" }))
  const { itemCount, subtotalExcludingVat, iva, shipping, installation, keys, total } = getCartTotals(products, commerceSettings)
  const reviewDescriptionId = "checkout-review-description"
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
    setIsConfirming(true)

    try {
      if (user) {
        const orderData = {
          user_id: user.id,
          customer_name: customerData.name,
          customer_last_name_one: customerData.last_name_one,
          customer_last_name_second: customerData.last_name_second,
          customer_dni: customerData.dni,
          customer_phone: customerData.phone,
          customer_email: customerData.email,
          customer_address: customerData.address,
          customer_zip_code: customerData.zip_code,
          customer_province: customerData.province,
          customer_country: customerData.country,
          billing_address: customerData.use_billing_address ? customerData.billing_address : null,
          billing_zip_code: customerData.use_billing_address ? customerData.billing_zip_code : null,
          billing_province: customerData.use_billing_address ? customerData.billing_province : null,
          billing_country: customerData.use_billing_address ? customerData.billing_country : null,
          shipping_address: customerData.shipping_address,
          shipping_zip_code: customerData.shipping_zip_code || customerData.zip_code,
          shipping_province: customerData.shipping_province || customerData.province,
          shipping_country: customerData.shipping_country || customerData.country,
          installation_address: customerData.use_installation_address ? customerData.installation_address : null,
          installation_zip_code: customerData.use_installation_address ? customerData.installation_zip_code : null,
          installation_province: customerData.use_installation_address ? customerData.installation_province : null,
          installation_country: customerData.use_installation_address ? customerData.installation_country : null,
          payment_method: paymentMethod,
          status: "pending",
        }

        await updateOrder(cartOrder.id, orderData)
      } else {
        const checkoutOrderData = {
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
          order: {
            shipping_address: customerData.shipping_address,
            shipping_zip_code: customerData.shipping_zip_code || customerData.zip_code,
            shipping_province: customerData.shipping_province || customerData.province,
            shipping_country: customerData.shipping_country || customerData.country,
            billing_address: customerData.use_billing_address ? customerData.billing_address : null,
            billing_zip_code: customerData.use_billing_address ? customerData.billing_zip_code : null,
            billing_province: customerData.use_billing_address ? customerData.billing_province : null,
            billing_country: customerData.use_billing_address ? customerData.billing_country : null,
            payment_method: paymentMethod,
          },
          items: products.map((item) => {
            const baseItem = {
              type: item.cartItemType || "product",
              id: item.id,
              quantity: Number(item.pivot?.quantity || 1),
              installation_requested: Boolean(item.pivot?.installation_requested),
              keys_requested: Boolean(item.pivot?.keys_requested),
              keys_quantity: Number(item.pivot?.keys_quantity || 1),
            }

            if (item.cartItemType === "pack" && item.products) {
              baseItem.products = item.products.map(p => ({
                id: p.id,
                pivot: {
                  installation_requested: Boolean(p.pivot?.installation_requested),
                  keys_requested: Boolean(p.pivot?.keys_requested),
                  keys_quantity: Number(p.pivot?.keys_quantity || 1),
                }
              }))
            }

            return baseItem
          }),
        }

        if (customerData.use_installation_address) {
          checkoutOrderData.order.installation_address = customerData.installation_address
          checkoutOrderData.order.installation_zip_code = customerData.installation_zip_code
          checkoutOrderData.order.installation_province = customerData.installation_province
          checkoutOrderData.order.installation_country = customerData.installation_country
        }

        await createCheckoutOrder(checkoutOrderData)

        clearLocalCart()
      }

      sessionStorage.removeItem(checkoutDataKey)
      sessionStorage.removeItem(checkoutPaymentKey)
      queryClient.invalidateQueries({ queryKey: ["products"] })
      queryClient.invalidateQueries({ queryKey: ["packs"] })
      queryClient.invalidateQueries({ queryKey: ["cart-order"] })
      navigate(user ? "/my-orders" : "/products", {
        state: {
          notificationType: "success",
          notificationMessage: "La comanda s'ha generat correctament.",
        },
      })
    } catch (error) {
      const validationMessage = error.response?.data?.errors
        ? Object.values(error.response.data.errors)[0]?.[0]
        : null

      setNotification({
        id: Date.now(),
        type: "error",
        message: validationMessage || error.response?.data?.message || "No hem pogut generar la comanda. Revisa les dades i torna-ho a provar.",
      })
    } finally {
      setIsConfirming(false)
    }
  }

  const content = authLoading || (user && isLoading) ? (
    <CheckoutSkeleton step={3} />
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
          buttonLabel={isConfirming ? "Generant comanda..." : "Confirmar comanda"}
          disabled={isConfirming}
          onAction={handleConfirm}
        />
      </div>
    </>
  )

  return (
    <section className="checkout-page" aria-label="Revisar comanda">
      {notification && (
        <Notifications
          key={notification.id}
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
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
