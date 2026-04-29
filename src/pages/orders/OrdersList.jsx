import { useState, useEffect, useContext, useCallback, useMemo, useRef } from 'react'
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
import { INSTALLATION_STATUSES, getEffectiveOrderStatus, isInstallationOrder } from '../../utils/orderStatus'
import { getAuthCookie } from '../../utils/authCookie'
const SETTINGS_SAVE_DEBOUNCE_MS = 500

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

  const getFilteredStatusOptions = (order) => {
    const installationScheduledAt = order.installation_scheduled_at
    const installationOrder = isInstallationOrder(order)
    
    return ORDER_STATUS_OPTIONS.filter(option => {
      if (installationOrder) {
        if (!installationScheduledAt) {
          return option.value === 'installation_pending'
        }
        return INSTALLATION_STATUSES.includes(option.value)
      }
      
      return !INSTALLATION_STATUSES.includes(option.value)
    })
  }

function getOrderStatusOption(status) {
  return ORDER_STATUS_OPTIONS.find((option) => option.value === status) || ORDER_STATUS_OPTIONS[0]
}

const normalizeInstallationRules = (rules) => (
  rules
    .filter((rule) => rule.min_subtotal !== '' && rule.price !== '')
    .map((rule) => ({
      min_subtotal: Number(rule.min_subtotal || 0),
      max_subtotal: (rule.max_subtotal === '' || rule.max_subtotal === null) ? null : Number(rule.max_subtotal),
      price: Number(rule.price || 0),
    }))
)

