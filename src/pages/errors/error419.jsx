import { Link } from 'react-router-dom'

function Error419() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-base-200">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-warning">419</h1>
        <p className="text-2xl font-semibold mt-4">Pàgina expirada</p>
        <p className="text-base-content/60 mt-2">La teva sessió ha expirat. Si us plau, intenta-ho de nou</p>
        <Link 
          to="/login" 
          className="btn btn-primary mt-8"
        >
          Iniciar sessió
        </Link>
      </div>
    </div>
  )
}

export default Error419
