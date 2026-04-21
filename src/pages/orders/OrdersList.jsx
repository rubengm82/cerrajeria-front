import { useState, useEffect, useContext, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { getOrders, getOrdersWithTrashed, updateOrder, deleteOrder, restoreOrder, forceDeleteOrder } from '../../api/orders_api'
import { HiDocumentDownload, HiTrash, HiEye } from 'react-icons/hi'
import LoadingAnimation from '../../components/LoadingAnimation'
import ConfirmableModal from '../../components/ConfirmableModal'
import Notifications from '../../components/Notifications'
import { formatPrice, getCartTotals } from '../../utils/cartTotals'
import SearchBarTableSimple from '../../components/SearchBarTableSimple'

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

const ORDER_STATUS_OPTIONS = [
  { value: 'in_cart', label: 'En cistella', className: 'bg-base-200 border-base-300 text-base-content' },
  { value: 'pending', label: 'Pendent', className: 'bg-warning border-warning-content text-warning-content' },
  { value: 'shipped', label: 'Enviat', className: 'bg-info border-info-content text-info-content' },
  { value: 'installation_confirmed', label: 'Instal·lació confirmada', className: 'bg-success border-success-content text-success-content' },
]

function getOrderStatusOption(status) {
  return ORDER_STATUS_OPTIONS.find((option) => option.value === status) || ORDER_STATUS_OPTIONS[0]
}

function OrdersList() {
  const { user } = useContext(AuthContext)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notification, setNotification] = useState(null)

  const isAdmin = user?.role === 'admin'

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      const response = isAdmin ? await getOrdersWithTrashed() : await getOrders()
      setOrders(response.data)
    } catch (err) {
      setError('Error al cargar las órdenes')
      console.error('Error fetching orders:', err)
    } finally {
      setLoading(false)
    }
  }, [isAdmin])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrder(orderId, { status: newStatus })
      setOrders(orders.map(order => order.id === orderId ? { ...order, status: newStatus } : order))
      setNotification({ id: Date.now(), type: "success", message: "Estat de la comanda actualitzat correctament" })
    } catch (error) {
      console.error('Error updating status:', error)
      setNotification({ id: Date.now(), type: "error", message: "No s'ha pogut actualitzar l'estat de la comanda" })
    }
  }

  const handleToggle = async (orderId, isActive) => {
    try {
      if (isActive) {
        await restoreOrder(orderId)
        setOrders(orders.map(order => order.id === orderId ? { ...order, deleted_at: null } : order))
        setNotification({ id: Date.now(), type: "success", message: "Comanda restaurada correctament" })
      } else {
        await deleteOrder(orderId)
        setOrders(orders.map(order => order.id === orderId ? { ...order, deleted_at: new Date().toISOString() } : order))
        setNotification({ id: Date.now(), type: "success", message: "Comanda desactivada correctament" })
      }
    } catch (error) {
      console.error('Error toggling order:', error)
      setNotification({ id: Date.now(), type: "error", message: isActive ? "No s'ha pogut restaurar la comanda" : "No s'ha pogut desactivar la comanda" })
    }
  }

  const handleForceDelete = async (orderId) => {
    try {
      await forceDeleteOrder(orderId)
      setOrders(orders.filter(order => order.id !== orderId))
      setNotification({ id: Date.now(), type: "success", message: "Comanda eliminada permanentment" })
    } catch (error) {
      console.error('Error force deleting order:', error)
      setNotification({ id: Date.now(), type: "error", message: "No s'ha pogut eliminar permanentment la comanda" })
    }
  }

  const downloadInvoice = async (orderId) => {
    try {
      // Get the authentication token
      const token = localStorage.getItem('token')
      if (!token) {
        alert('Debes iniciar sesión para descargar facturas')
        return
      }

      // Make authenticated request to download the PDF
      const response = await fetch(`http://localhost:8000/api/invoices/${orderId}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/pdf'
        }
      })

      if (!response.ok) {
        throw new Error(`Error al descargar: ${response.status}`)
      }

      // Create blob from response
      const blob = await response.blob()

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `factura-INV-${orderId.toString().padStart(6, '0')}.pdf`
      document.body.appendChild(link)
      link.click()

      // Clean up
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading invoice:', error)
      alert('Error al descargar la factura. Verifica que tengas permisos.')
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const pageTitle = isAdmin ? 'Gestió de Comandes' : 'Les Meves Comandes'
  const pageDescription = isAdmin
    ? 'Gestiona totes les comandes i descarrega les factures'
    : 'Gestiona i descarrega les teves factures'

  // Add invoice_number field for searching with formatted ID (INV-000123)
  const ordersWithInvoice = orders.map(order => ({
    ...order,
    invoice_number: `ALB-${order.id.toString().padStart(6, '0')}`
  }))

  if (loading) {
    return (
      <div className="p-4 md:p-0">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-base-content mb-2">{pageTitle}</h1>
          <LoadingAnimation heightClass="h-32" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 md:p-0">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-base-content mb-2">{pageTitle}</h1>
          <p className="text-error">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-0">
      {notification && (
        <Notifications key={notification.id} type={notification.type} message={notification.message} onClose={() => setNotification(null)}/>
      )}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-base-content mb-2">{pageTitle}</h1>
        <p className="text-base-400">{pageDescription}</p>
      </div>

      <SearchBarTableSimple
        data={ordersWithInvoice}
        searchFields={isAdmin ? ['invoice_number', 'id', 'user.name', 'user.last_name_one', 'user.last_name_second', 'created_at', 'shipped_at', 'payment_method', 'status'] : ['invoice_number', 'id', 'created_at', 'shipped_at', 'payment_method', 'status']}
        placeholder='Buscar comanda...'
        inputClassName='flex flex-col md:flex-row gap-4 w-full mb-5 input'
      >
        {(filteredOrders) => (
          <>
            {filteredOrders.length === 0 ? (
        <div className="text-center py-10 bg-base-100 rounded-lg border border-base-300">
          <p className="text-base-400">
            {isAdmin ? 'No hi ha cap comanda registrada.' : 'No tens cap comanda encara.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-base-300 bg-base-100 rounded-lg shadow-md">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th className="bg-base-200">ID Comanda</th>
                {isAdmin && <th className="bg-base-200">Client</th>}
                <th className="bg-base-200">Data Factura</th>
                <th className="bg-base-200">Enviament</th>
                 <th className="bg-base-200">Mètode Pagament</th>
                  <th className="bg-base-200">Estat Comanda</th>
                  <th className="bg-base-200">Subtotal i IVA</th>
                  <th className="bg-base-200">Total</th>
                  <th className="bg-base-200">Descàrrega</th>
                  {isAdmin && <th className="bg-base-200">Estat</th>}
                  {isAdmin && <th className="bg-base-200">Accions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td className="font-semibold">INV-{order.id.toString().padStart(6, '0')}</td>
                  {isAdmin && <td>{getOrderCustomerName(order) || 'Client sense usuari'}</td>}
                  <td>{formatDate(order.created_at)}</td>
                  <td>
                    {order.shipped_at ? formatDate(order.shipped_at) : ''}
                  </td>
                   <td>
                     {order.payment_method.charAt(0).toUpperCase() + order.payment_method.slice(1)}
                   </td>
                   <td>
                     {isAdmin ? (
                       <select
                         value={order.status}
                         onChange={(e) => handleStatusChange(order.id, e.target.value)}
                         className={`select select-sm select-bordered w-auto min-w-36 flex justify-center text-center font-medium ${getOrderStatusOption(order.status).className}`}
                       >
                         {ORDER_STATUS_OPTIONS.map((option) => (
                           <option key={option.value} value={option.value} className={option.className}>
                             {option.label}
                           </option>
                         ))}
                       </select>
                     ) : (
                       <span className={`badge ${
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
                     )}
                   </td>
                   <td>
                     {(() => {
                       const { subtotal } = getCartTotals(getOrderItems(order))
                       const iva = subtotal * 0.21
                       return (
                         <div className="text-left text-sm">
                           <div>Subtotal: {formatPrice(subtotal)}</div>
                           <div>IVA: {formatPrice(iva)}</div>
                         </div>
                       )
                     })()}
                   </td>
                   <td className="font-bold text-primary">
                     {(() => {
                       const { subtotal } = getCartTotals(getOrderItems(order))
                       const iva = subtotal * 0.21
                       const total = subtotal + iva
                       return formatPrice(total)
                     })()}
                   </td>
                   <td>
                     <button
                       onClick={() => downloadInvoice(order.id)}
                       className="btn btn-sm btn-primary"
                       title="Descarregar Factura"
                     >
                       <HiDocumentDownload className="w-4 h-4" />
                       Factura
                     </button>
                   </td>
                   {isAdmin && (
                     <td>
                       <input
                         type="checkbox"
                         className="toggle toggle-primary"
                         checked={!order.deleted_at}
                         onChange={(e) => handleToggle(order.id, e.target.checked)}
                       />
                     </td>
                   )}
                   {isAdmin && (
                     <td className="h-12">
                       <div className='flex items-center justify-center gap-3'>
                       <Link to={`/orders/${order.id}`} className="text-base-400 hover:text-primary transition-colors">
                         <HiEye className="size-6" />
                       </Link>
                         <ConfirmableModal
                           title="Eliminar comanda permanentment"
                           message={`Segur que vols eliminar permanentment la comanda INV-${order.id.toString().padStart(6, '0')}? Aquesta acció no es pot desfer.`}
                           onConfirm={() => handleForceDelete(order.id)}
                         >
                           <button className={`text-base-400 hover:text-error-content transition-colors cursor-pointer ${!order.deleted_at ? 'invisible' : ''}`}>
                             <HiTrash className="size-6" />
                           </button>
                         </ConfirmableModal>
                       </div>
                     </td>
                   )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
          </>
        )}
      </SearchBarTableSimple>
    </div>
  )
}

export default OrdersList
