import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Home() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-3xl font-bold">Serralleria Solidària</h1>
      
      {/* Solo monstrara Bienvenido si está logeado */}
      {user && <p className="text-lg">Benvingut, {user.name}</p>}
      
      {/* Si esta logeado mostrará Tancar y sino Iniciar */}
      {user 
        ? (
          <>
            <button className="btn btn-primary" onClick={() => navigate('/users')}>
              Veure Usuaris
            </button>
            <button className="btn btn-error" onClick={() => {
              logout()
              navigate('/')
            }}>
              Tancar Sessió
            </button>
          </>
        ) : (
          <button className="btn btn-primary" onClick={() => navigate('/login')}>
            Iniciar Sessió
          </button>
        )}
    </div>
  )
}

export default Home
