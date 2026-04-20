import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HiOutlineEnvelope, HiOutlineEye, HiOutlineEyeSlash, HiOutlineLockClosed } from 'react-icons/hi2'
import { useAuth } from '../../context/AuthContext'
import './SignIn.scss'

function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  // FUNCTION del Submit
  const handleSubmit = (event) => {
    event.preventDefault()
    setError('')
    
    login(email, password)
      .then(() => navigate('/'))
      .catch((err) => {
        // Verificar si el error es por email no verificado
        if (err.response?.status === 403 && err.response?.data?.email_verified === false) {
          setError("Has de verificar el teu correu electrònic abans d'accedir.")
        } else {
          setError('Correu electrònic o contrasenya incorrectes')
        }
      })
  }

  return (
    <main className="auth-page" aria-labelledby="signin-title">
      <form onSubmit={handleSubmit} className="auth-card" aria-label="Formulari d'inici de sessió" aria-describedby={error ? "signin-error" : "signin-description"}>
        <header className="auth-card__header">
          <h1 id="signin-title" className="auth-card__title">Benvingut de nou</h1>
          <p id="signin-description" className="auth-card__subtitle">Inicia sessió per accedir de nou al teu compte</p>
        </header>
        
        {error && 
          <div className="auth-alert" role="alert">
            <p id="signin-error">{error}</p>
            {error.includes('verificar') && (
              <div className="auth-alert__action">
                <Link to="/resend-verification" className="auth-link">
                  Reenviar correu de verificació
                </Link>
              </div>
            )}
          </div>
        }
        
        <div className="auth-field">
          <label className="auth-field__label" htmlFor="signin-email">Correu electrònic</label>
          <div className="auth-field__control">
            <HiOutlineEnvelope className="auth-field__icon" aria-hidden="true" />
            <input
              id="signin-email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={event => setEmail(event.target.value)}
              autoComplete="email"
              aria-label="Correu electrònic"
              required
            />
          </div>
        </div>
        
        <div className="auth-field">
          <div className="auth-field__top">
            <label className="auth-field__label" htmlFor="signin-password">Contrasenya</label>
            <Link to="/forgot-password" className="auth-link auth-link--small">
              Has oblidat la contrasenya?
            </Link>
          </div>
          <div className="auth-field__control">
            <HiOutlineLockClosed className="auth-field__icon" aria-hidden="true" />
            <input
              id="signin-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Introdueix la contrasenya"
              value={password}
              onChange={event => setPassword(event.target.value)}
              autoComplete="current-password"
              aria-label="Contrasenya"
              required
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

        <button type="submit" className="auth-button">
          Inicia sessió
        </button>
        
        <div className="auth-card__footer">
          <p>
            No tens un compte?{' '}
            <Link to="/register" className="auth-link auth-link--strong">
              Registra't
            </Link>
          </p>
        </div>
      </form>
    </main>
  )
}

export default SignIn
