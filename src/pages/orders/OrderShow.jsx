import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getOrder } from '../../api/orders_api'
import { getCommerceSettings } from '../../api/commerce_settings_api'
import LoadingAnimation from '../../components/LoadingAnimation'
import { HiArrowLeft } from 'react-icons/hi'
import { formatPrice, getCartTotals, getMatchingInstallationRule, getPriceExcludingVat, getProductPrice, hasProductKeys } from '../../utils/cartTotals'
import { getEffectiveOrderStatus, isInstallationOrder, orderHasInstallation } from '../../utils/orderStatus'

const getOrderCustomerName = (order) => (
  [
    order.customer_name ?? order.user?.name,
    order.customer_last_name_one ?? order.user?.last_name_one,
    order.customer_last_name_second ?? order.user?.last_name_second,
  ].filter(Boolean).join(' ')
)

const getOrderItems = (order) => {
  const standaloneProducts = (order.products || [])
    .filter(p => !p.pivot?.pack_id)
    .map((product) => ({ ...product, cartItemType: 'product' }))

  const packProductsMap = new Map()
  ;(order.products || [])
    .filter(p => p.pivot?.pack_id)
    .forEach(p => {
      const packId = p.pivot.pack_id
      if (!packProductsMap.has(packId)) {
        packProductsMap.set(packId, [])
      }
      packProductsMap.get(packId).push(p)
    })

  const packs = (order.packs || []).map(pack => ({
    ...pack,
    cartItemType: 'pack',
    products: (packProductsMap.get(pack.id) || []).map(p => ({
      ...p,
      pivot: {
        ...p.pivot,
        quantity: p.pivot?.quantity || pack.pivot?.quantity || 1,
      }
    }))
  }))

  return [...standaloneProducts, ...packs]
}

const formatAlbaranNumber = (orderId) => `ALB-${orderId.toString().padStart(6, '0')}`

