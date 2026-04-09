import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'
import { getOrders } from '../../api/orders_api'
import { HiDocumentDownload } from 'react-icons/hi'
import LoadingAnimation from '../../components/LoadingAnimation'

function OrdersList() {
  const { user } = useContext(AuthContext)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await getOrders()
      setOrders(response.data)
    } catch (err) {
      setError('Error al cargar las órdenes')
      console.error('Error fetching orders:', err)
    } finally {
      setLoading(false)
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
      link.download = `factura-${orderId}.pdf`
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-base-content mb-2">{pageTitle}</h1>
        <p className="text-base-400">{pageDescription}</p>
      </div>

      {orders.length === 0 ? (
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
                <th className="bg-base-200">Data</th>
                <th className="bg-base-200">Estat</th>
                <th className="bg-base-200">Total</th>
                <th className="bg-base-200">Accions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="font-semibold">#{order.id}</td>
                  {isAdmin && <td>{order.user?.name || 'N/A'}</td>}
                  <td>{formatDate(order.created_at)}</td>
                  <td>
                    <span className={`badge ${
                      order.status === 'completed' ? 'badge-success' :
                      order.status === 'pending' ? 'badge-warning' :
                      order.status === 'cancelled' ? 'badge-error' : 'badge-info'
                    }`}>
                      {order.status === 'completed' ? 'Completada' :
                       order.status === 'pending' ? 'Pendent' :
                       order.status === 'cancelled' ? 'Cancel·lada' : order.status}
                    </span>
                  </td>
                  <td className="font-bold text-primary">
                    {order.products?.reduce((total, product) =>
                      total + (product.price * product.pivot.quantity), 0
                    ).toFixed(2)}€
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default OrdersList