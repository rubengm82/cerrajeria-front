import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { HiOutlineShoppingCart, HiOutlineUserCircle, HiOutlineBars3 } from "react-icons/hi2";
import SearchBar from '../SearchBar'
import ProductDetailModal from '../ProductDetailModal'
import { getProduct } from '../../api/products_api'
import { getPack } from '../../api/packs_api'
import { useState } from 'react'


export default function TopBarShop() {
  const { user, logout } = useAuth()
  const dashboardUrl = user?.role === 'admin' || user?.role === 1 ? '/admin/dashboard' : '/dashboard'

  // Estado para el modal de producto global (desde búsqueda)
  const [globalProduct, setGlobalProduct] = useState(null)
  const [isGlobalModalOpen, setIsGlobalModalOpen] = useState(false)
  const [isLoadingGlobal, setIsLoadingGlobal] = useState(false)
  const [globalProductType, setGlobalProductType] = useState(null)

  const handleProductSelect = async (id, type, previewItem = null) => {
    setGlobalProduct(previewItem)
    setGlobalProductType(type)
    setIsLoadingGlobal(true)
    setIsGlobalModalOpen(true)
    try {
      const response = type === 'product' ? await getProduct(id) : await getPack(id)
      // La API devuelve { data: ... } o directamente el objeto
      let productData = response.data
      setGlobalProduct(productData)
    } catch (error) {
      console.error('Error fetching product/pack for modal:', error)
      setGlobalProduct(null)
      setIsGlobalModalOpen(false)
    } finally {
      setIsLoadingGlobal(false)
    }
  }

  const closeGlobalModal = () => {
    setIsGlobalModalOpen(false)
    setGlobalProduct(null)
    setGlobalProductType(null)
  }

  return (
    <div className="drawer">
      <input id="shop-drawer" type="checkbox" className="drawer-toggle" tabIndex={-1} aria-hidden="true" />

      <div className="drawer-content">
        <div className="navbar bg-white/90 backdrop-blur-sm shadow-sm" role="banner">
          <div className="navbar-start flex items-center gap-2">
            <label htmlFor="shop-drawer" aria-label="obre el menú lateral" className="btn btn-square btn-ghost xl:hidden">
              <HiOutlineBars3 className="shop-tobar-end__icon" aria-hidden="true" />
            </label>

             {/* Barra de búsqueda - Siempre visible */}
             <div className="w-55 sm:w-72 md:w-72 lg:w-96">
               <SearchBar onItemSelect={handleProductSelect} />
             </div>
          </div>

          <nav className="navbar-center hidden xl:flex" aria-label="Navegació principal">

            <ul className="menu menu-horizontal px-1">
              <li><Link to="/" className="shop-topbar__menu-link">Inici</Link></li>
              <li><Link to="/products" className="shop-topbar__menu-link">Productes</Link></li>
              <li><Link to="/packs" className="shop-topbar__menu-link">Packs</Link></li>
              <li><Link to="/categories" className="shop-topbar__menu-link">Categories</Link></li>
              <li><Link to="/custom-solutions" className="shop-topbar__menu-link">Solucions Personalitzades</Link></li>
            </ul>
          </nav>

          <div className="navbar-end flex items-center gap-2">
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

      {/* Modal global de detalle de producto (desde búsqueda) */}
      <ProductDetailModal
        key={globalProduct?.id || 'no-global-product'}
        product={globalProduct}
        isOpen={isGlobalModalOpen}
        onClose={closeGlobalModal}
        entityType={globalProductType}
        isLoading={isLoadingGlobal}
      />
    </div>
  )
}
