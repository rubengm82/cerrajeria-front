import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { HiOutlineShoppingCart, HiOutlineUserCircle } from "react-icons/hi2";

export default function TopBarShop() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
<div className="navbar bg-base-100 shadow-sm">
  <div className="navbar-start">
    <div className="dropdown">
      <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" /> </svg>
      </div>
      <ul
        tabIndex="-1"
        className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
        <li><a>Item 1</a></li>
        <li>
          <a>Parent</a>
          <ul className="p-2">
            <li><a>Submenu 1</a></li>
            <li><a>Submenu 2</a></li>
          </ul>
        </li>
        <li><a>Item 3</a></li>
      </ul>
    </div>
    <a className="btn btn-ghost text-xl">Logo</a>
  </div>
  <div className="navbar-center hidden lg:flex shop-topbar">
    <ul className="menu menu-horizontal px-1 shop-topbar__menu">
      <li>
        <Link to={"/"}>Inici</Link>
      </li>
      <li>
        <details>
          <summary>Productos</summary>
          <ul className="p-2 bg-base-100 w-40 z-1">
            <li><a>Submenu 1</a></li>
            <li><a>Submenu 2</a></li>
          </ul>
        </details>
      </li>
      <li><a>Categorias</a></li>
    </ul>
  </div>
  <div className="navbar-end shop-tobar-end">
    <Link to={"/#Carrito"}>
      <HiOutlineUserCircle className='shop-tobar-end__icon'/>
    </Link>
    <Link to={"/#Carrito"}>
      <HiOutlineShoppingCart />
    </Link>
  </div>
</div>
  )
}
