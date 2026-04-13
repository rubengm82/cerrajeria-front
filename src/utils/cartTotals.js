export const formatPrice = (price) => {
  const numericPrice = Number(price || 0)

  return new Intl.NumberFormat("ca-ES", {
    style: "currency",
    currency: "EUR",
  }).format(numericPrice)
}

export const getProductPrice = (product) => {
  const price = Number(product?.price || 0)
  const discount = Number(product?.discount || 0)

  return discount <= 0 ? price : price * (1 - discount / 100)
}

export const getCartTotals = (products = []) => {
  const itemCount = products.reduce((total, product) => total + Number(product?.pivot?.quantity || 0), 0)
  const subtotal = products.reduce((total, product) => {
    const quantity = Number(product?.pivot?.quantity || 0)
    return total + getProductPrice(product) * quantity
  }, 0)
  const shipping = 0

  return {
    itemCount,
    subtotal,
    shipping,
    total: subtotal + shipping,
  }
}
