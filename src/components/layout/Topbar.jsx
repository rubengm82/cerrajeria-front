import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { HiBars3 } from 'react-icons/hi2'

export default function Topbar() {
  const { user, logout } = useAuth()
  
  // Si no hay usuario logueado, mostrar botón de login
  if (!user) {
    return (
      <div className="navbar bg-transparent">
        <div className="flex-none lg:hidden">
          <label htmlFor="drawer" className="btn btn-square btn-ghost">
            <HiBars3 className="inline-block w-6 h-6" />
          </label>
        </div>
        
        <div className="flex-1">
          <Link to="/" className="btn btn-ghost text-xl">
            Cerrajería ABP
          </Link>
        </div>
        
        <div className="flex-none gap-2">
          <Link to="/login" className="btn btn-primary">
            Iniciar Sessió
          </Link>
        </div>
      </div>
    )
  }
  
  // Usuario logueado - mostrar dropdown con opciones
  return (
    <div className="navbar bg-transparent">
      <div className="flex-none lg:hidden">
        <label htmlFor="drawer" className="btn btn-square btn-ghost">
          <HiBars3 className="inline-block w-6 h-6" />
        </label>
      </div>
      
      <div className="flex-1">
        {/* Espai buit per mantenir el dropdown a la dreta */}
      </div>
      
      <div className="flex-none gap-2">
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar placeholder">
            <div className="bg-primary text-primary-content rounded-full w-10 flex items-center justify-center">
              <span className="text-lg">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
            </div>
          </div>
          <ul tabIndex={0} className="mt-3 z-1 p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
            <li className="menu-title">
              <span>{user?.name || 'Usuari'}</span>
            </li>
            <li><a>{user?.email || 'email@exemple.com'}</a></li>
            <li>
              <a>
                {user?.role === 'admin' || user?.role === 1 
                  ? 'Administrador' 
                  : 'Usuari'}
              </a>
            </li>
            <li className="border-t border-base-300 mt-2 pt-2">
              <button onClick={logout} className="btn btn-ghost text-base-content">
                Tancar Sessió
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
