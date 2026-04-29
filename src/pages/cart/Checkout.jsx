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
import { getCartTotals, hasInstallationSelected } from "../../utils/cartTotals"
import { getLocalCartItems } from "../../utils/localCart"
import "../../../scss/main_shop.scss"

const checkoutDataKey = "checkoutCustomerData"
const provinciasEspana = [
  "Álava", "Albacete", "Alicante", "Almería", "Asturias", "Ávila", "Badajoz", "Baleares", "Barcelona", "Burgos", "Cáceres", "Cádiz", "Cantabria", "Castellón", "Ciudad Real", "Córdoba", "A Coruña", "Cuenca", "Girona", "Granada", "Guadalajara", "Guipúzcoa", "Huelva", "Huesca", "Jaén", "León", "Lleida", "La Rioja", "Lugo", "Madrid", "Málaga", "Murcia", "Navarra", "Ourense", "Palencia", "Pontevedra", "Salamanca", "Santa Cruz de Tenerife", "Segovia", "Sevilla", "Soria", "Tarragona", "Teruel", "Toledo", "Valencia", "Valladolid", "Vizcaya", "Zamora", "Zaragoza"
]

const parseAddress = (address) => {
  if (!address) return { street: "", floor: "", staircase: "" }

  const parts = address.split(",").map((part) => part.trim())

  return {
    street: parts[0] || "",
    floor: parts[1] || "",
    staircase: parts[2] || "",
  }
}

const normalizeAddressPart = (value) => (
  typeof value === "string" ? value.trim() : ""
)

const joinAddress = (street, floor, staircase) => (
  [street, floor, staircase]
    .map(normalizeAddressPart)
    .filter(Boolean)
    .join(", ")
)

