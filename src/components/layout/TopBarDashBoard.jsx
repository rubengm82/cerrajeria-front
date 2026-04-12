import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { HiBars3, HiOutlineUserCircle, HiOutlineHome } from 'react-icons/hi2'

export default function TopBarDashBoard() {
  const { user, logout } = useAuth()
  
  return (
    <div className="navbar bg-transparent">
      <div className="flex-none lg:hidden">
        <label htmlFor="drawer" className="btn btn-square btn-ghost" aria-label="Obrir o tancar el menú lateral">
          <HiBars3 className="inline-block w-6 h-6 stroke-current" aria-hidden="true" />
        </label>
      </div>

      <div className="flex-1">
        {/* Espai buit per mantenir el dropdown a la dreta */}
      </div>

      <div className="flex-none">
        <div className="dropdown dropdown-end">
          <button tabIndex={0} className='btn btn-ghost btn-circle' aria-label="Obrir el menú d'usuari">
            <HiOutlineUserCircle className="shop-tobar-end__icon" aria-hidden="true" />
          </button>
          <ul tabIndex={-1} className="mt-3 z-50 p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
            {user?.role === 'admin' || user?.role === 1 ? (
              <>
                <li className="mb-2">
                  <Link to="/" className="btn btn-primary btn-outline w-full">
                    <HiOutlineHome className="size-6" aria-hidden="true" />
                    Tornar a la botiga
                  </Link>
                </li>
                <li>
                  <button className='btn btn-error w-full' onClick={logout} aria-label="Tancar la sessió actual">Tancar sessió</button>
                </li>
              </>
            ) : (
              <>
                <div className="menu-title px-4 py-2">
                  <span>{user?.name + " " + user?.last_name_one || 'Usuari'}</span>
                </div>
                <li className="border-t border-base-300 mt-2 pt-2 mb-2">
                  <Link to="/" className="btn btn-primary btn-outline w-full">
                    <HiOutlineHome className="size-6" aria-hidden="true" />
                    Tornar a la botiga
                  </Link>
                </li>
                <li>
                  <button className='btn btn-error w-full' onClick={logout} aria-label="Tancar la sessió actual">Tancar sessió</button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
