import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { HiOutlineShoppingCart, HiOutlineUserCircle, HiOutlineBars3 } from "react-icons/hi2";


export default function TopBarShop() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
<div className="drawer">
  <input id="shop-drawer" type="checkbox" className="drawer-toggle" />

  <div className="drawer-content">
    <div className="navbar bg-base-100 shadow-sm">
      <div className="navbar-start">
        <label htmlFor="shop-drawer" aria-label="open sidebar" className="btn btn-square btn-ghost lg:hidden">
          <HiOutlineBars3 className="shop-tobar-end__icon" />
        </label>
        <a className="btn btn-ghost text-xl">Logo</a>
      </div>
      <div className="navbar-center hidden lg:flex shop-topbar">
        <ul className="menu menu-horizontal px-1 shop-topbar__menu">
          <li className="shop-topbar__menu-item"><Link to={"/"} className="shop-topbar__menu-link">Inici</Link></li>
          <li className="shop-topbar__menu-item"><Link to={"/products"} className="shop-topbar__menu-link">Productes</Link></li>
          <li className="shop-topbar__menu-item"><Link to={"/"} className="shop-topbar__menu-link">Packs</Link></li>
          <li className="shop-topbar__menu-item"><Link to={"/categories"} className="shop-topbar__menu-link">Categories</Link></li>
        </ul>
      </div>
      <div className="navbar-end shop-tobar-end">
        <Link to={"/#Carrito"}>
          <HiOutlineShoppingCart className="shop-tobar-end__icon" />
        </Link>

        {/* Desplegable del usuario */}
        <div className="dropdown dropdown-end">
          <button tabIndex={0} className='shop-tobar-end__dropdown-button'>
            <HiOutlineUserCircle className="shop-tobar-end__icon" />
          </button>
          {user ?
          <ul tabIndex="-1" className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm gap-2">
            <li><Link to={"/login"} className='btn btn-primary'>Panell d'administració</Link></li>
            <li className='btn btn-error' onClick={logout}>Tancar sessió</li>
          </ul>
          :
          <ul tabIndex="-1" className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
            <li><Link to={"/login"} className='btn btn-primary'>Inicia sessió</Link></li>
          </ul>
          }
        </div>
        <Link to={"/#Carrito"}>
        </Link>
      </div>
    </div>
  </div>

  <div className="drawer-side">
    <label htmlFor="shop-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
    <ul className="menu min-h-full w-80 bg-base-200 p-4">
      <li className="shop-topbar__menu-item"><Link to={"/"} className="shop-topbar__menu-link">Inici</Link></li>
      <li className="shop-topbar__menu-item"><Link to={"/products"} className="shop-topbar__menu-link">Productes</Link></li>
      <li className="shop-topbar__menu-item"><Link to={"/"} className="shop-topbar__menu-link">Packs</Link></li>
      <li className="shop-topbar__menu-item"><Link to={"/categories"} className="shop-topbar__menu-link">Categories</Link></li>
    </ul>
  </div>
</div>
  )
}
