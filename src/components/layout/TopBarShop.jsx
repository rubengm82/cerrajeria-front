import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function TopBarShop() {
  const { user, logout } = useAuth()

  return (
    <div className="navbar shop-topbar bg-base-100">
      <div className="shop-topbar__brand">
        <Link to="/" className="shop-topbar__logo link link-hover text-primary">
          Serralleria Solidària
        </Link>
      </div>

      <div className="shop-topbar__actions">
        {!user ? (
          <Link to="/login" className="btn btn-primary btn-sm md:btn-md">
            Iniciar Sessió
          </Link>
        ) : (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar placeholder">
              <div className="shop-topbar__avatar bg-primary text-primary-content">
                <span className="shop-topbar__avatar-letter">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
              </div>
            </div>

            <ul tabIndex={0} className="menu menu-sm dropdown-content shop-topbar__menu bg-base-100">
              <li className="menu-title"><span>{user?.name || 'Usuari'}</span></li>
              <li><a>{user?.email || 'email@exemple.com'}</a></li>

              {(user?.role === 'admin' || user?.role === 1) && (
                <li className="shop-topbar__menu-item">
                  <Link to="/admin/dashboard" className="shop-topbar__admin-link bg-primary text-primary-content">
                    Panell d'Administració
                  </Link>
                </li>
              )}

              <li className="border-t border-base-300 mt-2 pt-2">
                <button onClick={logout} className="btn btn-ghost text-base-content">
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
