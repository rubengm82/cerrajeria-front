import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { forgotPassword } from '../../api/password_api'

function ForgotPassword() {
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
      await forgotPassword(email)
      setMessage('Si el correu electrònic existeix, rebràs un enllaç per restablir la contrasenya.')
      setTimeout(() => navigate('/login'), 5000)
    } catch (err) {
      setError(err.response?.data?.message || 'Error en enviar el correu de recuperació')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form onSubmit={handleSubmit} className="card w-96 bg-base-100 shadow-xl p-6">
        <h2 className="text-2xl font-bold text-center mb-4">He oblidat la meva contrasenya</h2>
        
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        {message && <p className="text-green-500 mb-4 text-center">{message}</p>}
        
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
          {loading ? 'Enviant...' : 'Enviar enllaç de recuperació'}
        </button>
        
        <button 
          type="button" 
          className="btn btn-ghost w-full" 
          onClick={() => navigate('/login')}
        >
          Tornar a Inici de Sessió
        </button>
      </form>
    </div>
  )
}

export default ForgotPassword
