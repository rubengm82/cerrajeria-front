import { Link } from 'react-router-dom'

function Error503() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-base-200">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-error">503</h1>
        <p className="text-2xl font-semibold mt-4">Servei no disponible</p>
        <p className="text-base-content/60 mt-2">El servei està temporalment fora de servei</p>
        <Link 
          to="/" 
          className="btn btn-primary mt-8"
        >
          Tornar a l'inici
        </Link>
      </div>
    </div>
  )
}

export default Error503
