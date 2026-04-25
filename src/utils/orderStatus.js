export const INSTALLATION_STATUSES = ['installation_pending', 'installation_confirmed', 'installation_finished']

export const orderHasInstallation = (order) => (
  Array.isArray(order?.products) && order.products.some((product) => Boolean(product?.pivot?.installation_requested))
)

export const isInstallationOrder = (order) => (
  INSTALLATION_STATUSES.includes(order?.status) || orderHasInstallation(order)
)

export const getEffectiveOrderStatus = (order) => {
  if (!order) {
    return 'pending'
  }

  if (INSTALLATION_STATUSES.includes(order.status)) {
    return order.status
  }

  if (orderHasInstallation(order)) {
    return order.installation_scheduled_at ? 'installation_confirmed' : 'installation_pending'
  }

  return order.status
}
