import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { verifyEmail } from '../../api/auth_api'

function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const id = searchParams.get('id')
  const hash = searchParams.get('hash')
  
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const verify = async () => {
      if (!id || !hash) {
        setError('Enllaç de verificació no vàlid')
        setLoading(false)
        return
      }

      try {
        const response = await verifyEmail(id, hash)
        setMessage(response.message)
        setSuccess(true)
      } catch (err) {
        setError(err.response?.data?.message || 'Error en verificar el correu electrònic')
        setSuccess(false)
      } finally {
        setLoading(false)
      }
    }

    verify()
  }, [id, hash])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4">Verificant correu electrònic...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="card w-96 bg-base-100 shadow-xl p-6">
        <div className="text-center">
          {success ? (
            <>
              <div className="text-success-content text-5xl mb-4">✓</div>
              <h2 className="text-xl font-bold text-success-content mb-2">Correu verificat!</h2>
              <p className="text-sm text-gray-600 mb-4">{message}</p>
              <button 
                className="btn btn-primary" 
                onClick={() => navigate('/login')}
              >
                Anar a iniciar sessió
              </button>
            </>
          ) : (
            <>
              <div className="text-error-content text-5xl mb-4">✗</div>
              <h2 className="text-xl font-bold text-error-content mb-2">Error en la verificació</h2>
              <p className="text-sm text-gray-600 mb-4">{error}</p>
              <button 
                className="btn btn-primary" 
                onClick={() => navigate('/')}
              >
                Tornar a l'inici
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default VerifyEmail
