import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getUser, updateUser, deleteUser } from '../../api/users_api'
import { useLocation } from 'react-router-dom'
import LoadingAnimation from '../../components/LoadingAnimation'
import Notifications from '../../components/Notifications'
import ConfirmableModal from '../../components/ConfirmableModal'
import { HiOutlineExclamationTriangle } from "react-icons/hi2";

function EditMyProfile() {

  const { user: authUser, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState(null)

  const [formData, setFormData] = useState({
    name: "",
    last_name_one: "",
    last_name_second: "",
    dni: "",
    phone:  "",
    email:  "",
    address_street: "",
    address_floor: "",
    address_staircase: "",
    zip_code: "",
    password: "",
    password_confirmation: "",
  })

  // Función para parsear la dirección guardada en la base de datos
  const parseAddress = (address) => {
    if (!address) return { street: '', floor: '', staircase: '' }
    
    // Formato esperado: "Calle, Piso, Escalera" o cualquier combinación
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
        // Parsear la dirección guardada
        const parsedAddress = parseAddress(response.data.address)
        
        setFormData({
          name: response.data.name || "",
          last_name_one: response.data.last_name_one || "",
          last_name_second: response.data.last_name_second || "",
          dni: response.data.dni || "",
          phone: response.data.phone || "",
          email: response.data.email || "",
          address_street: parsedAddress.street || "",
          address_floor: parsedAddress.floor || "",
          address_staircase: parsedAddress.staircase || "",
          zip_code: response.data.zip_code || ""
        })
      } catch (err) {
        console.error('Error fetching user:', err)
        if (authUser) {
          const parsedAddress = parseAddress(authUser.address)
          setFormData({
            name: authUser.name || "",
            last_name_one: authUser.last_name_one || "",
            last_name_second: authUser.last_name_second || "",
            dni: authUser.dni || "",
            phone: authUser.phone || "",
            email: authUser.email || "",
            address_street: parsedAddress.street || "",
            address_floor: parsedAddress.floor || "",
            address_staircase: parsedAddress.staircase || "",
            zip_code: authUser.zip_code || ""
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

      // Validar contraseñas si se proporcionan
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

      // Solo añadir campos opcionales si tienen valor
      if (formData.last_name_second) {
        dataToUpdate.last_name_second = formData.last_name_second
      }
      if (formData.dni) {
        dataToUpdate.dni = formData.dni
      }
      if (formData.phone) {
        dataToUpdate.phone = formData.phone
      }
      
      // Concatenar dirección: calle, piso, escalera
      if (formData.address_street || formData.address_floor || formData.address_staircase) {
        const addressParts = [
          formData.address_street,
          formData.address_floor,
          formData.address_staircase
        ].filter(part => part)
        dataToUpdate.address = addressParts.join(', ')
      }
      
      if (formData.zip_code) {
        dataToUpdate.zip_code = formData.zip_code
      }
      
      // Solo añadir contraseña si se proporciona
      if (formData.password) {
        dataToUpdate.password = formData.password
        dataToUpdate.password_confirmation = formData.password_confirmation
      }
        
      await updateUser(userId, dataToUpdate)
      
      // Éxito
      setNotification({ 
        id: Date.now(), 
        type: 'success', 
        message: 'Perfil actualitzat correctament!' 
      })
      
      // Limpiar campos de contraseña
      setFormData(prev => ({
        ...prev,
        password: '',
        password_confirmation: ''
      }))
      
    } catch (err) {
      console.error('Error actualitzant perfil:', err)
      
      // Error
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
      // Eliminar localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Redirigir al usuario a la página de inicio
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

  // Se obtiene la notificacion del historial si es que hay
  const location = useLocation()
  const locationState = location.state

  // Se limpia el historial despues de mostrar una notificacion
  useEffect(() => {
    if (locationState) {
      window.history.replaceState({}, document.title)
    }
  }, [locationState])

// 'name', 'last_name_one', 'last_name_second', 'dni', 'phone', 'email', 'address', 'zip_code', 'password'

  return loading ? <LoadingAnimation/> : (
    <div className='flex flex-col items-center px-4 py-8'>
      <div className="w-full max-w-2xl">
        
        <div className="mb-5">
          <h1 className="text-2xl font-bold">Edita el teu perfil</h1>
        </div>

        {/* Aviso para completar datos */}
        {(!formData.dni || !formData.phone || !formData.address_street || !formData.zip_code) && (
          <div className="alert alert-warning mb-4">
            <HiOutlineExclamationTriangle className='stroke-current shrink-0 h-6 w-6' />
            <span>Si us plau, completa les teves dades personals (DNI, telèfon, adreça, codi postal) al teu perfil.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="card w-full max-w-2xl bg-base-100 shadow-xl p-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {/* Separador - Dirección */}
            <div className="md:col-span-2 mt-2">
              <div className="divider">Direcció</div>
            </div>

            {/* Dirección - Calle/Puerta */}
            <div className="md:col-span-2">
              <label className="label" htmlFor="address_street">
                <span className="label-text">Carrer / Porta</span>
              </label>
              <input
                type="text"
                id="address_street"
                name="address_street"
                placeholder="Carrer, número de porta..."
                autoComplete="street-address"
                className="input input-bordered w-full"
                value={formData.address_street}
                onChange={handleChange}
              />
            </div>

            {/* Piso, Escalera y Código Postal */}
            <div className="md:col-span-2 grid grid-cols-3 gap-4">
              <div>
                <label className="label" htmlFor="address_floor">
                  <span className="label-text">Pis</span>
                </label>
                <input
                  type="text"
                  id="address_floor"
                  name="address_floor"
                  placeholder="Pis (ex: 1r, 2n)"
                  className="input input-bordered w-full"
                  value={formData.address_floor}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="label" htmlFor="address_staircase">
                  <span className="label-text">Escala</span>
                </label>
                <input
                  type="text"
                  id="address_staircase"
                  name="address_staircase"
                  placeholder="Escala (ex.: A, B)"
                  className="input input-bordered w-full"
                  value={formData.address_staircase}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="label" htmlFor="zip_code">
                  <span className="label-text">Codi Postal</span>
                </label>
                <input
                  type="text"
                  id="zip_code"
                  name="zip_code"
                  placeholder="Codi Postal"
                  maxLength={8}
                  autoComplete="postal-code"
                  className="input input-bordered w-full"
                  value={formData.zip_code}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Separador - Contraseña */}
            <div className="md:col-span-2 mt-4">
              <div className="divider">Canvi de Contrasenya</div>
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
