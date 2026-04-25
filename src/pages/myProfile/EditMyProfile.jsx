import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getUser, updateUser, deleteUser } from '../../api/users_api'
import { useLocation } from 'react-router-dom'
import LoadingAnimation from '../../components/LoadingAnimation'
import Notifications from '../../components/Notifications'
import ConfirmableModal from '../../components/ConfirmableModal'
import { HiOutlineExclamationTriangle } from "react-icons/hi2";

// Lista de provincias de España
const provinciasEspana = [
  "Álava", "Albacete", "Alicante", "Almería", "Asturias", "Ávila", "Badajoz", "Baleares", "Barcelona", "Burgos", "Cáceres", "Cádiz", "Cantabria", "Castellón", "Ciudad Real", "Córdoba", "A Coruña", "Cuenca", "Girona", "Granada", "Guadalajara", "Guipúzcoa", "Huelva", "Huesca", "Jaén", "León", "Lleida", "La Rioja", "Lugo", "Madrid", "Málaga", "Murcia", "Navarra", "Ourense", "Palencia", "Pontevedra", "Salamanca", "Santa Cruz de Tenerife", "Segovia", "Sevilla", "Soria", "Tarragona", "Teruel", "Toledo", "Valencia", "Valladolid", "Vizcaya", "Zamora", "Zaragoza"
];

