import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  // FUNCTION del Submit
  const handleSubmit = (event) => {
    event.preventDefault()
    login(email, password)
      .then(() => navigate('/dashboard'))
      .catch(() => setError('Email o contrasenya incorrectes'))
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form onSubmit={handleSubmit} className="card w-96 bg-base-100 shadow-xl p-6">
        <h2 className="text-2xl font-bold text-center mb-4">Iniciar Sessió</h2>
        
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        
        <input
          type="email"
          placeholder="Email"
          className="input input-bordered w-full mb-3"
          value={email}
          onChange={event => setEmail(event.target.value)}
          required
        />
        
        <input
          type="password"
          placeholder="Contrasenya"
          className="input input-bordered w-full mb-4"
          value={password}
          onChange={event => setPassword(event.target.value)}
          required
        />
        
        <button type="submit" className="btn btn-primary w-full mb-3">
          Iniciar Sessió
        </button>
        
        <button type="button" className="btn btn-ghost w-full" onClick={() => navigate('/')}>
          Tornar
        </button>
        
        <div className="mt-4 text-center">
          <Link to="/forgot-password" className="text-sm text-primary hover:underline">
            He oblidat la meva contrasenya
          </Link>
        </div>
      </form>
    </div>
  )
}

export default SignIn
