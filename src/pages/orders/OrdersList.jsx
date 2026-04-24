import { useState, useEffect, useContext, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { getCommerceSettings, updateCommerceSettings } from '../../api/commerce_settings_api'
import { getOrders, getOrdersWithTrashed, updateOrder, deleteOrder, restoreOrder, forceDeleteOrder } from '../../api/orders_api'
import { HiDocumentDownload, HiTrash, HiEye, HiCog, HiPlus, HiX } from 'react-icons/hi'
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

const formatAlbaranNumber = (orderId) => `ALB-${orderId.toString().padStart(6, '0')}`

const formatPaymentMethod = (method) => {
  const translations = {
    'bizum': 'Bizum',
    'card': 'Targeta',
    'bank_transfer': 'Transferència',
    'paypal': 'PayPal'
  }
  return translations[method] || method.charAt(0).toUpperCase() + method.slice(1)
}

const ORDER_STATUS_OPTIONS = [
  { value: 'pending', label: 'Comanda pendent', className: 'bg-error border-error-content text-error-content' },
  { value: 'shipped', label: 'Comanda enviada', className: 'bg-success border-success-content text-success-content' },
  { value: 'installation_pending', label: 'Instal·lació pendent', className: 'bg-error border-error-content text-error-content' },
  { value: 'installation_confirmed', label: 'Instal·lació confirmada', className: 'bg-warning border-warning-content text-warning-content' },
  { value: 'installation_finished', label: 'Instal·lació finalitzada', className: 'bg-success border-success-content text-success-content' },
]

  const getFilteredStatusOptions = (currentStatus, installationScheduledAt) => {
    const installationStatuses = ['installation_pending', 'installation_confirmed', 'installation_finished']
    const isInstallationOrder = installationStatuses.includes(currentStatus)
    
    return ORDER_STATUS_OPTIONS.filter(option => {
      // For installation orders
      if (isInstallationOrder) {
        // If no installation date is set, only show 'installation_pending'
        if (!installationScheduledAt) {
          return option.value === 'installation_pending'
        }
        // If installation date exists, show all installation options
        return installationStatuses.includes(option.value)
      }
      
      // For regular orders, exclude installation statuses
      return !installationStatuses.includes(option.value)
    })
  }

function getOrderStatusOption(status) {
  return ORDER_STATUS_OPTIONS.find((option) => option.value === status) || ORDER_STATUS_OPTIONS[0]
}

function OrdersList() {
  const { user } = useContext(AuthContext)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notification, setNotification] = useState(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [settingsForm, setSettingsForm] = useState({ shipping_price: 0, installation_rules: [] })
  const [isSavingSettings, setIsSavingSettings] = useState(false)

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

  const fetchCommerceSettings = useCallback(async () => {
    try {
      const response = await getCommerceSettings()
      setSettingsForm({
        shipping_price: response.data?.shipping_price || 0,
        installation_rules: response.data?.installation_rules || [],
      })
    } catch (err) {
      console.error('Error fetching commerce settings:', err)
    }
  }, [])

  useEffect(() => {
    if (isAdmin) {
      fetchCommerceSettings()
    }
  }, [fetchCommerceSettings, isAdmin])

   const handleStatusChange = async (orderId, newStatus, order) => {
     try {
       const updateData = { status: newStatus }

       // Clear shipped_at when going back to pending
       if (newStatus === 'pending') {
         updateData.shipped_at = null
       }

       // Clear installation date when setting status to installation_pending
       if (newStatus === 'installation_pending') {
         updateData.installation_scheduled_at = null
       }

       // For installation_confirmed or installation_finished, ensure installation_scheduled_at is sent
       if ((newStatus === 'installation_confirmed' || newStatus === 'installation_finished') && order.installation_scheduled_at) {
         updateData.installation_scheduled_at = order.installation_scheduled_at
       }

       const response = await updateOrder(orderId, updateData)
       // Replace order with server response to ensure UI reflects actual DB state
       setOrders(prevOrders => prevOrders.map(order =>
         order.id === orderId ? response.data : order
       ))
       setNotification({ id: Date.now(), type: "success", message: "Estat de la comanda actualitzat correctament" })
     } catch (error) {
       console.error('Error updating status:', error)
       setNotification({ id: Date.now(), type: "error", message: "No s'ha pogut actualitzar l'estat de la comanda" })
     }
   }

  const handleInstallationDateChange = async (orderId, dateValue) => {
    try {
      // If date is empty, clear the installation date (keep status as installation_pending)
      if (!dateValue) {
        const response = await updateOrder(orderId, { installation_scheduled_at: null })
        setOrders(prevOrders => prevOrders.map(order =>
          order.id === orderId ? response.data : order
        ))
        setNotification({ id: Date.now(), type: "success", message: "Data d'instal·lació eliminada" })
        return
      }

      // Set installation date and automatically confirm (status = installation_confirmed)
      const response = await updateOrder(orderId, { 
        installation_scheduled_at: dateValue,
        status: 'installation_confirmed'
      })
      setOrders(prevOrders => prevOrders.map(order =>
        order.id === orderId ? response.data : order
      ))
      setNotification({ id: Date.now(), type: "success", message: "Data d'instal·lació assignada correctament" })
    } catch (error) {
      console.error('Error updating installation date:', error)
      setNotification({ id: Date.now(), type: "error", message: "No s'ha pogut guardar la data d'instal·lació" })
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

  const handleSettingsFieldChange = (event) => {
    setSettingsForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
  }

  const handleRuleChange = (index, field, value) => {
    setSettingsForm((current) => ({
      ...current,
      installation_rules: current.installation_rules.map((rule, ruleIndex) => (
        ruleIndex === index ? { ...rule, [field]: value } : rule
      )),
    }))
  }

  const handleAddRule = () => {
    setSettingsForm((current) => ({
      ...current,
      installation_rules: [
        ...current.installation_rules,
        { min_subtotal: '', max_subtotal: '', price: '' },
      ],
    }))
  }

  const handleRemoveRule = (index) => {
    setSettingsForm((current) => ({
      ...current,
      installation_rules: current.installation_rules.filter((_, ruleIndex) => ruleIndex !== index),
    }))
  }

  const handleSaveSettings = async (event) => {
    event.preventDefault()
    setIsSavingSettings(true)

    // Validació de regles d'instal·lació
    const rules = settingsForm.installation_rules
    for (let i = 0; i < rules.length; i++) {
      const min = Number(rules[i].min_subtotal || 0)
      const maxVal = rules[i].max_subtotal
      const max = (maxVal === '' || maxVal === null || maxVal === undefined) ? null : Number(maxVal)

      if (max !== null && max <= min) {
        setNotification({ 
          id: Date.now(), 
          type: "error", 
          message: `A la regla ${i + 1}, el valor 'Fins' (${max}) ha de ser major que 'Des de' (${min}).` 
        })
        setIsSavingSettings(false)
        return
      }

      if (i < rules.length - 1) {
        if (max === null) {
          setNotification({ 
            id: Date.now(), 
            type: "error", 
            message: "Només l'última regla pot quedar sense límit." 
          })
          setIsSavingSettings(false)
          return
        }
        
        const nextMin = Number(rules[i + 1].min_subtotal)
        if (nextMin <= max) {
          setNotification({ 
            id: Date.now(), 
            type: "error", 
            message: `Conflict de rangs: La regla ${i + 2} ha de començar (${nextMin}) per sobre del límit de la regla ${i + 1} (${max}).` 
          })
          setIsSavingSettings(false)
          return
        }
      }
    }

    try {
      const response = await updateCommerceSettings({
        shipping_price: Number(settingsForm.shipping_price || 0),
        installation_rules: settingsForm.installation_rules
          .filter((rule) => rule.min_subtotal !== '' && rule.price !== '')
          .map((rule) => ({
            min_subtotal: Number(rule.min_subtotal || 0),
            max_subtotal: (rule.max_subtotal === '' || rule.max_subtotal === null) ? null : Number(rule.max_subtotal),
            price: Number(rule.price || 0),
          })),
      })

      setSettingsForm({
        shipping_price: response.data?.shipping_price || 0,
        installation_rules: response.data?.installation_rules || [],
      })
      setIsSettingsOpen(false)
      setNotification({ id: Date.now(), type: "success", message: "Configuració de preus actualitzada correctament" })
    } catch (err) {
      console.error('Error saving commerce settings:', err)
      setNotification({ id: Date.now(), type: "error", message: "No s'ha pogut guardar la configuració de preus" })
    } finally {
      setIsSavingSettings(false)
    }
  }

  const downloadAlbaran = async (orderId) => {
    try {
      // Get the authentication token
      const token = localStorage.getItem('token')
      if (!token) {
        alert('Debes iniciar sesión para descargar albaranes')
        return
      }

      // Make authenticated request to download the PDF
      const response = await fetch(`http://localhost:8000/api/albaranes/${orderId}/download`, {
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
      link.download = `albaran-${formatAlbaranNumber(orderId)}.pdf`
      document.body.appendChild(link)
      link.click()

      // Clean up
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading albaran:', error)
      alert('Error al descargar el albarán. Verifica que tengas permisos.')
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const pageTitle = isAdmin ? 'Gestió de Comandes' : 'Les Meves Comandes'
  const pageDescription = isAdmin
    ? 'Gestiona totes les comandes i descarrega els albarans'
    : 'Gestiona i descarrega els teus albarans'

  // Add albaran_number field for searching with formatted ID (ALB-000123)
  const ordersWithAlbaran = orders.map(order => ({
    ...order,
    albaran_number: formatAlbaranNumber(order.id)
  }))

  if (loading) {
    return (
      <LoadingAnimation heightClass="h-[calc(100vh-260px)]" />
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
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-base-content mb-2">{pageTitle}</h1>
          <p className="text-base-400">{pageDescription}</p>
        </div>

        {isAdmin && (
          <button type="button" className="btn btn-accent" onClick={() => setIsSettingsOpen(true)}>
            <HiCog className="size-5" />
            Configuració de preus (enviaments i instal·lacions)
          </button>
        )}
      </div>

      {isAdmin && isSettingsOpen && (
        <div className="modal modal-open" role="dialog" aria-modal="true">
          <div className="modal-box max-w-3xl">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h2 className="text-2xl font-bold">Configuració de preus</h2>
                <p className="text-base-400">Defineix l'enviament global i les regles d'instal·lació.</p>
              </div>
              <button type="button" className="btn btn-circle btn-ghost" onClick={() => setIsSettingsOpen(false)} aria-label="Tancar configuració">
                <HiX className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-5">
              <label className="form-control w-full">
                <span className="label-text mb-2">Preu d'enviament global (€)</span>
                <input
                  type="number"
                  name="shipping_price"
                  min="0"
                  step="0.01"
                  className="input input-bordered w-full"
                  value={settingsForm.shipping_price}
                  onChange={handleSettingsFieldChange}
                />
              </label>

              <section className="space-y-3 mt-10">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold">Regles d'instal·lació</h3>
                  <button type="button" className="btn btn-sm btn-outline text-accent" onClick={handleAddRule}>
                    <HiPlus className="size-4" />
                    Afegir regla
                  </button>
                </div>

                {settingsForm.installation_rules.length === 0 ? (
                  <p className="text-base-400 border border-base-300 rounded-lg p-4">No hi ha regles configurades.</p>
                ) : (
                  <div className="space-y-3">
                    {settingsForm.installation_rules.map((rule, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end border border-base-300 rounded-lg p-3">
                        <label className="form-control">
                          <span className="label-text mb-1">Des de (€)</span>
                          <input type="number" min="0" step="0.01" className="input input-bordered" value={rule.min_subtotal ?? ''} onChange={(event) => handleRuleChange(index, 'min_subtotal', event.target.value)} required />
                        </label>
                        <label className="form-control">
                          <span className="label-text mb-1">Fins (€)</span>
                          <input 
                            type="number" 
                            min="0" 
                            step="0.01" 
                            className="input input-bordered" 
                            value={rule.max_subtotal ?? ''} 
                            onChange={(event) => handleRuleChange(index, 'max_subtotal', event.target.value)} 
                            placeholder={index === settingsForm.installation_rules.length - 1 ? "Sense límit" : "Fins (€)"}
                            required={index !== settingsForm.installation_rules.length - 1}
                          />
                        </label>
                        <label className="form-control">
                          <span className="label-text mb-1">Preu instal·lació (€)</span>
                          <input type="number" min="0" step="0.01" className="input input-bordered" value={rule.price ?? ''} onChange={(event) => handleRuleChange(index, 'price', event.target.value)} required />
                        </label>
                        <button type="button" className="btn btn-ghost text-error-content" onClick={() => handleRemoveRule(index)} aria-label="Eliminar regla">
                          <HiTrash className="size-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <div className="modal-action">
                <button type="button" className="btn btn-ghost" onClick={() => setIsSettingsOpen(false)}>Cancel·lar</button>
                <button type="submit" className="btn btn-primary" disabled={isSavingSettings}>
                  {isSavingSettings ? 'Guardant...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={() => setIsSettingsOpen(false)}></div>
        </div>
      )}

      <SearchBarTableSimple
        data={ordersWithAlbaran}
        searchFields={isAdmin ? ['albaran_number', 'id', 'user.name', 'user.last_name_one', 'user.last_name_second', 'created_at', 'shipped_at', 'payment_method', 'status'] : ['albaran_number', 'id', 'created_at', 'shipped_at', 'payment_method', 'status']}
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
                 <th className="bg-base-200">Data Albarà</th>
                 <th className="bg-base-200">Mètode Pagament</th>
                 <th className="bg-base-200">Estat Comanda</th>
                 <th className="bg-base-200">Instal·lació</th>
                 <th className="bg-base-200">Enviament</th>
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
                  <td className="font-semibold">{formatAlbaranNumber(order.id)}</td>
                  {isAdmin &&                    <td>
                     <div className="relative group">
                       <span>{getOrderCustomerName(order) || 'Client sense usuari'}</span>
                       <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block bg-base-300 text-base-content p-2 rounded shadow-lg text-sm z-10 min-w-max">
                         <div>Telèfon: {order.user?.phone || 'No disponible'}</div>
                         <div>Email: {order.user?.email || 'No disponible'}</div>
                       </div>
                     </div>
                   </td>}
                  <td>{formatDate(order.created_at)}</td>
                  <td>{formatPaymentMethod(order.payment_method)}</td>
                  <td>
                    {isAdmin ? (
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value, order)}
                          className={`select select-sm select-bordered w-auto min-w-36 flex justify-center text-center font-medium ${getOrderStatusOption(order.status).className}`}
                        >
                         {getFilteredStatusOptions(order.status, order.installation_scheduled_at).map((option) => (
                           <option key={option.value} value={option.value} className={option.className}>
                             {option.label}
                           </option>
                         ))}
                       </select>
                    ) : (
                       <span className={`badge ${
                         order.status === 'completed' ? 'badge-success' :
                         order.status === 'pending' ? 'badge-warning' :
                         order.status === 'shipped' ? 'badge-success' :
                         order.status === 'installation_confirmed' ? 'badge-accent' :
                         order.status === 'installation_pending' ? 'badge-warning' :
                         order.status === 'installation_finished' ? 'badge-success' :
                         order.status === 'cancelled' ? 'badge-error' : 'badge-info'
                       }`}>
                         {order.status === 'completed' ? 'Completada' :
                          order.status === 'pending' ? 'Comanda pendent' :
                          order.status === 'shipped' ? 'Comanda enviada' :
                          order.status === 'installation_confirmed' ? 'Instal·lació confirmada' :
                          order.status === 'installation_pending' ? 'Instal·lació pendent' :
                          order.status === 'installation_finished' ? 'Instal·lació finalitzada' :
                          order.status === 'cancelled' ? 'Cancel·lada' : order.status}
                      </span>
                    )}
                  </td>
                  <td>
                    {isAdmin && order.status === 'installation_pending' ? (
                       <div>
                         <div className="text-error-content text-sm mb-1 text-center">Manca posar data</div>
                         <input
                           type="datetime-local"
                           className="input input-bordered input-sm"
                           onBlur={(e) => {
                             const value = e.target.value
                             if (value) {
                               handleInstallationDateChange(order.id, value)
                             }
                           }}
                           key={`inst-${order.id}`}
                         />
                       </div>
                    ) : order.installation_scheduled_at ? (
                      <span>{formatDateTime(order.installation_scheduled_at)}</span>
                    ) : (
                      <span className="text-base-400"></span>
                    )}
                  </td>
                   <td className={`text-sm mb-1 text-center ${order.shipped_at ? '' : 'text-error-content'}`}>
                    {order.shipped_at ? formatDate(order.shipped_at) : 'Manca Enviar'}
                  </td>
                  <td>
                    {(() => {
                      const { subtotal } = getCartTotals(getOrderItems(order))
                      const iva = subtotal * 0.21
                      return (
                        <div className="text-left text-sm">
                          <div>Subtotal: {formatPrice(subtotal)}</div>
                          <div>Enviament: {formatPrice(order.shipping_price || 0)}</div>
                          <div>Instal·lació: {formatPrice(order.installation_price || 0)}</div>
                          <div>IVA: {formatPrice(iva)}</div>
                        </div>
                      )
                    })()}
                  </td>
                  <td className="font-bold text-primary">
                    {(() => {
                      const { subtotal } = getCartTotals(getOrderItems(order))
                      const iva = subtotal * 0.21
                      const total = subtotal + iva + Number(order.shipping_price || 0) + Number(order.installation_price || 0)
                      return formatPrice(total)
                    })()}
                  </td>
                  <td>
                    <button
                      onClick={() => downloadAlbaran(order.id)}
                      className="btn btn-sm btn-primary"
                      title="Descarregar Albarà"
                    >
                      <HiDocumentDownload className="w-4 h-4" />
                      Albarà
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
                          message={`Segur que vols eliminar permanentment la comanda ${formatAlbaranNumber(order.id)}? Aquesta acció no es pot desfer.`}
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
