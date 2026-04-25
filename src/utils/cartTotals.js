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

export const hasInstallationSelected = (products = []) => products.some((product) => (
  isProductInstallable(product) && Boolean(product?.pivot?.installation_requested)
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

export const getCartTotals = (products = [], settings = {}) => {
  const itemCount = products.reduce((total, product) => total + Number(product?.pivot?.quantity || 0), 0)
  const subtotal = getCartSubtotal(products)
  const shipping = Number(settings?.shipping_price || 0)
  const installation = getInstallationPrice(products, settings)
  const subtotalExcludingVat = getCartSubtotalExcludingVat(products)
  const iva = getCartVat(products)

  return {
    itemCount,
    subtotal,
    subtotalExcludingVat,
    shipping,
    installation,
    iva,
    total: subtotal + shipping + installation,
  }
}
