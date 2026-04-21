import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { HiOutlineCheckCircle, HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2'
import { register } from '../../api/auth_api'
import { mergeGuestCart } from '../../api/orders_api'
import { clearLocalCart, getLocalCartMergeItems } from '../../utils/localCart'
import './SignIn.scss'

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
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false)

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
      <main className="auth-page" aria-labelledby="register-success-title">
        <section className="auth-card auth-card--success" aria-describedby="register-success-description">
          <HiOutlineCheckCircle className="auth-card__success-icon" aria-hidden="true" />
          <h1 id="register-success-title" className="auth-card__title">Compte creat!</h1>
          <p id="register-success-description" className="auth-card__subtitle">{success}</p>
          <p className="auth-card__hint">
              Si no reps el correu, revisa la carpeta de correu no desitjat o 
              <Link to="/resend-verification" className="auth-link">
                reenvia el correu de verificació
              </Link>
          </p>
          <button className="auth-button" onClick={() => navigate('/login')}>
            Anar a iniciar sessió
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="auth-page auth-page--register" aria-labelledby="register-title">
      <form onSubmit={handleSubmit} className="auth-card auth-card--register" aria-label="Formulari de registre" aria-describedby={error ? "register-error" : "register-description"}>
        <header className="auth-card__header">
          <h1 id="register-title" className="auth-card__title">Crea el teu compte</h1>
          <p id="register-description" className="auth-card__subtitle">Omple les dades per començar a comprar i gestionar les teves comandes</p>
        </header>
        
        {error && (
          <div className="auth-alert" role="alert">
            <p id="register-error">{error}</p>
          </div>
        )}
        
        <div className="auth-grid">
          <div className="auth-field auth-grid__full">
            <label className="auth-field__label" htmlFor="register-name">Nom</label>
            <div className="auth-field__control auth-field__control--plain">
              <input
                id="register-name"
                type="text"
                name="name"
                placeholder="El teu nom"
                value={formData.name}
                onChange={handleChange}
                autoComplete="given-name"
                aria-label="Nom"
                required
              />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-field__label" htmlFor="register-last-name-one">Primer cognom</label>
            <div className="auth-field__control auth-field__control--plain">
              <input
                id="register-last-name-one"
                type="text"
                name="last_name_one"
                placeholder="Primer cognom"
                value={formData.last_name_one}
                onChange={handleChange}
                autoComplete="family-name"
                aria-label="Primer cognom"
                required
              />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-field__label" htmlFor="register-last-name-second">Segon cognom</label>
            <div className="auth-field__control auth-field__control--plain">
              <input
                id="register-last-name-second"
                type="text"
                name="last_name_second"
                placeholder="Segon cognom"
                value={formData.last_name_second}
                onChange={handleChange}
                autoComplete="additional-name"
                aria-label="Segon cognom"
              />
            </div>
          </div>

          <div className="auth-field auth-grid__full">
            <label className="auth-field__label" htmlFor="register-email">Correu electrònic</label>
            <div className="auth-field__control auth-field__control--plain">
              <input
                id="register-email"
                type="email"
                name="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                aria-label="Correu electrònic"
                required
              />
            </div>
          </div>

          <div className="auth-field auth-grid__full">
            <label className="auth-field__label" htmlFor="register-password">Contrasenya</label>
            <div className="auth-field__control auth-field__control--plain">
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Mínim 8 caràcters"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                aria-label="Contrasenya"
                required
                minLength={8}
              />
              <button
                type="button"
                className="auth-field__toggle"
                onClick={() => setShowPassword(current => !current)}
                aria-label={showPassword ? 'Amagar la contrasenya' : 'Mostrar la contrasenya'}
                aria-pressed={showPassword}
              >
                {showPassword ? <HiOutlineEyeSlash aria-hidden="true" /> : <HiOutlineEye aria-hidden="true" />}
              </button>
            </div>
          </div>

          <div className="auth-field auth-grid__full">
            <label className="auth-field__label" htmlFor="register-password-confirmation">Confirma la contrasenya</label>
            <div className="auth-field__control auth-field__control--plain">
              <input
                id="register-password-confirmation"
                type={showPasswordConfirmation ? 'text' : 'password'}
                name="password_confirmation"
                placeholder="Repeteix la contrasenya"
                value={formData.password_confirmation}
                onChange={handleChange}
                autoComplete="new-password"
                aria-label="Confirmar contrasenya"
                required
                minLength={8}
              />
              <button
                type="button"
                className="auth-field__toggle"
                onClick={() => setShowPasswordConfirmation(current => !current)}
                aria-label={showPasswordConfirmation ? 'Amagar la confirmació de contrasenya' : 'Mostrar la confirmació de contrasenya'}
                aria-pressed={showPasswordConfirmation}
              >
                {showPasswordConfirmation ? <HiOutlineEyeSlash aria-hidden="true" /> : <HiOutlineEye aria-hidden="true" />}
              </button>
            </div>
          </div>
        </div>
        
        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? 'Creant compte...' : 'Crear compte'}
        </button>
        
        <div className="auth-card__footer">
          <p>
            Ja tens compte?{' '}
            <Link to="/login" className="auth-link auth-link--strong">
              Inicia sessió
            </Link>
          </p>
        </div>
      </form>
    </main>
  )
}

export default Register
