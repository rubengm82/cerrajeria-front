import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function TopBarShop() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="navbar shop-topbar bg-base-100">
      <div className="shop-topbar__brand">
        <Link to="/" className="btn btn-ghost shop-topbar__logo text-primary">
          Cerrajería ABP
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

              <li className="shop-topbar__logout border-base-300">
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
