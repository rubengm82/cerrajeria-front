import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { HiArrowLeft } from "react-icons/hi2"
import { useAuth } from "../../context/AuthContext"
import { getCommerceSettings } from "../../api/commerce_settings_api"
import { getCartOrder } from "../../api/orders_api"
import CheckoutSteps from "../../components/CheckoutSteps"
import LoadingAnimation from "../../components/LoadingAnimation"
import OrderSummary from "../../components/OrderSummary"
import { getCartTotals } from "../../utils/cartTotals"
import { getLocalCartItems } from "../../utils/localCart"
import "../../../scss/main_shop.scss"

const checkoutDataKey = "checkoutCustomerData"

const getInitialFormData = (user) => {
  const savedData = JSON.parse(sessionStorage.getItem(checkoutDataKey) || "{}")

  return {
    name: savedData.name || user?.name || "",
    last_name_one: savedData.last_name_one || user?.last_name_one || "",
    last_name_second: savedData.last_name_second || user?.last_name_second || "",
    dni: savedData.dni || user?.dni || "",
    phone: savedData.phone || user?.phone || "",
    email: savedData.email || user?.email || "",
    address: savedData.address || user?.address || "",
    zip_code: savedData.zip_code || user?.zip_code || "",
    installation_address: savedData.installation_address || user?.address || "",
    shipping_address: savedData.shipping_address || user?.address || "",
  }
}

function Checkout() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [formData, setFormData] = useState(() => JSON.parse(sessionStorage.getItem(checkoutDataKey) || "{}"))
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

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    sessionStorage.setItem(checkoutDataKey, JSON.stringify({
      ...getInitialFormData(user),
      ...formData,
    }))
    navigate("/checkout/payment")
  }

  const getFieldValue = (fieldName) => formData[fieldName] ?? getInitialFormData(user)[fieldName]

  const products = [
    ...(user ? cartOrder?.products || [] : getLocalCartItems().filter((item) => (item.cartItemType || "product") === "product")).map((product) => ({ ...product, cartItemType: "product" })),
    ...(user ? cartOrder?.packs || [] : getLocalCartItems().filter((item) => item.cartItemType === "pack")).map((pack) => ({ ...pack, cartItemType: "pack" })),
  ]
  const { itemCount, subtotal, shipping, installation, total } = getCartTotals(products, commerceSettings)
  const userDataDescriptionId = "checkout-user-data-description"
  const checkoutFormId = "checkout-user-data-form"

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
      <CheckoutSteps activeStep={1} />

      <div className="checkout-page__layout">
        <section className="checkout-page__panel border-base-300 bg-base-100" aria-labelledby="checkout-user-data-title" aria-describedby={userDataDescriptionId}>
          <header className="checkout-page__panel-header">
            <h2 id="checkout-user-data-title">Dades personals</h2>
            <p id={userDataDescriptionId} className="text-base-400">Introdueix les teves dades per processar la comanda.</p>
          </header>

          <form id={checkoutFormId} className="checkout-form" onSubmit={handleSubmit} aria-label="Dades personals i adreces">
            <div className="checkout-form__grid">
              <label className="checkout-form__field" htmlFor="checkout-name">
                <span>Nom *</span>
                <input id="checkout-name" className="input input-bordered" type="text" name="name" value={getFieldValue("name")} onChange={handleChange} aria-describedby={userDataDescriptionId} required />
              </label>

              <label className="checkout-form__field" htmlFor="checkout-last-name-one">
                <span>Primer cognom *</span>
                <input id="checkout-last-name-one" className="input input-bordered" type="text" name="last_name_one" value={getFieldValue("last_name_one")} onChange={handleChange} aria-describedby={userDataDescriptionId} required />
              </label>

              <label className="checkout-form__field" htmlFor="checkout-last-name-second">
                <span>Segon cognom</span>
                <input id="checkout-last-name-second" className="input input-bordered" type="text" name="last_name_second" value={getFieldValue("last_name_second")} onChange={handleChange} aria-describedby={userDataDescriptionId} />
              </label>

              <label className="checkout-form__field" htmlFor="checkout-dni">
                <span>DNI</span>
                <input id="checkout-dni" className="input input-bordered" type="text" name="dni" value={getFieldValue("dni")} onChange={handleChange} aria-describedby={userDataDescriptionId} />
              </label>

              <label className="checkout-form__field" htmlFor="checkout-phone">
                <span>Telèfon</span>
                <input id="checkout-phone" className="input input-bordered" type="tel" name="phone" value={getFieldValue("phone")} onChange={handleChange} aria-describedby={userDataDescriptionId} />
              </label>

              <label className="checkout-form__field" htmlFor="checkout-email">
                <span>Correu electrònic *</span>
                <input id="checkout-email" className="input input-bordered" type="email" name="email" value={getFieldValue("email")} onChange={handleChange} aria-describedby={userDataDescriptionId} required />
              </label>

              <label className="checkout-form__field checkout-form__field--wide" htmlFor="checkout-address">
                <span>Adreça del client *</span>
                <input id="checkout-address" className="input input-bordered" type="text" name="address" value={getFieldValue("address")} onChange={handleChange} aria-describedby={userDataDescriptionId} required />
              </label>

              <label className="checkout-form__field" htmlFor="checkout-zip-code">
                <span>Codi postal *</span>
                <input id="checkout-zip-code" className="input input-bordered" type="text" name="zip_code" value={getFieldValue("zip_code")} onChange={handleChange} aria-describedby={userDataDescriptionId} required />
              </label>

              <label className="checkout-form__field checkout-form__field--wide" htmlFor="checkout-installation-address">
                <span>Adreça d'instal·lació *</span>
                <input id="checkout-installation-address" className="input input-bordered" type="text" name="installation_address" value={getFieldValue("installation_address")} onChange={handleChange} aria-describedby={userDataDescriptionId} required />
              </label>

              <label className="checkout-form__field checkout-form__field--wide" htmlFor="checkout-shipping-address">
                <span>Adreça d'enviament *</span>
                <input id="checkout-shipping-address" className="input input-bordered" type="text" name="shipping_address" value={getFieldValue("shipping_address")} onChange={handleChange} aria-describedby={userDataDescriptionId} required />
              </label>
            </div>
          </form>
        </section>

        <OrderSummary
          subtotal={subtotal}
          shipping={shipping}
          installation={installation}
          total={total}
          itemCount={itemCount}
          buttonLabel="Continuar amb el pagament"
          buttonType="submit"
          formId={checkoutFormId}
        />
      </div>
    </>
  )

  return (
    <section className="checkout-page" aria-label="Tramitar comanda">
      <div className="checkout-page__container">
        <Link to="/cart" className="checkout-page__back text-primary">
          <HiArrowLeft className="checkout-page__back-icon" aria-hidden="true" />
          Tornar al carret
        </Link>

        <header className="checkout-page__header">
          <h1>Tramitar comanda</h1>
        </header>

        {content}
      </div>
    </section>
  )
}

export default Checkout
