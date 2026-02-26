import { Link } from 'react-router-dom'

function Error403() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-base-200">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-warning">403</h1>
        <p className="text-2xl font-semibold mt-4">Accés prohibit</p>
        <p className="text-base-content/60 mt-2">No tens permisos per accedir a aquesta pàgina</p>
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

export default Error403