const validateSettingsForm = (settingsForm, { allowIncomplete = false } = {}) => {
  const rules = settingsForm.installation_rules || []

  for (let i = 0; i < rules.length; i++) {
    const currentRule = rules[i]
    const hasMin = currentRule.min_subtotal !== '' && currentRule.min_subtotal !== null && currentRule.min_subtotal !== undefined
    const hasPrice = currentRule.price !== '' && currentRule.price !== null && currentRule.price !== undefined
    const hasMax = currentRule.max_subtotal !== '' && currentRule.max_subtotal !== null && currentRule.max_subtotal !== undefined

    if ((!hasMin || !hasPrice) && !allowIncomplete) {
      return `La regla ${i + 1} ha de tindre com a mínim 'Des de' i 'Preu instal·lació'.`
    }

    if (!hasMin || !hasPrice) {
      return null
    }

    const min = Number(currentRule.min_subtotal || 0)
    const max = hasMax ? Number(currentRule.max_subtotal) : null

    if (max !== null && max <= min) {
      return `A la regla ${i + 1}, el valor 'Fins' (${max}) ha de ser major que 'Des de' (${min}).`
    }

    if (i < rules.length - 1) {
      if (max === null) {
        return "Només l'última regla pot quedar sense límit."
      }

      const nextRule = rules[i + 1]
      const nextHasMin = nextRule.min_subtotal !== '' && nextRule.min_subtotal !== null && nextRule.min_subtotal !== undefined

      if (!nextHasMin && !allowIncomplete) {
        return `La regla ${i + 2} ha de tindre un valor 'Des de'.`
      }

      if (!nextHasMin) {
        return null
      }

      const nextMin = Number(nextRule.min_subtotal)
      if (nextMin <= max) {
        return `Conflict de rangs: La regla ${i + 2} ha de començar (${nextMin}) per sobre del límit de la regla ${i + 1} (${max}).`
      }
    }
  }

  return null
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
  const [settingsStatus, setSettingsStatus] = useState('idle')
  const saveTimeoutRef = useRef(null)
  const hasHydratedSettingsRef = useRef(false)
  const lastSavedSettingsRef = useRef('')

  // Filtros para admin
  const [filters, setFilters] = useState({
    type: 'all',
    missingSend: false,
    missingDate: false
  })

  const isAdmin = user?.role === 'admin'

  const handleFilterChange = (newFilters) => {
    console.log('Filter change:', newFilters)
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      const response = isAdmin ? await getOrdersWithTrashed() : await getOrders()
      const fetchedOrders = response.data
      const filteredOrders = isAdmin ? fetchedOrders : fetchedOrders.filter(order => order.status !== 'in_cart')
      setOrders(filteredOrders)
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
      const nextSettings = {
        shipping_price: response.data?.shipping_price || 0,
        installation_rules: response.data?.installation_rules || [],
      }
      setSettingsForm(nextSettings)
      lastSavedSettingsRef.current = JSON.stringify(nextSettings)
      hasHydratedSettingsRef.current = true
      setSettingsStatus('idle')
    } catch (err) {
      console.error('Error fetching commerce settings:', err)
    }
  }, [])

  useEffect(() => {
    fetchCommerceSettings()
  }, [fetchCommerceSettings])

  // DEBUG: mostrar en consola

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

  const persistSettings = useCallback(async (formState, { showSuccessNotification = false } = {}) => {
    const validationMessage = validateSettingsForm(formState, { allowIncomplete: true })
    if (validationMessage) {
      setSettingsStatus('error')
      setNotification({ id: Date.now(), type: "error", message: validationMessage })
      return
    }

    setIsSavingSettings(true)
    setSettingsStatus('saving')

    try {
      const response = await updateCommerceSettings({
        shipping_price: Number(formState.shipping_price || 0),
        installation_rules: normalizeInstallationRules(formState.installation_rules),
      })

      const nextSettings = {
        shipping_price: response.data?.shipping_price || 0,
        installation_rules: response.data?.installation_rules || [],
      }

      setSettingsForm(nextSettings)
      lastSavedSettingsRef.current = JSON.stringify(nextSettings)
      setSettingsStatus('saved')

      if (showSuccessNotification) {
        setNotification({ id: Date.now(), type: "success", message: "Configuració de preus actualitzada correctament" })
      }
    } catch (err) {
      console.error('Error saving commerce settings:', err)
      setSettingsStatus('error')
      setNotification({ id: Date.now(), type: "error", message: "No s'ha pogut guardar la configuració de preus" })
    } finally {
      setIsSavingSettings(false)
    }
  }, [])

  useEffect(() => {
    if (!isSettingsOpen || !hasHydratedSettingsRef.current) {
      return undefined
    }

    const serializedSettings = JSON.stringify(settingsForm)
    if (serializedSettings === lastSavedSettingsRef.current) {
      return undefined
    }

    const validationMessage = validateSettingsForm(settingsForm, { allowIncomplete: true })
    if (validationMessage) {
      setSettingsStatus('error')
      return undefined
    }

    setSettingsStatus('idle')

    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = window.setTimeout(() => {
      persistSettings(settingsForm)
    }, SETTINGS_SAVE_DEBOUNCE_MS)

    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [isSettingsOpen, persistSettings, settingsForm])

  const downloadAlbaran = async (orderId) => {
    try {
      // Get the authentication token
      const token = getAuthCookie()
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

  const ordersSorted = useMemo(() => {
    return [...orders]
      .sort((a, b) => b.id - a.id)
      .map(order => ({
        ...order,
        albaran_number: formatAlbaranNumber(order.id)
      }))
  }, [orders])

  const filteredByStatus = useMemo(() => {
    if (!isAdmin) return ordersSorted

    return ordersSorted.filter(order => {
      // Filtro por tipo
      if (filters.type === 'orders') {
        if (INSTALLATION_STATUSES.includes(order.status)) return false
      } else if (filters.type === 'installations') {
        if (!INSTALLATION_STATUSES.includes(order.status)) return false
      }

      // Filtro Manca Enviar: solo comandas regulares sin shipped_at
      if (filters.missingSend) {
        if (INSTALLATION_STATUSES.includes(order.status)) return false
        if (order.shipped_at) return false
      }

      // Filtro Manca posar data: solo instal·lacions sin installation_scheduled_at
      if (filters.missingDate) {
        if (!INSTALLATION_STATUSES.includes(order.status)) return false
        if (order.installation_scheduled_at) return false
      }

      return true
    })
  }, [ordersSorted, filters, isAdmin])

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

  console.log('Render OrdersList - isAdmin:', isAdmin, 'filters:', filters, 'orders count:', orders.length)

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

            <div className="space-y-5">
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
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold">Regles d'instal·lació</h3>
                    <p className="text-sm text-base-400">
                      {isSavingSettings
                        ? 'Guardant canvis...'
                        : settingsStatus === 'saved'
                          ? 'Canvis guardats automàticament.'
                          : 'Els canvis es guarden automàticament.'}
                    </p>
                  </div>
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
                        <ConfirmableModal
                          title="Eliminar rang de preus"
                          message={`Vols eliminar el rang ${rule.min_subtotal || 0}€ - ${rule.max_subtotal || 'sense límit'}€?`}
                          onConfirm={() => handleRemoveRule(index)}
                        >
                          <button type="button" className="btn btn-ghost text-error-content" aria-label="Eliminar regla">
                            <HiTrash className="size-5" />
                          </button>
                        </ConfirmableModal>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setIsSettingsOpen(false)}></div>
        </div>
      )}

      <SearchBarTableSimple
        data={filteredByStatus}
        searchFields={isAdmin ? ['albaran_number', 'id', 'customer_name', 'customer_last_name_one', 'customer_last_name_second', 'user.name', 'user.last_name_one', 'user.last_name_second', 'created_at', 'shipped_at', 'payment_method', 'status'] : ['albaran_number', 'id', 'customer_name', 'customer_last_name_one', 'customer_last_name_second', 'created_at', 'shipped_at', 'payment_method', 'status']}
        placeholder='Buscar comanda...'
        inputClassName='flex flex-col md:flex-row gap-4 w-full mb-5 input'
        extraFilters={isAdmin ? (
          <div className="flex flex-wrap gap-4 mt-2 mb-4">
            <select
              className="select select-bordered select-sm"
              value={filters.type}
              onChange={(e) => handleFilterChange({ type: e.target.value })}
            >
              <option value="all">Totes les comandes</option>
              <option value="orders">Comandes Online</option>
              <option value="installations">Instal·lacions</option>
            </select>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={filters.missingSend}
                onChange={(e) => handleFilterChange({ missingSend: e.target.checked })}
              />
              <span className="text-sm">Manca enviar la comanda online</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={filters.missingDate}
                onChange={(e) => handleFilterChange({ missingDate: e.target.checked })}
              />
              <span className="text-sm">Manca posar data a la instal·lació</span>
            </label>
          </div>
        ) : null}
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
                 <th className="bg-base-200">Comanda</th>
                 {isAdmin && <th className="bg-base-200">Client</th>}
                 <th className="bg-base-200">Data Comanda</th>
                 <th className="bg-base-200">Pagat amb</th>
                 <th className="bg-base-200">Estat Comanda</th>
                 <th className="bg-base-200">Instal·lació Data</th>
                  {isAdmin && <th className="bg-base-200">Enviament Data</th>}
                 <th className="bg-base-200">Desglossament</th>
                 <th className="bg-base-200">Descàrrega</th>
                 {isAdmin && <th className="bg-base-200">Estat</th>}
                 {isAdmin && <th className="bg-base-200">Accions</th>}
               </tr>
             </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td className="font-semibold">{formatAlbaranNumber(order.id)}</td>
                  {isAdmin && (
                    <td>
                      <div className="relative group text-sm leading-tight text-base-content">
                        <div className="flex flex-col">
                          <span>
                            {order.customer_name ?? order.user?.name ?? 'Client'}
                          </span>
                          <span>
                            {order.customer_last_name_one ?? order.user?.last_name_one ?? 'sense usuari'}
                          </span>
                          {Boolean(order.customer_last_name_second ?? order.user?.last_name_second) && (
                            <span>
                              {order.customer_last_name_second ?? order.user?.last_name_second}
                            </span>
                          )}
                        </div>
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block bg-base-300 p-2 rounded shadow-lg text-sm z-10 min-w-max">
                          <div>Telèfon: {order.customer_phone || order.user?.phone || 'No disponible'}</div>
                          <div>Email: {order.customer_email || order.user?.email || 'No disponible'}</div>
                        </div>
                      </div>
                    </td>
                  )}
                  <td>{formatDate(order.created_at)}</td>
                  <td>{formatPaymentMethod(order.payment_method)}</td>
                  <td>
                    {isAdmin ? (
                        <select
                          value={getEffectiveOrderStatus(order)}
                          onChange={(e) => handleStatusChange(order.id, e.target.value, order)}
                          className={`select select-sm select-bordered w-auto min-w-36 flex justify-center text-center font-medium ${getOrderStatusOption(getEffectiveOrderStatus(order)).className}`}
                        >
                         {getFilteredStatusOptions(order).map((option) => (
                           <option key={option.value} value={option.value} className={option.className}>
                             {option.label}
                           </option>
                         ))}
                       </select>
                    ) : (
                       <span className={`badge ${
                         getEffectiveOrderStatus(order) === 'completed' ? 'badge-success' :
                         getEffectiveOrderStatus(order) === 'pending' ? 'badge-warning' :
                         getEffectiveOrderStatus(order) === 'shipped' ? 'badge-success' :
                         getEffectiveOrderStatus(order) === 'installation_confirmed' ? 'badge-warning' :
                         getEffectiveOrderStatus(order) === 'installation_pending' ? 'badge-error' :
                         getEffectiveOrderStatus(order) === 'installation_finished' ? 'badge-success' :
                         getEffectiveOrderStatus(order) === 'cancelled' ? 'badge-error' : 'badge-info'
                       }`}>
                         {getEffectiveOrderStatus(order) === 'completed' ? 'Completada' :
                          getEffectiveOrderStatus(order) === 'pending' ? 'Comanda pendent' :
                          getEffectiveOrderStatus(order) === 'shipped' ? 'Comanda enviada' :
                          getEffectiveOrderStatus(order) === 'installation_confirmed' ? 'Instal·lació confirmada' :
                          getEffectiveOrderStatus(order) === 'installation_pending' ? 'Instal·lació pendent' :
                          getEffectiveOrderStatus(order) === 'installation_finished' ? 'Instal·lació finalitzada' :
                          getEffectiveOrderStatus(order) === 'cancelled' ? 'Cancel·lada' : getEffectiveOrderStatus(order)}
                      </span>
                    )}
                  </td>
                  <td>
{isAdmin && getEffectiveOrderStatus(order) === 'installation_pending' ? (
                       <div className="flex flex-col gap-1">
                         <div className="text-error-content text-sm text-center">Manca posar data</div>
                         <div className="flex flex-col gap-1 items-center">
                           <input
                             type="date"
                             className="input input-bordered input-sm w-full max-w-28 date-input"
                             onChange={(e) => {
                               const dateValue = e.target.value
                               const row = e.target.closest('tr')
                               const timeSelect = row?.querySelector('.time-select')
                               const timeValue = timeSelect?.value
                               if (dateValue && timeValue) {
                                 handleInstallationDateChange(order.id, `${dateValue}T${timeValue}`)
                               }
                             }}
                           />
                           <select
                             className="select select-bordered select-sm w-full max-w-28 time-select"
                             onChange={(e) => {
                               const timeValue = e.target.value
                               const row = e.target.closest('tr')
                               const dateInput = row?.querySelector('.date-input')
                               const dateValue = dateInput?.value
                               if (dateValue && timeValue) {
                                 handleInstallationDateChange(order.id, `${dateValue}T${timeValue}`)
                               }
                             }}
                           >
                             <option value="">Hora</option>
                             {Array.from({ length: 24 }, (_, h) =>
                               ['00', '15', '30', '45'].map(m => (
                                 <option key={`${h}:${m}`} value={`${h.toString().padStart(2, '0')}:${m}`}>
                                   {`${h.toString().padStart(2, '0')}:${m}`}
                                 </option>
                               ))
                             ).flat()}
                           </select>
                         </div>
                       </div>
                    ) : order.installation_scheduled_at ? (
                      <span>{formatDateTime(order.installation_scheduled_at)}</span>
                    ) : (
                      <span className="text-base-400"></span>
                    )}
                  </td>
                    {isAdmin && (
                      <td className={`text-sm mb-1 text-center ${
                        order.shipped_at ? '' : 
                        (isInstallationOrder(order) ? '' : 'text-error-content')
                      }`}>
                        {(() => {
                          if (isInstallationOrder(order)) {
                            return order.shipped_at ? formatDate(order.shipped_at) : ''
                          }
                          return order.shipped_at ? formatDate(order.shipped_at) : 'Manca Enviar'
                        })()}
                      </td>
                    )}
