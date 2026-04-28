export const formatPrice = (price) => {
  const numericPrice = Number(price || 0)

  return new Intl.NumberFormat("ca-ES", {
    style: "currency",
    currency: "EUR",
  }).format(numericPrice)
}

export const VAT_RATE = 0.21
export const VAT_DIVISOR = 1 + VAT_RATE

export const getPriceExcludingVat = (price) => Number(price || 0) / VAT_DIVISOR

export const getVatFromGrossPrice = (price) => Number(price || 0) - getPriceExcludingVat(price)

export const getProductPrice = (product) => {
  if (product?.cartItemType === "pack") {
    return Number(product?.total_price || 0)
  }

  const price = Number(product?.price || 0)
  const discount = Number(product?.discount || 0)

  return discount <= 0 ? price : price * (1 - discount / 100)
}

export const isProductInstallable = (product) => (
  product?.cartItemType !== "pack" && (product?.is_installable === true || product?.is_installable === 1 || product?.is_installable === "1")
)

export const hasProductKeys = (product) => (
  product?.cartItemType !== "pack" && Number(product?.price_keys || 0) > 0
)

export const hasInstallationSelected = (products = []) => products.some((product) => (
  isProductInstallable(product) && Boolean(product?.pivot?.installation_requested)
))

export const hasKeysSelected = (products = []) => products.some((product) => (
  hasProductKeys(product) && Boolean(product?.pivot?.keys_requested)
))

export const getCartSubtotal = (products = []) => products.reduce((total, product) => {
  const quantity = Number(product?.pivot?.quantity || 0)
  return total + getProductPrice(product) * quantity
}, 0)

export const getCartSubtotalExcludingVat = (products = []) => products.reduce((total, product) => {
  const quantity = Number(product?.pivot?.quantity || 0)
  return total + getPriceExcludingVat(getProductPrice(product)) * quantity
}, 0)

export const getCartVat = (products = []) => products.reduce((total, product) => {
  const quantity = Number(product?.pivot?.quantity || 0)
  return total + getVatFromGrossPrice(getProductPrice(product)) * quantity
}, 0)

export const getMatchingInstallationRule = (subtotal = 0, settings = {}) => {
  const rules = Array.isArray(settings?.installation_rules) ? settings.installation_rules : []

  return rules.find((rule) => {
    const minSubtotal = Number(rule?.min_subtotal || 0)
    const maxSubtotal = rule?.max_subtotal === null || rule?.max_subtotal === undefined || rule?.max_subtotal === ""
      ? null
      : Number(rule.max_subtotal)

    return subtotal >= minSubtotal && (maxSubtotal === null || subtotal <= maxSubtotal)
  })
}

export const getInstallationPrice = (products = [], settings = {}) => {
  if (!hasInstallationSelected(products)) {
    return 0
  }

  const cartSubtotal = getCartSubtotal(products)
  const matchingRule = getMatchingInstallationRule(cartSubtotal, settings)

  return Number(matchingRule?.price || 0)
}

export const getKeysPrice = (products = []) => products.reduce((total, product) => {
  if (!hasProductKeys(product) || !product?.pivot?.keys_requested) {
    return total
  }

  const keysQuantity = Number(product?.pivot?.keys_quantity || 1)
  const priceKeys = Number(product?.price_keys || 0)

  return total + priceKeys * keysQuantity
}, 0)

export const getCartTotals = (products = [], settings = {}) => {
  const allProducts = products.flatMap(item =>
    item.cartItemType === "pack" && item.products
      ? item.products.map(p => ({ ...p, pivot: { ...item.pivot, ...p.pivot } }))
      : [item]
  )

  const itemCount = allProducts.reduce((total, product) => total + Number(product?.pivot?.quantity || 0), 0)
  
  const subtotalGross = getCartSubtotal(products)
  const subtotalNet = getPriceExcludingVat(subtotalGross)
  
  const hasInstallation = hasInstallationSelected(allProducts)
  const installationGross = getInstallationPrice(allProducts, settings)
  const shippingGross = hasInstallation ? 0 : Number(settings?.shipping_price || 0)
  
  const keysGross = getKeysPrice(allProducts)

  // El IVA solo se calcula sobre productos ahora
  const taxableIva = (subtotalGross - subtotalNet)
  const totalGross = subtotalGross + shippingGross + installationGross + keysGross

  return {
    itemCount,
    subtotal: subtotalGross,
    subtotalExcludingVat: subtotalNet,
    shipping: shippingGross,
    shippingExcludingVat: shippingGross, // No se descuenta IVA
    installation: installationGross,
    installationExcludingVat: installationGross, // No se descuenta IVA
    keys: keysGross,
    keysExcludingVat: keysGross, // No se descuenta IVA (precio base de datos)
    iva: taxableIva,
    total: totalGross,
  }
}
