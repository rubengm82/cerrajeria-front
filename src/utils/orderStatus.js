export const INSTALLATION_STATUSES = ['installation_pending', 'installation_confirmed', 'installation_finished']

export const orderHasInstallation = (order) => {
  const standaloneProductsWithInstallation = (order.products || [])
    .filter(p => !p.pivot?.pack_id && p.pivot?.installation_requested)

  const productsInPacksWithInstallation = (order.products || [])
    .filter(p => p.pivot?.pack_id && p.pivot?.installation_requested)

  return standaloneProductsWithInstallation.length > 0 || productsInPacksWithInstallation.length > 0
}

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
