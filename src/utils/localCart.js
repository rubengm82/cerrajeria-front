export const localCartKey = "guestCart"

const getStoredCart = () => {
  try {
    return JSON.parse(localStorage.getItem(localCartKey) || "[]")
  } catch {
    return []
  }
}

const getProductSnapshot = (product, quantity, cartItemType = product.cartItemType || "product") => ({
  ...product,
  cartItemType,
  pivot: {
    quantity,
  },
})

const getItemQuantity = (item) => Number(item?.pivot?.quantity || 1)

const getPackProductIds = (pack) => (pack.products || [])
  .filter((packProduct) => !packProduct?.deleted_at)
  .map((packProduct) => packProduct.id)

const getCartDemandForProduct = (cartItems, productId, ignoredItem) => cartItems.reduce((total, item) => {
  if (item === ignoredItem) {
    return total
  }

  const quantity = getItemQuantity(item)

  if ((item.cartItemType || "product") === "pack") {
    return getPackProductIds(item).includes(productId) ? total + quantity : total
  }

  return item.id === productId ? total + quantity : total
}, 0)

const getAvailableStockForItem = (product, cartItems, cartItemType = product.cartItemType || "product", ignoredItem) => {
  if (cartItemType === "pack") {
    const packStocks = (product.products || [])
      .filter((packProduct) => !packProduct?.deleted_at)
      .map((packProduct) => Number(packProduct.stock || 0) - getCartDemandForProduct(cartItems, packProduct.id, ignoredItem))

    const availableStock = Math.min(...packStocks)

    return Number.isFinite(availableStock) ? Math.max(0, availableStock) : 0
  }

  return Math.max(0, Number(product.stock || 0) - getCartDemandForProduct(cartItems, product.id, ignoredItem))
}

export const addProductToLocalCart = (product, quantity = 1, cartItemType = "product") => {
  const cartItems = getStoredCart()
  const existingItem = cartItems.find((item) => item.id === product.id && (item.cartItemType || "product") === cartItemType)
  const availableStock = getAvailableStockForItem(product, cartItems, cartItemType)

  if (availableStock <= 0) {
    return {
      added: false,
      items: cartItems,
    }
  }

  if (existingItem) {
    return {
      added: false,
      items: cartItems,
    }
  }

  const nextCartItems = [...cartItems, getProductSnapshot(product, Math.min(quantity, availableStock), cartItemType)]

  localStorage.setItem(localCartKey, JSON.stringify(nextCartItems))

  return {
    added: true,
    items: nextCartItems,
  }
}

export const updateLocalCartProduct = (productId, quantity, cartItemType = "product") => {
  const cartItems = getStoredCart()
  const nextCartItems = cartItems.map((item) => {
    if (item.id !== productId || (item.cartItemType || "product") !== cartItemType) {
      return item
    }

    const availableStock = getAvailableStockForItem(item, cartItems, cartItemType, item)
    return getProductSnapshot(item, Math.min(quantity, Math.max(1, availableStock)))
  })

  localStorage.setItem(localCartKey, JSON.stringify(nextCartItems))

  return nextCartItems
}

export const removeLocalCartProduct = (productId, cartItemType = "product") => {
  const nextCartItems = getStoredCart().filter((item) => item.id !== productId || (item.cartItemType || "product") !== cartItemType)

  localStorage.setItem(localCartKey, JSON.stringify(nextCartItems))

  return nextCartItems
}

export const getLocalCartItems = () => getStoredCart()

export const clearLocalCart = () => {
  localStorage.removeItem(localCartKey)
}

export const getLocalCartMergeItems = () => getStoredCart()
  .map((item) => ({
    type: (item.cartItemType || "product") === "pack" ? "pack" : "product",
    id: item.id,
    quantity: Number(item.pivot?.quantity || 1),
  }))
  .filter((item) => item.id && item.quantity > 0)