const getInitialFormData = (user) => {
  const savedData = JSON.parse(sessionStorage.getItem(checkoutDataKey) || "{}")
  const defaultAddress = savedData.address || savedData.shipping_address || savedData.installation_address || user?.shipping_address || user?.address || ""
  const defaultZipCode = savedData.zip_code || savedData.shipping_zip_code || user?.shipping_zip_code || user?.zip_code || ""
  const defaultProvince = savedData.province || savedData.shipping_province || user?.shipping_province || user?.province || ""
  const parsedDefaultAddress = parseAddress(defaultAddress)
  const parsedBillingAddress = parseAddress(savedData.billing_address || user?.billing_address || "")
  const parsedInstallationAddress = parseAddress(savedData.installation_address || "")

  return {
    name: savedData.name || user?.name || "",
    last_name_one: savedData.last_name_one || user?.last_name_one || "",
    last_name_second: savedData.last_name_second || user?.last_name_second || "",
    dni: savedData.dni || user?.dni || "",
    phone: savedData.phone || user?.phone || "",
    email: savedData.email || user?.email || "",
    address: defaultAddress,
    street: savedData.street || parsedDefaultAddress.street,
    floor: savedData.floor || parsedDefaultAddress.floor,
    staircase: savedData.staircase || parsedDefaultAddress.staircase,
    zip_code: defaultZipCode,
    province: defaultProvince,
    country: "España",
    shipping_address: savedData.shipping_address || defaultAddress,
    installation_address: savedData.installation_address || "",
    shipping_zip_code: savedData.shipping_zip_code || defaultZipCode,
    installation_zip_code: savedData.installation_zip_code || "",
    shipping_province: savedData.shipping_province || defaultProvince,
    installation_province: savedData.installation_province || "",
    shipping_country: "España",
    installation_country: "España",
    installation_street: savedData.installation_street || parsedInstallationAddress.street,
    installation_floor: savedData.installation_floor || parsedInstallationAddress.floor,
    installation_staircase: savedData.installation_staircase || parsedInstallationAddress.staircase,
    billing_address: savedData.billing_address || user?.billing_address || "",
    billing_street: savedData.billing_street || parsedBillingAddress.street,
    billing_floor: savedData.billing_floor || parsedBillingAddress.floor,
    billing_staircase: savedData.billing_staircase || parsedBillingAddress.staircase,
    billing_zip_code: savedData.billing_zip_code || user?.billing_zip_code || "",
    billing_province: savedData.billing_province || user?.billing_province || "",
    billing_country: "España",
    use_billing_address: false,
    use_installation_address: Boolean(savedData.use_installation_address),
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
  const { data: currentProducts = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await getProducts()
      return response.data
    },
    retry: 1,
  })

  const handleChange = (event) => {
    const { name, type, checked, value } = event.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const mergedFormData = {
      ...getInitialFormData(user),
      ...formData,
    }
    const useInstallationAddress = hasInstallationProducts && Boolean(mergedFormData.use_installation_address)
    const address = joinAddress(mergedFormData.street, mergedFormData.floor, mergedFormData.staircase)
    const billingAddress = joinAddress(mergedFormData.billing_street, mergedFormData.billing_floor, mergedFormData.billing_staircase)
    const installationAddress = useInstallationAddress ? joinAddress(mergedFormData.installation_street, mergedFormData.installation_floor, mergedFormData.installation_staircase) : null

    sessionStorage.setItem(checkoutDataKey, JSON.stringify({
      ...mergedFormData,
      address,
      street: mergedFormData.street,
      floor: mergedFormData.floor,
      staircase: mergedFormData.staircase,
      zip_code: mergedFormData.zip_code,
      province: mergedFormData.province,
      country: "España",
      shipping_address: address,
      installation_address: installationAddress,
      shipping_zip_code: mergedFormData.zip_code,
      installation_zip_code: useInstallationAddress ? mergedFormData.installation_zip_code : null,
      shipping_province: mergedFormData.province,
      installation_province: useInstallationAddress ? mergedFormData.installation_province : null,
      shipping_country: "España",
      installation_country: useInstallationAddress ? "España" : null,
      installation_street: useInstallationAddress ? mergedFormData.installation_street : null,
      installation_floor: useInstallationAddress ? mergedFormData.installation_floor : null,
      installation_staircase: useInstallationAddress ? mergedFormData.installation_staircase : null,
      billing_address: mergedFormData.use_billing_address ? billingAddress : "",
      billing_street: mergedFormData.use_billing_address ? mergedFormData.billing_street : "",
      billing_floor: mergedFormData.use_billing_address ? mergedFormData.billing_floor : "",
      billing_staircase: mergedFormData.use_billing_address ? mergedFormData.billing_staircase : "",
      billing_zip_code: mergedFormData.use_billing_address ? mergedFormData.billing_zip_code : "",
      billing_province: mergedFormData.use_billing_address ? mergedFormData.billing_province : "",
      billing_country: "España",
      use_billing_address: Boolean(mergedFormData.use_billing_address),
      use_installation_address: useInstallationAddress,
    }))
    navigate("/checkout/payment")
  }

  const getFieldValue = (fieldName) => formData[fieldName] ?? getInitialFormData(user)[fieldName]

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
  const hasInstallationProducts = hasInstallationSelected(products)
  const { itemCount, subtotalExcludingVat, iva, shipping, installation, keys, total } = getCartTotals(products, commerceSettings)
  const userDataDescriptionId = "checkout-user-data-description"
  const checkoutFormId = "checkout-user-data-form"
  const useInstallationAddress = hasInstallationProducts && Boolean(getFieldValue("use_installation_address"))
  const hasCartItems = products.length > 0

  useEffect(() => {
    if (authLoading || (user && isLoading)) {
      return
    }

    if (!isError && !hasCartItems) {
      navigate("/cart", { replace: true })
    }
  }, [authLoading, hasCartItems, isError, isLoading, navigate, user])

  if (!isError && !authLoading && !(user && isLoading) && !hasCartItems) {
    return null
  }

  const content = authLoading || (user && isLoading) ? (
    <CheckoutSkeleton step={1} />
  ) : user && isError ? (
    <div className="checkout-page__notice border-base-300 bg-base-100" role="alert">
      <h2>No hem pogut carregar la comanda</h2>
      <p className="text-base-400">Torna-ho a provar d'aquí a uns instants.</p>
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
                <input id="checkout-name" className="input input-bordered" type="text" name="name" value={getFieldValue("name")} onChange={handleChange} aria-describedby={userDataDescriptionId} placeholder="Ex: Juan" required />
              </label>

              <label className="checkout-form__field" htmlFor="checkout-last-name-one">
                <span>Primer cognom *</span>
                <input id="checkout-last-name-one" className="input input-bordered" type="text" name="last_name_one" value={getFieldValue("last_name_one")} onChange={handleChange} aria-describedby={userDataDescriptionId} placeholder="Ex: García" required />
              </label>

              <label className="checkout-form__field" htmlFor="checkout-last-name-second">
                <span>Segon cognom</span>
                <input id="checkout-last-name-second" className="input input-bordered" type="text" name="last_name_second" value={getFieldValue("last_name_second")} onChange={handleChange} aria-describedby={userDataDescriptionId} placeholder="Ex: López" />
              </label>

              <label className="checkout-form__field" htmlFor="checkout-dni">
                <span>DNI</span>
                <input id="checkout-dni" className="input input-bordered" type="text" name="dni" value={getFieldValue("dni")} onChange={handleChange} aria-describedby={userDataDescriptionId} placeholder="Ex: 12345678A" />
              </label>

              <label className="checkout-form__field" htmlFor="checkout-phone">
                <span>Telèfon</span>
                <input id="checkout-phone" className="input input-bordered" type="tel" name="phone" value={getFieldValue("phone")} onChange={handleChange} aria-describedby={userDataDescriptionId} placeholder="Ex: 600123123" />
              </label>

              <label className="checkout-form__field" htmlFor="checkout-email">
                <span>Correu electrònic *</span>
                <input id="checkout-email" className="input input-bordered" type="email" name="email" value={getFieldValue("email")} onChange={handleChange} aria-describedby={userDataDescriptionId} placeholder="Ex: client@email.com" required />
              </label>

              <div className="checkout-form__field checkout-form__field--wide">
                <p className="font-medium mb-3">Dirección de envío</p>
              </div>

              <label className="checkout-form__field checkout-form__field--wide" htmlFor="checkout-address">
                <span>Carrer / Porta *</span>
                <input id="checkout-address" className="input input-bordered" type="text" name="street" value={getFieldValue("street")} onChange={handleChange} aria-describedby={userDataDescriptionId} placeholder="Carrer, número de porta..." required />
              </label>

              <label className="checkout-form__field" htmlFor="checkout-zip-code">
                <span>Codi postal *</span>
                <input id="checkout-zip-code" className="input input-bordered" type="text" name="zip_code" value={getFieldValue("zip_code")} onChange={handleChange} aria-describedby={userDataDescriptionId} placeholder="Ex: 08001" required />
              </label>

              <label className="checkout-form__field" htmlFor="checkout-floor">
                <span>Pis</span>
                <input id="checkout-floor" className="input input-bordered" type="text" name="floor" value={getFieldValue("floor")} onChange={handleChange} aria-describedby={userDataDescriptionId} placeholder="Pis (ex: 1r, 2n)" />
              </label>

              <label className="checkout-form__field" htmlFor="checkout-staircase">
                <span>Escala</span>
                <input id="checkout-staircase" className="input input-bordered" type="text" name="staircase" value={getFieldValue("staircase")} onChange={handleChange} aria-describedby={userDataDescriptionId} placeholder="Escala (ex.: A, B)" />
              </label>

              <label className="checkout-form__field" htmlFor="checkout-province">
                <span>Província *</span>
                <select id="checkout-province" className="select select-bordered w-full" name="province" value={getFieldValue("province")} onChange={handleChange} aria-describedby={userDataDescriptionId} required>
                  <option value="">Selecciona una província</option>
                  {provinciasEspana.map((provincia) => (
                    <option key={provincia} value={provincia}>{provincia}</option>
                  ))}
                </select>
              </label>

              <label className="checkout-form__field" htmlFor="checkout-country">
                <span>País</span>
                <input id="checkout-country" className="input input-bordered" type="text" name="country" value="España" disabled aria-describedby={userDataDescriptionId} />
              </label>

              <div className="checkout-form checkout-form__field--wide">
                <label className="flex items-center justify-between gap-4 rounded-xl border border-base-300 bg-base-200/40 px-4 py-3 cursor-pointer" htmlFor="checkout-use-billing-address">
                  <div>
                    <p className="font-medium">Afegir adreça de facturació diferent</p>
                    <p className="text-sm text-base-400">Si la factura ha d'anar a una altra adreça, activa aquesta opció.</p>
                  </div>
                  <input
                    id="checkout-use-billing-address"
                    className="toggle toggle-primary"
                    type="checkbox"
                    name="use_billing_address"
                    checked={Boolean(getFieldValue("use_billing_address"))}
                    onChange={handleChange}
                  />
                </label>
              </div>
              {getFieldValue("use_billing_address") && (
                <>
                  <div className="checkout-form__field checkout-form__field--wide">
                    <p className="font-medium mb-3">Dirección de facturación</p>
                  </div>

                  <label className="checkout-form__field checkout-form__field--wide" htmlFor="checkout-billing-address">
                    <span>Carrer / Porta de facturació *</span>
                    <input
                      id="checkout-billing-address"
                      className="input input-bordered"
                      type="text"
                      name="billing_street"
                      value={getFieldValue("billing_street")}
                      onChange={handleChange}
                      aria-describedby={userDataDescriptionId}
                      placeholder="Carrer, número de porta..."
                      required={Boolean(getFieldValue("use_billing_address"))}
                    />
                  </label>

                  <label className="checkout-form__field" htmlFor="checkout-billing-floor">
                    <span>Pis</span>
                    <input
                      id="checkout-billing-floor"
                      className="input input-bordered"
                      type="text"
                      name="billing_floor"
                      value={getFieldValue("billing_floor")}
                      onChange={handleChange}
                      aria-describedby={userDataDescriptionId}
                      placeholder="Pis (ex: 1r, 2n)"
                    />
                  </label>

                  <label className="checkout-form__field" htmlFor="checkout-billing-staircase">
                    <span>Escala</span>
                    <input
                      id="checkout-billing-staircase"
                      className="input input-bordered"
                      type="text"
                      name="billing_staircase"
                      value={getFieldValue("billing_staircase")}
                      onChange={handleChange}
                      aria-describedby={userDataDescriptionId}
                      placeholder="Escala (ex.: A, B)"
                    />
                  </label>

                  <label className="checkout-form__field" htmlFor="checkout-billing-zip-code">
                    <span>Codi postal *</span>
                    <input
                      id="checkout-billing-zip-code"
                      className="input input-bordered"
                      type="text"
                      name="billing_zip_code"
                      value={getFieldValue("billing_zip_code")}
                      onChange={handleChange}
                      aria-describedby={userDataDescriptionId}
                      placeholder="Ex: 08021"
                      required={Boolean(getFieldValue("use_billing_address"))}
                    />
                  </label>

                  <label className="checkout-form__field" htmlFor="checkout-billing-province">
                    <span>Província *</span>
                    <select
                      id="checkout-billing-province"
                      name="billing_province"
                      value={getFieldValue("billing_province")}
                      onChange={handleChange}
                      className="select select-bordered w-full"
                      aria-describedby={userDataDescriptionId}
                      required={Boolean(getFieldValue("use_billing_address"))}
                    >
                      <option value="">Selecciona una província</option>
                      {provinciasEspana.map((provincia) => (
                        <option key={provincia} value={provincia}>{provincia}</option>
                      ))}
                    </select>
                  </label>

                  <label className="checkout-form__field" htmlFor="checkout-billing-country">
                    <span>País</span>
                    <input
                      id="checkout-billing-country"
                      className="input input-bordered"
                      type="text"
                      name="billing_country"
                      value="España"
                      disabled
                      aria-describedby={userDataDescriptionId}
                    />
                  </label>
                </>
              )}
              {hasInstallationProducts && (
                <div className="checkout-form checkout-form__field--wide">
                  <label className="flex items-center justify-between gap-4 rounded-xl border border-base-300 bg-base-200/40 px-4 py-3 cursor-pointer" htmlFor="checkout-use-installation-address">
                    <div>
                      <p className="font-medium">Afegir adreça de instal·lació diferent</p>
                      <p className="text-sm text-base-400">Si la instal·lació ha de ser en una altra adreça, activa aquesta opció.</p>
                    </div>
                    <input
                      id="checkout-use-installation-address"
                      className="toggle toggle-primary"
                      type="checkbox"
                      name="use_installation_address"
                      checked={useInstallationAddress}
                      onChange={handleChange}
                    />
                  </label>
                </div>
              )}

              {useInstallationAddress && (
                <>
                  <div className="checkout-form__field checkout-form__field--wide">
                    <p className="font-medium mb-3">Dirección de instal·lació</p>
                  </div>

                  <label className="checkout-form__field checkout-form__field--wide" htmlFor="checkout-installation-address">
                    <span>Carrer / Porta de instal·lació *</span>
                    <input
                      id="checkout-installation-address"
                      className="input input-bordered"
                      type="text"
                      name="installation_street"
                      value={getFieldValue("installation_street")}
                      onChange={handleChange}
                      aria-describedby={userDataDescriptionId}
                      placeholder="Carrer, número de porta..."
                      required={useInstallationAddress}
                    />
                  </label>

                  <label className="checkout-form__field" htmlFor="checkout-installation-floor">
                    <span>Pis</span>
                    <input
                      id="checkout-installation-floor"
                      className="input input-bordered"
                      type="text"
                      name="installation_floor"
                      value={getFieldValue("installation_floor")}
                      onChange={handleChange}
                      aria-describedby={userDataDescriptionId}
                      placeholder="Pis (ex: 1r, 2n)"
                    />
                  </label>

                  <label className="checkout-form__field" htmlFor="checkout-installation-staircase">
                    <span>Escala</span>
                    <input
                      id="checkout-installation-staircase"
                      className="input input-bordered"
                      type="text"
                      name="installation_staircase"
                      value={getFieldValue("installation_staircase")}
                      onChange={handleChange}
                      aria-describedby={userDataDescriptionId}
                      placeholder="Escala (ex.: A, B)"
                    />
                  </label>

                  <label className="checkout-form__field" htmlFor="checkout-installation-zip-code">
                    <span>Codi postal *</span>
                    <input
                      id="checkout-installation-zip-code"
                      className="input input-bordered"
                      type="text"
                      name="installation_zip_code"
                      value={getFieldValue("installation_zip_code")}
                      onChange={handleChange}
                      aria-describedby={userDataDescriptionId}
                      placeholder="Ex: 08021"
                      required={useInstallationAddress}
                    />
                  </label>

                  <label className="checkout-form__field" htmlFor="checkout-installation-province">
                    <span>Província *</span>
                    <select
                      id="checkout-installation-province"
                      name="installation_province"
                      value={getFieldValue("installation_province")}
                      onChange={handleChange}
                      className="select select-bordered w-full"
                      aria-describedby={userDataDescriptionId}
                      required={useInstallationAddress}
                    >
                      <option value="">Selecciona una província</option>
                      {provinciasEspana.map((provincia) => (
                        <option key={provincia} value={provincia}>{provincia}</option>
                      ))}
                    </select>
                  </label>

                  <label className="checkout-form__field" htmlFor="checkout-installation-country">
                    <span>País</span>
                    <input
                      id="checkout-installation-country"
                      className="input input-bordered"
                      type="text"
                      name="installation_country"
                      value="España"
                      disabled
                      aria-describedby={userDataDescriptionId}
                    />
                  </label>
                </>
              )}

            </div>
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
