import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getOrder } from '../../api/orders_api'
import LoadingAnimation from '../../components/LoadingAnimation'
import { HiArrowLeft } from 'react-icons/hi'
import { formatPrice, getCartTotals, getProductPrice } from '../../utils/cartTotals'

const getOrderCustomerName = (order) => (
  [
    order.customer_name ?? order.user?.name,
    order.customer_last_name_one ?? order.user?.last_name_one,
    order.customer_last_name_second ?? order.user?.last_name_second,
  ].filter(Boolean).join(' ')
)

const getOrderItems = (order) => [
  ...(order.products || []).map((product) => ({ ...product, cartItemType: 'product' })),
  ...(order.packs || []).map((pack) => ({ ...pack, cartItemType: 'pack' })),
]

const formatAlbaranNumber = (orderId) => `ALB-${orderId.toString().padStart(6, '0')}`

function OrderShow() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchOrder()
  }, [id])

  const fetchOrder = async () => {
    try {
      setLoading(true)
      const response = await getOrder(id)
      setOrder(response.data)
    } catch (err) {
      setError('Error al cargar la comanda')
      console.error('Error fetching order:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="p-4 md:p-0">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-base-content mb-2">Resum de la Comanda</h1>
          <LoadingAnimation heightClass="h-32" />
        </div>
      </div>
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
  const { subtotal } = getCartTotals(orderItems)
  const iva = subtotal * 0.21
  const shipping = Number(order.shipping_price || 0)
  const installation = Number(order.installation_price || 0)
  const total = subtotal + iva + shipping + installation

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
              <p><span className="font-medium">Data:</span> {formatDate(order.created_at)}</p>
              <p><span className="font-medium">Estat:</span> 
                <span className={`badge ml-2 ${
                  order.status === 'completed' ? 'badge-success' :
                  order.status === 'pending' ? 'badge-warning' :
                  order.status === 'shipped' ? 'badge-info' :
                  order.status === 'installation_confirmed' ? 'badge-success' :
                  order.status === 'cancelled' ? 'badge-error' : 'badge-info'
                }`}>
                  {order.status === 'completed' ? 'Completada' :
                   order.status === 'pending' ? 'Pendent' :
                   order.status === 'shipped' ? 'Enviat' :
                   order.status === 'installation_confirmed' ? 'Instal·lació confirmada' :
                   order.status === 'cancelled' ? 'Cancel·lada' : order.status}
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
               <p><span className="font-medium">Adreça:</span> {order.customer_address || order.user?.shipping_address || ''}</p>
              <p><span className="font-medium">Codi postal:</span> {order.customer_zip_code || order.user?.zip_code || ''}</p>
              <p><span className="font-medium">Adreça d'Instal·lació:</span> {order.installation_address}</p>
              <p><span className="font-medium">Adreça d'Enviament:</span> {order.shipping_address}</p>
              {order.shipped_at && (
                <p><span className="font-medium">Data d'Enviament:</span> {formatDate(order.shipped_at)}</p>
              )}
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
                  <th className="text-right">Preu Unitari</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {orderItems.map((product) => (
                  <tr key={`${product.cartItemType}-${product.id}`}>
                    <td className="font-medium">{product.cartItemType === 'pack' ? 'Pack: ' : ''}{product.name}</td>
                    <td className="text-base-400">{product.code || '-'}</td>
                    <td className="text-center">{product.pivot.quantity}</td>
                    <td className="text-center">{product.pivot.installation_requested ? 'Sí' : '-'}</td>
                    <td className="text-right">{formatPrice(getProductPrice(product))}</td>
                    <td className="text-right font-medium">{formatPrice(getProductPrice(product) * product.pivot.quantity)}</td>
                  </tr>
                ))}
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
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>IVA (21%):</span>
                <span>{formatPrice(iva)}</span>
              </div>
              <div className="flex justify-between">
                <span>Enviament:</span>
                <span>{formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span>Instal·lació:</span>
                <span>{formatPrice(installation)}</span>
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
