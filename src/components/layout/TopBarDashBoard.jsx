import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { HiBars3, HiOutlineUserCircle } from 'react-icons/hi2'

export default function TopBarDashBoard() {
  const { user, logout } = useAuth()
  
  return (
    <div className="navbar bg-transparent">
      <div className="flex-none lg:hidden">
        <label htmlFor="drawer" className="btn btn-square btn-ghost">
          <HiBars3 className="inline-block w-6 h-6 stroke-current" />
        </label>
      </div>

      <div className="flex-1">
        {/* Espai buit per mantenir el dropdown a la dreta */}
      </div>

      <div className="flex-none">
        <div className="dropdown dropdown-end">
          <button tabIndex={0} className='btn btn-ghost btn-circle'>
            <HiOutlineUserCircle className="shop-tobar-end__icon" />
          </button>
          <ul tabIndex={-1} className="mt-3 z-50 p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
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
              <button className='btn btn-error w-full' onClick={logout}>Tancar sessió</button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
