export const formatPrice = (price) => {
  const numericPrice = Number(price || 0)

  return new Intl.NumberFormat("ca-ES", {
    style: "currency",
    currency: "EUR",
  }).format(numericPrice)
}

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

export const getInstallationBaseSubtotal = (products = []) => products.reduce((total, product) => {
  if (!isProductInstallable(product) || !Boolean(product?.pivot?.installation_requested)) {
    return total
  }

  return total + getProductPrice(product) * Number(product?.pivot?.quantity || 0)
}, 0)

export const getInstallationPrice = (products = [], settings = {}) => {
  if (!hasInstallationSelected(products)) {
    return 0
  }

  const installationBaseSubtotal = getInstallationBaseSubtotal(products)
  const rules = Array.isArray(settings?.installation_rules) ? settings.installation_rules : []
  const matchingRule = rules.find((rule) => {
    const minSubtotal = Number(rule?.min_subtotal || 0)
    const maxSubtotal = rule?.max_subtotal === null || rule?.max_subtotal === undefined || rule?.max_subtotal === ""
      ? null
      : Number(rule.max_subtotal)

    return installationBaseSubtotal >= minSubtotal && (maxSubtotal === null || installationBaseSubtotal <= maxSubtotal)
  })

  return Number(matchingRule?.price || 0)
}

export const getCartTotals = (products = [], settings = {}) => {
  const itemCount = products.reduce((total, product) => total + Number(product?.pivot?.quantity || 0), 0)
  const subtotal = products.reduce((total, product) => {
    const quantity = Number(product?.pivot?.quantity || 0)
    return total + getProductPrice(product) * quantity
  }, 0)
  const shipping = Number(settings?.shipping_price || 0)
  const installation = getInstallationPrice(products, settings)

  return {
    itemCount,
    subtotal,
    shipping,
    installation,
    total: subtotal + shipping + installation,
  }
}
