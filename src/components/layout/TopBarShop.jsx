import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { HiOutlineShoppingCart, HiOutlineUserCircle, HiOutlineBars3, HiOutlineMagnifyingGlass, HiXMark } from "react-icons/hi2";
import SearchBar from '../SearchBar'
import ProductDetailModal from '../ProductDetailModal'
import { getProduct } from '../../api/products_api'
import { getPack } from '../../api/packs_api'
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getCartOrder } from '../../api/orders_api'
import { getLocalCartItems } from '../../utils/localCart'


export default function TopBarShop() {
  const { user, logout } = useAuth()
  const dashboardUrl = user?.role === 'admin' || user?.role === 1 ? '/orders' : '/my-orders'

  // Estado para el modal de producto global (desde búsqueda)
  const [globalProduct, setGlobalProduct] = useState(null)
  const [isGlobalModalOpen, setIsGlobalModalOpen] = useState(false)
  const [isLoadingGlobal, setIsLoadingGlobal] = useState(false)
  const [globalProductType, setGlobalProductType] = useState(null)
  const [localCartVersion, setLocalCartVersion] = useState(0)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isSearchVisible, setIsSearchVisible] = useState(false)
  const [isSearchClosing, setIsSearchClosing] = useState(false)

  // Query para obtener el carrito del usuario autenticado
  const { data: cartOrder } = useQuery({
    queryKey: ['cart-order'],
    queryFn: async () => {
      const response = await getCartOrder()
      return response.data
    },
    enabled: Boolean(user),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    retry: 1,
  })

  // Escuchar cambios en localStorage para actualizar el carrito invitado
  useEffect(() => {
    const handleCartChange = (e) => {
      if (e.type === 'guestCartChanged' || e.key === 'guestCart') {
        setLocalCartVersion(v => v + 1)
      }
    }
    window.addEventListener('storage', handleCartChange)
    window.addEventListener('guestCartChanged', handleCartChange)
    return () => {
      window.removeEventListener('storage', handleCartChange)
      window.removeEventListener('guestCartChanged', handleCartChange)
    }
  }, [])

  useEffect(() => {
    if (!isSearchOpen) {
      return undefined
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsSearchOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isSearchOpen])

  useEffect(() => {
    if (!isSearchOpen || isSearchClosing) {
      return undefined
    }

    const animationFrame = window.requestAnimationFrame(() => {
      setIsSearchVisible(true)
    })

    return () => window.cancelAnimationFrame(animationFrame)
  }, [isSearchOpen, isSearchClosing])

  useEffect(() => {
    if (!isSearchClosing) {
      return undefined
    }

    const closeTimeout = window.setTimeout(() => {
      setIsSearchClosing(false)
      setIsSearchVisible(false)
      setIsSearchOpen(false)
    }, 260)

    return () => window.clearTimeout(closeTimeout)
  }, [isSearchClosing])

  // Calcular el total de items en el carrito
  const getCartItems = () => {
    if (user) {
      return [
        ...(cartOrder?.products || []).map(p => ({ ...p, cartItemType: 'product' })),
        ...(cartOrder?.packs || []).map(p => ({ ...p, cartItemType: 'pack' })),
      ]
    }
    return getLocalCartItems(localCartVersion)
  }

  const cartItems = getCartItems()
  const cartItemCount = cartItems.reduce((total, item) => total + Number(item?.pivot?.quantity || 0), 0)

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

  const openSearch = () => {
    setIsSearchClosing(false)
    setIsSearchVisible(false)
    setIsSearchOpen(true)
  }

  const closeSearch = () => {
    setIsSearchVisible(false)
    setIsSearchClosing(true)
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

          </div>

           <nav className="navbar-center hidden xl:flex" aria-label="Navegació principal">

             <ul className="menu menu-horizontal px-1">
               <li><Link to="/" className="shop-topbar__menu-link">Inici</Link></li>
               <li><Link to="/products" className="shop-topbar__menu-link">Productes</Link></li>
               <li><Link to="/packs" className="shop-topbar__menu-link">Packs</Link></li>
               <li><Link to="/categories" className="shop-topbar__menu-link">Categories</Link></li>
               <li><Link to="/custom-solutions" className="shop-topbar__menu-link">Solucions Personalitzades</Link></li>
               <li><Link to="/faqs" className="shop-topbar__menu-link">FAQs</Link></li>
             </ul>
           </nav>

          <div className="navbar-end flex items-center gap-2">
            <button
              type="button"
              className="btn btn-ghost btn-circle"
              aria-label="Obrir la cerca"
              onClick={openSearch}
            >
              <HiOutlineMagnifyingGlass className="shop-tobar-end__icon" aria-hidden="true" />
            </button>

            {(user?.role !== 'admin' && user?.role !== 1) && (
              <div className="relative group">
                {cartItemCount > 0 && (
                  <span
                    className="absolute top-1 right-0 badge badge-primary w-3 h-3 min-w-0 p-0 z-10 transition-transform duration-150 ease-in-out group-hover:-translate-y-0.5"
                    aria-label={`${cartItemCount} productes al carret`}
                  ></span>
                )}
                <Link to="/cart" className="btn btn-ghost btn-circle" aria-label="Veure el carret de la compra">
                  <HiOutlineShoppingCart className="shop-tobar-end__icon" aria-hidden="true" />
                </Link>
              </div>
            )}

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
          <li><Link to="/faqs" className="shop-topbar__menu-link">FAQs</Link></li>

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

      {isSearchOpen && (
        <div
          className={`shop-search-modal ${
            isSearchClosing
              ? 'shop-search-modal--closing'
              : isSearchVisible
                ? 'shop-search-modal--open'
                : ''
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Cercador de productes"
          onClick={closeSearch}
        >
          <div className="shop-search-modal__backdrop" aria-hidden="true" />
          <div className="shop-search-modal__panel" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="btn btn-circle btn-ghost shop-search-modal__close"
              aria-label="Tancar la cerca"
              onClick={closeSearch}
            >
              <HiXMark className="size-6" aria-hidden="true" />
            </button>

            <div className="shop-search-modal__content">
              <SearchBar
                onItemSelect={handleProductSelect}
                autoFocus
                onActionComplete={closeSearch}
              />
            </div>
          </div>
        </div>
      )}

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