function OrderShow() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

   const fetchOrderAndSettings = useCallback(async () => {
     try {
       setLoading(true)
       const [orderRes, settingsRes] = await Promise.all([
         getOrder(id),
         getCommerceSettings()
       ])
       setOrder(orderRes.data)
       setSettings(settingsRes.data)
     } catch (err) {
       setError('Error al cargar la comanda')
       console.error('Error fetching order/settings:', err)
     } finally {
       setLoading(false)
     }
   }, [id])

   useEffect(() => {
     fetchOrderAndSettings()
   }, [fetchOrderAndSettings])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <LoadingAnimation heightClass="h-[calc(100vh-260px)]" />
    )
  }

  if (error) {
    return (
      <div className="p-4 md:p-0">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-base-content mb-2">Resum de la Comanda</h1>
          <p className="text-error">{error}</p>
          <Link to="/orders" className="btn btn-primary mt-4">
            <HiArrowLeft className="w-4 h-4 mr-2" />
            Tornar a les Comandes
          </Link>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="p-4 md:p-0">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-base-content mb-2">Resum de la Comanda</h1>
          <p className="text-base-400">Comanda no trobada</p>
          <Link to="/orders" className="btn btn-primary mt-4">
            <HiArrowLeft className="w-4 h-4 mr-2" />
            Tornar a les Comandes
          </Link>
        </div>
      </div>
    )
  }

    const orderItems = getOrderItems(order)
    const albaranNumber = formatAlbaranNumber(order.id)
    const { subtotalExcludingVat, iva, shippingExcludingVat, installationExcludingVat, keysExcludingVat, total, installation } = getCartTotals(orderItems, settings)

    const displayStatus = getEffectiveOrderStatus(order)
    const isInstallation = isInstallationOrder(order)
    const hasRequestedInstallation = orderHasInstallation(order)

  return (
    <div className="p-4 md:p-0">
      <div className="mb-6">
        <Link to="/orders" className='text-primary mb-2 flex items-center gap-2 cursor-pointer'>
          <HiArrowLeft className="size-5" />
          <p>Tornar a les Comandes</p>
        </Link>
        <h1 className="text-3xl font-bold text-base-content mb-2">Resum de la Comanda</h1>
        <div className="text-base-400">{albaranNumber}</div>
      </div>

      <div className="bg-base-100 rounded-lg shadow-md p-6 max-w-4xl mx-auto">
        {/* Order Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Informació de la Comanda</h2>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">ID:</span> {albaranNumber}</p>
              <p><span className="font-medium">Data Albarà:</span> {formatDate(order.created_at)}</p>
              {order.installation_scheduled_at && (
                 <p><span className="font-medium">Data d'Instal·lació:</span> {formatDate(order.installation_scheduled_at)}</p>
               )}
               {order.shipped_at && (
                 <p><span className="font-medium">Data d'Enviament:</span> {formatDate(order.shipped_at)}</p>
               )}
              <p><span className="font-medium">Estat:</span> 
                <span className={`badge ml-2 ${
                  displayStatus === 'completed' ? 'badge-success' :
                  displayStatus === 'pending' ? 'badge-error' :
                  displayStatus === 'shipped' ? 'badge-success' :
                  displayStatus === 'installation_confirmed' ? 'badge-warning' :
                  displayStatus === 'installation_pending' ? 'badge-error' :
                  displayStatus === 'installation_finished' ? 'badge-success' :
                  displayStatus === 'cancelled' ? 'badge-error' : 'badge-info'
                }`}>
                  {displayStatus === 'completed' ? 'Completada' :
                   displayStatus === 'pending' ? 'Pendent' :
                   displayStatus === 'shipped' ? 'Enviat' :
                   displayStatus === 'installation_confirmed' ? 'Instal·lació confirmada' :
                   displayStatus === 'installation_pending' ? 'Instal·lació pendent' :
                   displayStatus === 'installation_finished' ? 'Instal·lació finalitzada' :
                   displayStatus === 'cancelled' ? 'Cancel·lada' : displayStatus}
                </span>
              </p>
              <p><span className="font-medium">Mètode de Pagament:</span> {order.payment_method.charAt(0).toUpperCase() + order.payment_method.slice(1)}</p>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Informació del Client</h2>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Nom:</span> {getOrderCustomerName(order)}</p>
              <p><span className="font-medium">Correu:</span> {order.customer_email || order.user?.email || ''}</p>
              <p><span className="font-medium">Telèfon:</span> {order.customer_phone || order.user?.phone || ''}</p>
              <p><span className="font-medium">DNI:</span> {order.customer_dni || order.user?.dni || ''}</p>
              <p><span className="font-medium">Codi postal:</span> {order.customer_zip_code || order.user?.shipping_zip_code || ''}</p>
              <p><span className="font-medium">Província:</span> {order.customer_province || order.user?.shipping_province || ''}</p>
              <p><span className="font-medium">País:</span> {order.customer_country || order.user?.shipping_country || ''}</p>
              {order.billing_address && (
                <p><span className="font-medium">Adreça de Facturació:</span> {[order.billing_address, order.billing_zip_code, order.billing_province, order.billing_country].filter(Boolean).join(', ')}</p>
              )}
              {hasRequestedInstallation && (
                <p><span className="font-medium">Adreça d'Instal·lació:</span> {order.installation_address || order.shipping_address || ''}</p>
              )}
               <p><span className="font-medium">Adreça d'Enviament:</span> {order.shipping_address}</p>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Productes</h2>
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Producte</th>
                  <th>Codi</th>
                  <th className="text-center">Quantitat</th>
                  <th className="text-center">Instal·lació</th>
                  <th className="text-center">Claus</th>
                  <th className="text-right">Preu Unitari</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {orderItems.map((item) => {
                  let hasKeys = false
                  let keysInfo = '-'
                  let itemKeysPrice = 0

                  if (item.cartItemType === 'pack') {
                    const packKeys = (item.products || []).filter(p => p.pivot?.keys_requested)
                    if (packKeys.length > 0) {
                      hasKeys = true
                      keysInfo = packKeys.map(p => `${p.pivot.keys_quantity}x ${p.name} (${formatPrice(Number(p.price_keys))})`).join(', ')
                      itemKeysPrice = packKeys.reduce((sum, p) => sum + (Number(p.price_keys) * (p.pivot.keys_quantity || 1)), 0)
                    }
                  } else {
                    hasKeys = hasProductKeys(item) && item.pivot?.keys_requested
                    if (hasKeys) {
                      const keysQty = item.pivot?.keys_quantity || 1
                      keysInfo = `${keysQty}x ${formatPrice(Number(item.price_keys))}`
                      itemKeysPrice = Number(item.price_keys) * keysQty
                    }
                  }

                  const unitPriceExcludingVat = getPriceExcludingVat(getProductPrice(item))
                  const lineTotal = (unitPriceExcludingVat * item.pivot.quantity) + itemKeysPrice

                  return (
                  <tr key={`${item.cartItemType}-${item.id}`}>
                    <td className="font-medium">{item.cartItemType === 'pack' ? 'Pack: ' : ''}{item.name}</td>
                    <td className="text-base-400">{item.code || '-'}</td>
                    <td className="text-center">{item.pivot.quantity}</td>
                    <td className="text-center">
                      {item.cartItemType === 'pack' 
                        ? (item.products?.some(p => p.pivot.installation_requested) ? 'Sí' : '-')
                        : (item.pivot.installation_requested ? 'Sí' : '-')}
                    </td>
                    <td className="text-center">
                      <span className="text-xs">{keysInfo}</span>
                    </td>
                    <td className="text-right">{formatPrice(unitPriceExcludingVat)}</td>
                    <td className="text-right font-medium">{formatPrice(lineTotal)}</td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatPrice(subtotalExcludingVat)}</span>
              </div>
              {installation === 0 && (
                <div className="flex justify-between">
                  <span>Enviament:</span>
                  <span>{shippingExcludingVat > 0 ? formatPrice(shippingExcludingVat) : 'Gratuït'}</span>
                </div>
              )}
              {installation > 0 && (
                <div className="flex justify-between">
                  <span>Instal·lació:</span>
                  <span>{formatPrice(installationExcludingVat)}</span>
                </div>
              )}
              {keysExcludingVat > 0 && (
                <div className="flex justify-between">
                  <span>Claus:</span>
                  <span>{formatPrice(keysExcludingVat)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>IVA (21%):</span>
                <span>{formatPrice(iva)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderShow
