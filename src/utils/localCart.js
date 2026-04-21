const localCartKey = "guestCart"

const getStoredCart = () => {
  try {
    return JSON.parse(localStorage.getItem(localCartKey) || "[]")
  } catch {
    return []
  }
}

const getProductSnapshot = (product, quantity, cartItemType = product.cartItemType || "product", installationRequested = product?.pivot?.installation_requested || false) => ({
  ...product,
  cartItemType,
  pivot: {
    quantity,
    installation_requested: cartItemType === "product" && !!product?.is_installable && !!installationRequested,
  },
})

export const addProductToLocalCart = (product, quantity = 1, cartItemType = "product", installationRequested = false) => {
  const cartItems = getStoredCart()
  const existingItem = cartItems.find((item) => item.id === product.id && (item.cartItemType || "product") === cartItemType)
  const availableStock = Number(product.stock || 0)

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

  const nextCartItems = [...cartItems, getProductSnapshot(product, Math.min(quantity, availableStock), cartItemType, installationRequested)]

  localStorage.setItem(localCartKey, JSON.stringify(nextCartItems))

  return {
    added: true,
    items: nextCartItems,
  }
}

export const updateLocalCartProduct = (productId, quantity, cartItemType = "product") => {
  const nextCartItems = getStoredCart().map((item) => (
    item.id === productId && (item.cartItemType || "product") === cartItemType
      ? getProductSnapshot(item, Math.min(quantity, Number(item.stock || 0)))
      : item
  ))

  localStorage.setItem(localCartKey, JSON.stringify(nextCartItems))

  return nextCartItems
}

export const updateLocalCartProductInstallation = (productId, installationRequested) => {
  const nextCartItems = getStoredCart().map((item) => (
    item.id === productId && (item.cartItemType || "product") === "product"
      ? getProductSnapshot(item, Number(item.pivot?.quantity || 1), "product", installationRequested)
      : item
  ))

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
    installation_requested: Boolean(item.pivot?.installation_requested),
  }))
  .filter((item) => item.id && item.quantity > 0)
