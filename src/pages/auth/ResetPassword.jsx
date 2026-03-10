import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { resetPassword } from '../../api/password_api'

function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const token = searchParams.get('token')
  const email = searchParams.get('email')
  
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token || !email) {
      setError('Enllaç invàlid. Si us plau, sol·licita un nou enllaç de restabliment.')
    }
  }, [token, email])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (password !== passwordConfirmation) {
      setError('Les contrasenyes no coincideixen')
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError('La contrasenya ha de tenir almenys 8 caràcters')
      setLoading(false)
      return
    }

    try {
      await resetPassword({
        email,
        token,
        password,
        password_confirmation: passwordConfirmation
      })
      setMessage('Contrasenya restablerta correctament! Ara pots iniciar sessió.')
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al restablir la contrasenya')
    } finally {
      setLoading(false)
    }
  }

  if (!token || !email) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="card w-96 bg-base-100 shadow-xl p-6">
          <p className="text-red-500 text-center">{error}</p>
          <button 
            className="btn btn-primary mt-4" 
            onClick={() => navigate('/')}
          >
            Tornar a l'inici
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form onSubmit={handleSubmit} className="card w-96 bg-base-100 shadow-xl p-6">
        <h2 className="text-2xl font-bold text-center mb-4">Restablir Contrasenya</h2>
        
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        {message && <p className="text-green-500 mb-4 text-center">{message}</p>}
        
        <input
          type="email"
          placeholder="Email"
          className="input input-bordered w-full mb-3"
          value={email}
          disabled
        />
        
        <input
          type="password"
          placeholder="Nova contrasenya"
          className="input input-bordered w-full mb-3"
          value={password}
          onChange={event => setPassword(event.target.value)}
          required
          minLength={8}
        />
        
        <input
          type="password"
          placeholder="Confirmar contrasenya"
          className="input input-bordered w-full mb-4"
          value={passwordConfirmation}
          onChange={event => setPasswordConfirmation(event.target.value)}
          required
          minLength={8}
        />
        
        <button 
          type="submit" 
          className="btn btn-primary w-full mb-3"
          disabled={loading}
        >
          {loading ? 'Restablint...' : 'Restablir Contrasenya'}
        </button>
        
        <button 
          type="button" 
          className="btn btn-ghost w-full" 
          onClick={() => navigate('/login')}
        >
          Cancel·lar
        </button>
      </form>
    </div>
  )
}

export default ResetPassword
