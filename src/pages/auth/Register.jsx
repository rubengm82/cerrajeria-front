import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../../api/auth_api'
import { mergeGuestCart } from '../../api/orders_api'
import { clearLocalCart, getLocalCartMergeItems } from '../../utils/localCart'

function Register() {
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    name: '',
    last_name_one: '',
    last_name_second: '',
    email: '',
    password: '',
    password_confirmation: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await register(formData)
      const guestCartItems = getLocalCartMergeItems()

      if (response.token && guestCartItems.length > 0) {
        try {
          await mergeGuestCart(guestCartItems, response.token)
          clearLocalCart()
        } catch (error) {
          console.error("No s'ha pogut sincronitzar el carret local.", error)
        }
      }

      setSuccess('Usuari creat correctament! Revisa el teu correu electrònic per verificar el teu compte.')
      // No redirigimos, mostramos el mensaje
    } catch (err) {
      const message = err.response?.data?.message || 'Error en crear el compte'
      const errors = err.response?.data?.errors
      
      if (errors) {
        // Mostrar errores de validación
        const firstError = Object.values(errors)[0]
        setError(firstError[0])
      } else {
        setError(message)
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="card w-96 bg-base-100 shadow-xl p-6">
          <div className="text-center">
            <div className="text-success text-5xl mb-4" aria-hidden="true">✓</div>
            <h2 className="text-xl font-bold text-success mb-2">Compte creat!</h2>
            <p className="text-sm text-gray-600 mb-4">{success}</p>
            <p className="text-sm text-gray-500 mb-4">
              Si no reps el correu, revisa la carpeta de correu no desitjat o 
              <Link to="/resend-verification" className="text-primary ml-1">
                reenvia el correu de verificació
              </Link>
            </p>
            <button 
              className="btn btn-primary" 
              onClick={() => navigate('/login')}
            >
              Anar a iniciar sessió
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen py-8">
      <form onSubmit={handleSubmit} className="card w-full max-w-2xl bg-base-100 shadow-xl p-6" aria-label="Formulari de registre" aria-describedby={error ? "register-error" : undefined}>
        <h2 className="text-2xl font-bold text-center mb-4">Crear compte</h2>
        
        {error && <p id="register-error" className="text-red-500 mb-4 text-center">{error}</p>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nom */}
          <div className="md:col-span-2">
            <label className="label" htmlFor="register-name">
              <span className="label-text">Nom *</span>
            </label>
            <input
              id="register-name"
              type="text"
              name="name"
              placeholder="Nom"
              className="input input-bordered w-full"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Primer cognom y Segon cognom en la misma línea */}
          <div className="grid grid-cols-2 gap-4 md:col-span-2">
            <div>
              <label className="label" htmlFor="register-last-name-one">
                <span className="label-text">Primer Cognom *</span>
              </label>
              <input
                id="register-last-name-one"
                type="text"
                name="last_name_one"
                placeholder="Primer Cognom"
                className="input input-bordered w-full"
                value={formData.last_name_one}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="label" htmlFor="register-last-name-second">
                <span className="label-text">Segon Cognom</span>
              </label>
              <input
                id="register-last-name-second"
                type="text"
                name="last_name_second"
                placeholder="Segon Cognom"
                className="input input-bordered w-full"
                value={formData.last_name_second}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Email */}
          <div className="md:col-span-2">
            <label className="label" htmlFor="register-email">
              <span className="label-text">Email *</span>
            </label>
            <input
              id="register-email"
              type="email"
              name="email"
              placeholder="Email"
              className="input input-bordered w-full"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Contrasenya */}
          <div className="md:col-span-2 mt-4">
            <div className="divider">Contrasenya</div>
          </div>

          <div className="md:col-span-2">
            <label className="label" htmlFor="register-password">
              <span className="label-text">Contrasenya *</span>
            </label>
            <input
              id="register-password"
              type="password"
              name="password"
              placeholder="Contrasenya (mín. 8 caràcters)"
              className="input input-bordered w-full"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
            />
          </div>

          {/* Confirmar Contrasenya */}
          <div className="md:col-span-2">
            <label className="label" htmlFor="register-password-confirmation">
              <span className="label-text">Confirmar Contrasenya *</span>
            </label>
            <input
              id="register-password-confirmation"
              type="password"
              name="password_confirmation"
              placeholder="Confirmar Contrasenya"
              className="input input-bordered w-full"
              value={formData.password_confirmation}
              onChange={handleChange}
              required
              minLength={8}
            />
          </div>
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary w-full mt-6"
          disabled={loading}
        >
          {loading ? 'Creant compte...' : 'Crear compte'}
        </button>
        
        <div className="mt-4 text-center">
          <p className="text-sm">
            Ja tens compte?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Inicia sessió
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}

export default Register
