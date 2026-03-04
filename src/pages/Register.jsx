import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../api/auth_api'

function Register() {
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    name: '',
    last_name_one: '',
    last_name_second: '',
    dni: '',
    phone: '',
    email: '',
    address: '',
    zip_code: '',
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
      await register(formData)
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
            <div className="text-success text-5xl mb-4">✓</div>
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
              Anar a Iniciar Sessió
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen py-8">
      <form onSubmit={handleSubmit} className="card w-full max-w-2xl bg-base-100 shadow-xl p-6">
        <h2 className="text-2xl font-bold text-center mb-4">Crear Compte</h2>
        
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nom */}
          <div>
            <label className="label">
              <span className="label-text">Nom *</span>
            </label>
            <input
              type="text"
              name="name"
              placeholder="Nom"
              className="input input-bordered w-full"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Primer cognom */}
          <div>
            <label className="label">
              <span className="label-text">Primer Cognom *</span>
            </label>
            <input
              type="text"
              name="last_name_one"
              placeholder="Primer Cognom"
              className="input input-bordered w-full"
              value={formData.last_name_one}
              onChange={handleChange}
              required
            />
          </div>

          {/* Segon cognom */}
          <div>
            <label className="label">
              <span className="label-text">Segon Cognom</span>
            </label>
            <input
              type="text"
              name="last_name_second"
              placeholder="Segon Cognom"
              className="input input-bordered w-full"
              value={formData.last_name_second}
              onChange={handleChange}
            />
          </div>

          {/* DNI */}
          <div>
            <label className="label">
              <span className="label-text">DNI *</span>
            </label>
            <input
              type="text"
              name="dni"
              placeholder="DNI"
              className="input input-bordered w-full"
              value={formData.dni}
              onChange={handleChange}
              required
            />
          </div>

          {/* Telèfon */}
          <div>
            <label className="label">
              <span className="label-text">Telèfon *</span>
            </label>
            <input
              type="tel"
              name="phone"
              placeholder="Telèfon"
              className="input input-bordered w-full"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="label">
              <span className="label-text">Email *</span>
            </label>
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="input input-bordered w-full"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Adreça */}
          <div className="md:col-span-2">
            <label className="label">
              <span className="label-text">Adreça *</span>
            </label>
            <input
              type="text"
              name="address"
              placeholder="Adreça"
              className="input input-bordered w-full"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          {/* Codi Postal */}
          <div>
            <label className="label">
              <span className="label-text">Codi Postal *</span>
            </label>
            <input
              type="text"
              name="zip_code"
              placeholder="Codi Postal"
              className="input input-bordered w-full"
              value={formData.zip_code}
              onChange={handleChange}
              required
            />
          </div>

          {/* Contrasenya */}
          <div>
            <label className="label">
              <span className="label-text">Contrasenya *</span>
            </label>
            <input
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
          <div>
            <label className="label">
              <span className="label-text">Confirmar Contrasenya *</span>
            </label>
            <input
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
          {loading ? 'Creant compte...' : 'Crear Compte'}
        </button>
        
        <div className="mt-4 text-center">
          <p className="text-sm">
            Ja tens compte?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Iniciar Sessió
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}

export default Register
