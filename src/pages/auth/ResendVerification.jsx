import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { resendVerificationEmail } from '../../api/auth_api'

function ResendVerification() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await resendVerificationEmail(email)
      setMessage(response.message)
      // Después de éxito, esperar un poco y redirigir al login
      setTimeout(() => navigate('/login'), 5000)
    } catch (err) {
      setError(err.response?.data?.message || 'Error en reenviar el correu de verificació')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="card w-96 bg-base-100 shadow-xl p-6">
        <h2 className="text-2xl font-bold text-center mb-4">Reenviar correu de verificació</h2>
        
        {message && (
          <div className="alert alert-success mb-4">
            <span>{message}</span>
          </div>
        )}
        
        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}
        
        <p className="text-sm text-gray-600 mb-4">
          Si no has rebut el correu de verificació o l'has eliminat, pots sol·licitar un nou enllaç.
        </p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="El teu correu electrònic"
            className="input input-bordered w-full mb-4"
            value={email}
            onChange={event => setEmail(event.target.value)}
            required
          />
          
          <button 
            type="submit" 
            className="btn btn-primary w-full mb-3"
            disabled={loading}
          >
            {loading ? 'Enviant...' : 'Reenviar correu de verificació'}
          </button>
        </form>
        
        <button 
          type="button" 
          className="btn btn-ghost w-full" 
          onClick={() => navigate('/login')}
        >
          Tornar a iniciar sessió
        </button>
        
        <div className="mt-4 text-center">
          <p className="text-sm">
            No tens compte?{' '}
            <Link to="/register" className="text-primary hover:underline">
              Crear compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ResendVerification
