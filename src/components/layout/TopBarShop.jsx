import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { HiOutlineShoppingCart, HiOutlineUserCircle, HiOutlineBars3, HiOutlineEye } from "react-icons/hi2";
import SearchBar from '../SearchBar'


export default function TopBarShop() {
  const { user, logout } = useAuth()
  const dashboardUrl = user?.role === 'admin' || user?.role === 1 ? '/admin/dashboard' : '/dashboard'

  return (
    <div className="drawer">
      <input id="shop-drawer" type="checkbox" className="drawer-toggle" tabIndex={-1} aria-hidden="true" />

      <div className="drawer-content">
        <div className="navbar bg-white/90 backdrop-blur-sm shadow-sm" role="banner">
          <div className="navbar-start flex items-center gap-2">
            <label htmlFor="shop-drawer" aria-label="obre el menú lateral" className="btn btn-square btn-ghost lg:hidden">
              <HiOutlineBars3 className="shop-tobar-end__icon" aria-hidden="true" />
            </label>
            <Link to="/" className="shop-topbar__logo link link-hover text-primary text-xl font-bold" aria-label="Anar a la pàgina d'inici">
              Serralleria Solidària
            </Link>
            
            {/* Barra de búsqueda - Visible en sm y superior, oculta en mobilexs */}
            <div className="hidden sm:block w-32 md:w-64 lg:w-80 xl:w-96">
              <SearchBar />
            </div>
          </div>

          <nav className="navbar-center hidden lg:flex" aria-label="Navegació principal">
            <ul className="menu menu-horizontal px-1">
              <li><Link to="/" className="shop-topbar__menu-link">Inici</Link></li>
              <li><Link to="/products" className="shop-topbar__menu-link">Productes</Link></li>
              <li><Link to="/packs" className="shop-topbar__menu-link">Packs</Link></li>
              <li><Link to="/categories" className="shop-topbar__menu-link">Categories</Link></li>
              <li><Link to="/custom-solutions" className="shop-topbar__menu-link">Solucions Personalitzades</Link></li>
            </ul>
          </nav>

          <div className="navbar-end flex items-center gap-2">
            {/* Icono de búsqueda para mobile (visible solo en xs) */}
            <Link to="/search" className="btn btn-ghost btn-square sm:hidden" aria-label="Buscar">
              <HiOutlineEye className="shop-tobar-end__icon" aria-hidden="true" />
            </Link>

            <Link to="/cart" className="btn btn-ghost btn-circle" aria-label="Veure el carret de la compra">
              <HiOutlineShoppingCart className="shop-tobar-end__icon" aria-hidden="true" />
            </Link>

            {!user ? (
              <Link to="/login" className="btn btn-primary btn-sm">
                Inicia sessió
              </Link>
            ) : (
              <div className="dropdown dropdown-end">
                <button tabIndex={0} className='shop-tobar-end__dropdown-button btn btn-ghost btn-circle' aria-label="Obrir el menú d'usuari">
                  <HiOutlineUserCircle className="shop-tobar-end__icon" aria-hidden="true" />
                </button>
                <ul tabIndex={-1} className="dropdown-content menu bg-base-100 rounded-box z-50 w-52 p-2 shadow-sm gap-2">
                  {user && (
                    <li><Link to={dashboardUrl} className='btn btn-primary'>Panell d'usuari</Link></li>
                  )}
                  <li className='btn btn-error' onClick={logout} aria-label="Tancar la sessió actual">Tancar sessió</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="drawer-side" aria-label="Menú lateral">
        <label htmlFor="shop-drawer" aria-label="tanca el menú lateral" className="drawer-overlay"></label>
        <ul className="menu min-h-full w-80 bg-base-200 p-4" aria-label="Opcions del menú lateral">
          <li><Link to="/" className="shop-topbar__menu-link">Inici</Link></li>
          <li><Link to="/products" className="shop-topbar__menu-link">Productes</Link></li>
          <li><Link to="/packs" className="shop-topbar__menu-link">Packs</Link></li>
          <li><Link to="/categories" className="shop-topbar__menu-link">Categories</Link></li>
          <li><Link to="/custom-solutions" className="shop-topbar__menu-link">Solucions Personalitzades</Link></li>
          
          {!user ? (
            <li><Link to="/login" className="btn btn-primary mt-4">Inicia sessió</Link></li>
          ) : (
            <>
              {user && (
                <li><Link to={dashboardUrl} className="btn btn-primary mt-4">Panell d'Usuari</Link></li>
              )}
              <li><button onClick={logout} className="btn btn-error mt-2">Tancar sessió</button></li>
            </>
          )}
        </ul>
      </div>
    </div>
  )
}
