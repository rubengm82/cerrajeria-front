import { Link } from 'react-router-dom'

function Error500() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-base-200">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-error">500</h1>
        <p className="text-2xl font-semibold mt-4">Error intern del servidor</p>
        <p className="text-base-content/60 mt-2">S'ha produït un error al servidor. Si us plau, prova-ho més tard</p>
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

export default Error500