<td>
                    {(() => {
                      const { subtotalExcludingVat, iva, shippingExcludingVat, installationExcludingVat, keysExcludingVat, installation, total } = getCartTotals(getOrderItems(order), settingsForm)

                      return (
                        <div className="text-left text-xs space-y-0.5">
                          <div>Subtotal: {formatPrice(subtotalExcludingVat)}</div>
                          {keysExcludingVat > 0 && <div>Claus: {formatPrice(keysExcludingVat)}</div>}
                          {installation === 0 && (
                            <div>Enviament: {shippingExcludingVat > 0 ? formatPrice(shippingExcludingVat) : 'Gratuït'}</div>
                          )}
                          {installation > 0 && (
                            <div>Instal·lació: {formatPrice(installationExcludingVat)}</div>
                          )}
                          <div>IVA: {formatPrice(iva)}</div>
                          <div className="font-bold text-primary border-t border-base-300 mt-1 pt-0.5 text-sm">
                            Total: {formatPrice(total)}
                          </div>
                        </div>
                      )
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
                      <div className='flex items-center justify-center'>
                        {!order.deleted_at ? (
                          <Link to={`/orders/${order.id}`} className="text-base-400 hover:text-primary transition-colors" title="Veure detall">
                            <HiEye className="size-6" />
                          </Link>
                        ) : (
                          <ConfirmableModal
                            title="Eliminar comanda permanentment"
                            message={`Segur que vols eliminar permanentment la comanda ${formatAlbaranNumber(order.id)}? Aquesta acció no es pot desfer.`}
                            onConfirm={() => handleForceDelete(order.id)}
                          >
                            <button className="text-base-400 hover:text-error-content transition-colors cursor-pointer" title="Eliminar permanentment">
                              <HiTrash className="size-6" />
                            </button>
                          </ConfirmableModal>
                        )}
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
