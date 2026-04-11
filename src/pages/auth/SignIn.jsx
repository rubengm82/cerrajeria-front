import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './SignIn.scss'

function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
    <div className="flex items-center justify-center min-h-screen">
      <form onSubmit={handleSubmit} className="card w-96 bg-base-100 shadow-xl p-6" aria-label="Formulari d'inici de sessió" aria-describedby={error ? "signin-error" : undefined}>
        <h2 className="text-2xl font-bold text-center mb-4">Inicia sessió</h2>
        
        {error && 
          <div className="mb-4">
            <p id="signin-error" className="text-red-500 text-center mb-2">{error}</p>
            {error.includes('verificar') && (
              <div className="text-center">
                <Link to="/resend-verification" className="text-sm text-primary hover:underline">
                  Reenviar correu de verificació
                </Link>
              </div>
            )}
          </div>
        }
        
        <input
          type="email"
          placeholder="Email"
          className="input input-bordered w-full mb-3"
          value={email}
          onChange={event => setEmail(event.target.value)}
          aria-label="Email"
          required
        />
        
        <input
          type="password"
          placeholder="Contrasenya"
          className="input input-bordered w-full mb-4"
          value={password}
          onChange={event => setPassword(event.target.value)}
          aria-label="Contrasenya"
          required
        />
        
        <button type="submit" className="btn btn-primary w-full mb-3">
          Inicia sessió
        </button>
        
        <button type="button" className="btn btn-ghost w-full" onClick={() => navigate('/')}>
          Tornar
        </button>
        
        <div className="mt-4 text-center">
          <Link to="/forgot-password" className="text-sm text-primary hover:underline">
            He oblidat la meva contrasenya
          </Link>
        </div>
        
        <div className="mt-2 text-center">
          <p className="text-sm text-gray-500">
            Encara no tens compte?{' '}
            <Link to="/register" className="text-primary hover:underline">
              Crear compte
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}

export default SignIn
