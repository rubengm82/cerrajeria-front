import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { HiMagnifyingGlass } from "react-icons/hi2";

export default function TopBarShop() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="navbar bg-base-100 shadow-sm px-4 md:px-8">
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost text-xl font-bold text-primary">
          Cerrajería ABP
        </Link>
      </div>

      <div className="flex-none gap-4">
        {!user ? (
          <Link to="/login" className="btn btn-primary btn-sm md:btn-md">
            Iniciar Sessió
          </Link>
        ) : (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar placeholder">
              <div className="bg-primary text-primary-content rounded-full w-10 flex items-center justify-center">
                <span className="text-lg">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
              </div>
            </div>

            <ul tabIndex={0} className="mt-3 z-1 p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
              <li className="menu-title"><span>{user?.name || 'Usuari'}</span></li>
              <li><a>{user?.email || 'email@exemple.com'}</a></li>

              {(user?.role === 'admin' || user?.role === 1) && (
                <li className="mt-2">
                  <Link to="/admin/dashboard" className="bg-primary text-primary-content hover:bg-primary-focus">
                    Panell d'Administració
                  </Link>
                </li>
              )}

              <li className="border-t border-base-300 mt-2 pt-2">
                <button onClick={handleLogout} className="text-error">
                  Tancar Sessió
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