function EditMyProfile() {

  const { user: authUser, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState(null)
  const isAdmin = authUser?.role === 'admin' || authUser?.role === 1

  const [formData, setFormData] = useState({
    name: "",
    last_name_one: "",
    last_name_second: "",
    dni: "",
    phone:  "",
    email:  "",
    // Dirección de envío
    shipping_street: "",
    shipping_floor: "",
    shipping_staircase: "",
    shipping_zip_code: "",
    shipping_province: "",
    shipping_country: "España",
    // Dirección de facturación
    billing_street: "",
    billing_floor: "",
    billing_staircase: "",
    billing_zip_code: "",
    billing_province: "",
    billing_country: "España",
    password: "",
    password_confirmation: "",
  })

  // Función para parsear la dirección guardada en la base de datos
  const parseAddress = (address) => {
    if (!address) return { street: '', floor: '', staircase: '' }

    const parts = address.split(',').map(part => part.trim())

    return {
      street: parts[0] || '',
      floor: parts[1] || '',
      staircase: parts[2] || ''
    }
  }

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true)
      try {
        const response = await getUser(authUser.id)
        const parsedShipping = parseAddress(response.data.shipping_address)
        const parsedBilling = parseAddress(response.data.billing_address)

        setFormData({
          name: response.data.name || "",
          last_name_one: response.data.last_name_one || "",
          last_name_second: response.data.last_name_second || "",
          dni: response.data.dni || "",
          phone: response.data.phone || "",
          email: response.data.email || "",
          shipping_street: parsedShipping.street || "",
          shipping_floor: parsedShipping.floor || "",
          shipping_staircase: parsedShipping.staircase || "",
          shipping_zip_code: response.data.shipping_zip_code || "",
          shipping_province: response.data.shipping_province || "",
          shipping_country: response.data.shipping_country || "España",
          billing_street: parsedBilling.street || "",
          billing_floor: parsedBilling.floor || "",
          billing_staircase: parsedBilling.staircase || "",
          billing_zip_code: response.data.billing_zip_code || "",
          billing_province: response.data.billing_province || "",
          billing_country: response.data.billing_country || "España",
          password: "",
          password_confirmation: "",
        })
      } catch (err) {
        console.error('Error fetching user:', err)
        if (authUser) {
          const parsedShipping = parseAddress(authUser.shipping_address || authUser.address)
          const parsedBilling = parseAddress(authUser.billing_address || '')
          setFormData({
            name: authUser.name || "",
            last_name_one: authUser.last_name_one || "",
            last_name_second: authUser.last_name_second || "",
            dni: authUser.dni || "",
            phone: authUser.phone || "",
            email: authUser.email || "",
            shipping_street: parsedShipping.street || "",
            shipping_floor: parsedShipping.floor || "",
            shipping_staircase: parsedShipping.staircase || "",
            shipping_zip_code: authUser.shipping_zip_code || authUser.zip_code || "",
            shipping_province: authUser.shipping_province || authUser.province || "",
            shipping_country: authUser.shipping_country || authUser.country || "España",
            billing_street: parsedBilling.street || "",
            billing_floor: parsedBilling.floor || "",
            billing_staircase: parsedBilling.staircase || "",
            billing_zip_code: authUser.billing_zip_code || "",
            billing_province: authUser.billing_province || "",
            billing_country: authUser.billing_country || "España",
            password: "",
            password_confirmation: "",
          })
        }
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading && authUser?.id) {
      fetchUserData()
    }
  }, [authUser, authLoading])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)

    try {
      const userId = authUser.id

      if (formData.password || formData.password_confirmation) {
        if (formData.password !== formData.password_confirmation) {
          setNotification({
            id: Date.now(),
            type: 'error',
            message: 'Les contrasenyes no coincideixen'
          })
          setLoading(false)
          return
        }
        if (formData.password.length < 8) {
          setNotification({
            id: Date.now(),
            type: 'error',
            message: 'La contrasenya ha de tenir almenys 8 caràcters'
          })
          setLoading(false)
          return
        }
      }

      const dataToUpdate = {
        name: formData.name,
        last_name_one: formData.last_name_one,
      }

      if (formData.last_name_second) {
        dataToUpdate.last_name_second = formData.last_name_second
      }
      if (formData.dni) {
        dataToUpdate.dni = formData.dni
      }
      if (formData.phone) {
        dataToUpdate.phone = formData.phone
      }

      // Dirección de envío
      if (formData.shipping_street || formData.shipping_floor || formData.shipping_staircase) {
        const addressParts = [
          formData.shipping_street,
          formData.shipping_floor,
          formData.shipping_staircase
        ].filter(part => part)
        dataToUpdate.shipping_address = addressParts.join(', ')
      }
      dataToUpdate.shipping_zip_code = formData.shipping_zip_code
      dataToUpdate.shipping_province = formData.shipping_province
      dataToUpdate.shipping_country = formData.shipping_country

      // Dirección de facturación
      if (formData.billing_street || formData.billing_floor || formData.billing_staircase) {
        const addressParts = [
          formData.billing_street,
          formData.billing_floor,
          formData.billing_staircase
        ].filter(part => part)
        dataToUpdate.billing_address = addressParts.join(', ')
      }
      dataToUpdate.billing_zip_code = formData.billing_zip_code
      dataToUpdate.billing_province = formData.billing_province
      dataToUpdate.billing_country = formData.billing_country

      if (formData.password) {
        dataToUpdate.password = formData.password
        dataToUpdate.password_confirmation = formData.password_confirmation
      }

      await updateUser(userId, dataToUpdate)

      setNotification({
        id: Date.now(),
        type: 'success',
        message: 'Perfil actualitzat correctament!'
      })

      setFormData(prev => ({
        ...prev,
        password: '',
        password_confirmation: ''
      }))

    } catch (err) {
      console.error('Error actualitzant perfil:', err)
      setNotification({
        id: Date.now(),
        type: 'error',
        message: 'Error en actualitzar el perfil'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setLoading(true)
    try {
      await deleteUser(authUser.id)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/'
    } catch (err) {
      console.error('Error eliminant compte:', err)
      setNotification({
        id: Date.now(),
        type: 'error',
        message: 'Error en eliminar el compte'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const location = useLocation()
  const locationState = location.state

  useEffect(() => {
    if (locationState) {
      window.history.replaceState({}, document.title)
    }
  }, [locationState])

  return loading ? <LoadingAnimation/> : (
    <div className='flex flex-col items-center px-4 py-8'>
      <div className="w-full max-w-2xl">

        <div className="mb-5">
          <h1 className="text-2xl font-bold">Edita el teu perfil</h1>
        </div>

        {/* Aviso para completar datos */}
        {!isAdmin && (!formData.dni || !formData.phone || !formData.shipping_street || !formData.billing_street || !formData.shipping_zip_code || !formData.billing_zip_code || !formData.shipping_province || !formData.billing_province) && (
          <div className="alert alert-warning mb-4">
            <HiOutlineExclamationTriangle className='stroke-current shrink-0 h-6 w-6' aria-hidden="true" />
            <span id="profile-missing-data-warning">Si us plau, completa les teves dades personals (DNI, telèfon, adreça d'enviament, adreça de facturació, codis postals, províncies) al teu perfil.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="card w-full max-w-2xl bg-base-100 shadow-xl p-6" aria-label="Formulari d'edició del perfil" aria-describedby={(!formData.dni || !formData.phone || !formData.shipping_street || !formData.billing_street || !formData.shipping_zip_code || !formData.billing_zip_code || !formData.shipping_province || !formData.billing_province) ? "profile-missing-data-warning" : undefined}>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!isAdmin && (
              <>
                {/* Nombre */}
                <div>
                  <label className="label" htmlFor="name">
                    <span className="label-text">Nom *</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Nom"
                    autoComplete="name"
                    className="input input-bordered w-full"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Primer apellido */}
                <div>
                  <label className="label" htmlFor="last_name_one">
                    <span className="label-text">Primer Cognom *</span>
                  </label>
                  <input
                    type="text"
                    id="last_name_one"
                    autoComplete="additional-name"
                    className="input input-bordered w-full"
                    value={formData.last_name_one}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Segundo apellido */}
                <div>
                  <label className="label" htmlFor="last_name_second">
                    <span className="label-text">Segon Cognom</span>
                  </label>
                  <input
                    type="text"
                    id="last_name_second"
                    autoComplete="additional-name"
                    className="input input-bordered w-full"
                    value={formData.last_name_second}
                    onChange={handleChange}
                  />
                </div>

                {/* DNI */}
                <div>
                  <label className="label" htmlFor="dni">
                    <span className="label-text">DNI</span>
                  </label>
                  <input
                    type="text"
                    id="dni"
                    name="dni"
                    placeholder="DNI"
                    autoComplete="off"
                    className="input input-bordered w-full"
                    value={formData.dni}
                    onChange={handleChange}
                  />
                </div>

                {/* Teléfono */}
                <div>
                  <label className="label" htmlFor="phone">
                    <span className="label-text">Telèfon</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="Telèfon"
                    autoComplete="tel"
                    className="input input-bordered w-full"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="label" htmlFor="email">
                    <span className="label-text">Email</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Email"
                    autoComplete="email"
                    className="input input-bordered w-full"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled
                  />
                </div>

                {/* Separador - Dirección de Envío */}
                <div className="md:col-span-2 mt-2">
                  <div className="divider">Adreça d'Enviament</div>
                </div>

                {/* Dirección de Envío - Calle/Puerta */}
                <div className="md:col-span-2">
                  <label className="label" htmlFor="shipping_street">
                    <span className="label-text">Carrer / Porta</span>
                  </label>
                  <input
                    type="text"
                    id="shipping_street"
                    name="shipping_street"
                    placeholder="Carrer, número de porta..."
                    autoComplete="street-address"
                    className="input input-bordered w-full"
                    value={formData.shipping_street}
                    onChange={handleChange}
                  />
                </div>

                {/* Piso, Escalera y Código Postal para Envío */}
                <div className="md:col-span-2 grid grid-cols-3 gap-4">
                  <div>
                    <label className="label" htmlFor="shipping_floor">
                      <span className="label-text">Pis</span>
                    </label>
                    <input
                      type="text"
                      id="shipping_floor"
                      name="shipping_floor"
                      placeholder="Pis (ex: 1r, 2n)"
                      className="input input-bordered w-full"
                      value={formData.shipping_floor}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="label" htmlFor="shipping_staircase">
                      <span className="label-text">Escala</span>
                    </label>
                    <input
                      type="text"
                      id="shipping_staircase"
                      name="shipping_staircase"
                      placeholder="Escala (ex.: A, B)"
                      className="input input-bordered w-full"
                      value={formData.shipping_staircase}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="label" htmlFor="shipping_zip_code">
                      <span className="label-text">Codi Postal</span>
                    </label>
                    <input
                      type="text"
                      id="shipping_zip_code"
                      name="shipping_zip_code"
                      placeholder="Codi Postal"
                      maxLength={8}
                      autoComplete="postal-code"
                      className="input input-bordered w-full"
                      value={formData.shipping_zip_code}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Provincia y País para Envío */}
                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                  <div>
                    <label className="label" htmlFor="shipping_province">
                      <span className="label-text">Província</span>
                    </label>
                    <select
                      id="shipping_province"
                      name="shipping_province"
                      className="select select-bordered w-full"
                      value={formData.shipping_province}
                      onChange={handleChange}
                    >
                      <option value="">Selecciona una província</option>
                      {provinciasEspana.map((provincia, index) => (
                        <option key={index} value={provincia}>
                          {provincia}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label" htmlFor="shipping_country">
                      <span className="label-text">País</span>
                    </label>
                    <select
                      id="shipping_country"
                      name="shipping_country"
                      className="select select-bordered w-full"
                      value={formData.shipping_country}
                      onChange={handleChange}
                      disabled
                    >
                      <option value="España">España</option>
                    </select>
                  </div>
                </div>

                {/* Separador - Dirección de Facturación */}
                <div className="md:col-span-2 mt-4">
                  <div className="divider">Adreça de Facturació</div>
                </div>

                {/* Dirección de Facturación - Calle/Puerta */}
                <div className="md:col-span-2">
                  <label className="label" htmlFor="billing_street">
                    <span className="label-text">Carrer / Porta</span>
                  </label>
                  <input
                    type="text"
                    id="billing_street"
                    name="billing_street"
                    placeholder="Carrer, número de porta..."
                    autoComplete="street-address"
                    className="input input-bordered w-full"
                    value={formData.billing_street}
                    onChange={handleChange}
                  />
                </div>

                {/* Piso, Escalera y Código Postal para Facturación */}
                <div className="md:col-span-2 grid grid-cols-3 gap-4">
                  <div>
                    <label className="label" htmlFor="billing_floor">
                      <span className="label-text">Pis</span>
                    </label>
                    <input
                      type="text"
                      id="billing_floor"
                      name="billing_floor"
                      placeholder="Pis (ex: 1r, 2n)"
                      className="input input-bordered w-full"
                      value={formData.billing_floor}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="label" htmlFor="billing_staircase">
                      <span className="label-text">Escala</span>
                    </label>
                    <input
                      type="text"
                      id="billing_staircase"
                      name="billing_staircase"
                      placeholder="Escala (ex.: A, B)"
                      className="input input-bordered w-full"
                      value={formData.billing_staircase}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="label" htmlFor="billing_zip_code">
                      <span className="label-text">Codi Postal</span>
                    </label>
                    <input
                      type="text"
                      id="billing_zip_code"
                      name="billing_zip_code"
                      placeholder="Codi Postal"
                      maxLength={8}
                      autoComplete="postal-code"
                      className="input input-bordered w-full"
                      value={formData.billing_zip_code}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Provincia y País para Facturación */}
                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                  <div>
                    <label className="label" htmlFor="billing_province">
                      <span className="label-text">Província</span>
                    </label>
                    <select
                      id="billing_province"
                      name="billing_province"
                      className="select select-bordered w-full"
                      value={formData.billing_province}
                      onChange={handleChange}
                    >
                      <option value="">Selecciona una província</option>
                      {provinciasEspana.map((provincia, index) => (
                        <option key={index} value={provincia}>
                          {provincia}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label" htmlFor="billing_country">
                      <span className="label-text">País</span>
                    </label>
                    <select
                      id="billing_country"
                      name="billing_country"
                      className="select select-bordered w-full"
                      value={formData.billing_country}
                      onChange={handleChange}
                      disabled
                    >
                      <option value="España">España</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Separador - Contraseña */}
            <div className="md:col-span-2 mt-4">
              <div className="divider">Canvi de Contrasenya</div>
              <div className="alert alert-info bg-info/10 border-info/20 text-info-content text-sm mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span>Si deixes aquests camps buits, la contrasenya no es canviarà. Per canviar-la, has d'omplir ambdós camps (mínim 8 caràcters).</span>
              </div>
            </div>

            {/* Nueva contraseña */}
            <div className="md:col-span-2">
              <label className="label" htmlFor="password">
                <span className="label-text">Nova contrasenya</span>
              </label>
              <input
                type="password"
                id="password"
                autoComplete="new-password"
                className="input input-bordered w-full"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            {/* Confirmar contraseña */}
            <div className="md:col-span-2">
              <label className="label" htmlFor="password_confirmation">
                <span className="label-text">Confirma la contrasenya</span>
              </label>
              <input
                type="password"
                id="password_confirmation"
                autoComplete="new-password"
                className="input input-bordered w-full"
                value={formData.password_confirmation}
                onChange={handleChange}
              />
            </div>

          </div>

          <button
            type="submit"
            className="btn btn-primary w-full mt-6"
            disabled={loading}
          >
            {loading ? 'Actualitzant compte...' : 'Actualitzar compte'}
          </button>

          {!isAdmin && (
            <>
              <div className="divider"></div>

              {/* Botón para eliminar cuenta */}
              <ConfirmableModal
                title="Eliminar compte"
                message="Estàs segur que vols eliminar el teu compte? Aquesta acció és irreversible."
                onConfirm={handleDelete}
              >
                <button
                  type="button"
                  className="btn btn-error w-full mt-3"
                  disabled={loading}
                >
                  Eliminar el meu compte
                </button>
              </ConfirmableModal>
            </>
          )}

        </form>

        {/* Notificaciones */}
        {notification && (
          <Notifications
            key={notification.id}
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        )}

      </div>
    </div>
  )
}

export default EditMyProfile