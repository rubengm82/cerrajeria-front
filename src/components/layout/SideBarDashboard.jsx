import { Link, useLocation } from 'react-router-dom'
import React from 'react'
import { HiOutlineHome, HiOutlineSquares2X2, HiOutlineUser, HiOutlineShoppingCart, HiOutlineUserGroup, HiOutlineChartPie, HiOutlineCube, HiOutlineShoppingBag, HiOutlineTag, HiOutlineClipboardDocumentList, HiOutlineWrenchScrewdriver, HiOutlineViewColumns, HiOutlineSwatch } from 'react-icons/hi2'

export default function SideBarDashboard({ userRole }) {
  const location = useLocation()
  const isAdmin = userRole === 'admin' || userRole === 1

  // Links comuns per a tots els usuaris (sense "Tornar a la botiga")
  const commonLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: (
      <HiOutlineSquares2X2 className="size-6 text-white dark:text-black" />
    ) },
    { to: '/perfil', label: 'El Meu Perfil', icon: (
      <HiOutlineUser className="size-6 text-white dark:text-black" />
    ) },
    { to: '/services', label: 'Serveis', icon: (
      <HiOutlineWrenchScrewdriver className="size-6 text-white dark:text-black" />
    ) },
  ]

  // Links específics per a administradors (ordenats alfabèticament)
  const adminLinks = [
    // Productes - Grup principal
    { to: '/admin/products', label: 'Veure Productes', parent: 'Productes', icon: (
      <HiOutlineShoppingBag className="size-6 text-white dark:text-black" />
    ) },
    // Categories - anidat dins Productes
    { to: '/admin/categories', label: 'Categories', parent: 'Productes', icon: (
      <HiOutlineTag className="size-6 text-white dark:text-black" />
    ) },
    // Tipus de Característiques - anidat dins Productes
    { to: '/admin/feature-types', label: 'Característiques - Tipus', parent: 'Productes', icon: (
      <HiOutlineSwatch className="size-6 text-white dark:text-black" />
    ) },
    // Característiques - anidat dins Productes
    { to: '/admin/features', label: 'Característiques - Valors', parent: 'Productes', icon: (
      <HiOutlineViewColumns className="size-6 text-white dark:text-black" />
    ) },
    // Packs - anidat dins Productes
    { to: '/admin/packs', label: 'Packs de Productes', parent: 'Productes', icon: (
      <HiOutlineCube className="size-6 text-white dark:text-black" />
    ) },
    // Comandes
    { to: '/orders', label: 'Comandes', icon: (
      <HiOutlineShoppingCart className="size-6 text-white dark:text-black" />
    ) },
    // Gestió d'Usuaris
    { to: '/users', label: "Gestió d'Usuaris", icon: (
      <HiOutlineUserGroup className="size-6 text-white dark:text-black" />
    ) },
    // Informes
    { to: '/reports', label: 'Informes', icon: (
      <HiOutlineChartPie className="size-6 text-white dark:text-black" />
    ) },
  ]

  // Links específics per a usuaris normals
  const userLinks = [
    { to: '/my-orders', label: 'Les Meves Comandes', icon: (
      <HiOutlineClipboardDocumentList className="size-6 text-white dark:text-black" />
    ) },
    { to: '/my-services', label: 'Els Meus Serveis', icon: (
      <HiOutlineWrenchScrewdriver className="size-6 text-white dark:text-black" />
    ) },
  ]

  // Combinar links segons el rol
  const links = isAdmin
    ? [...commonLinks, ...adminLinks]
    : [...commonLinks, ...userLinks]

  // Obtenir els pares (menús nidificats)
  const parentMenus = [...new Set(links.filter(l => l.parent).map(l => l.parent))]

  const isActive = (path) => location.pathname === path

  return (
    <ul className="menu bg-base-200 rounded-box w-70 min-h-full text-base-content">
      {/* Espaciador para evitar que el topbar se superponga al abrir el menú */}
      <div className="h-16 w-full"></div>

      {/* Títul del menú */}
      <li className="menu-title">
        <span className="text-primary text-lg font-bold">
          {isAdmin ? 'Panell d\'Administració' : 'La Meva Àrea'}
        </span>
      </li>

      {/* Links principals (sense pare) */}
      {links.filter(l => !l.parent).map((link) => (
        <li key={link.to}>
          <Link
            to={link.to}
            className={`${isActive(link.to) ? 'bg-primary text-primary-content' : 'hover:bg-orange-100 dark:hover:bg-amber-600/30'} active:bg-base-300 active:text-base-content py-2`}
          >
            {React.cloneElement(link.icon, { className: link.icon.props.className.replace('text-white dark:text-black', isActive(link.to) ? 'text-primary-content' : 'text-white dark:text-black') })}
            {link.label}
          </Link>
        </li>
      ))}

      {/* Menús nidificats */}
      {parentMenus.map((parent) => (
        <li key={parent}>
          <details open>
            <summary className="active:bg-base-300 active:text-base-content">{parent}</summary>
            <ul>
              {links.filter(l => l.parent === parent).map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className={`${isActive(link.to) ? 'bg-primary text-primary-content' : 'hover:bg-orange-100 dark:hover:bg-amber-600/30'} active:bg-base-300 active:text-base-content py-2`}
                  >
                    {React.cloneElement(link.icon, { className: link.icon.props.className.replace('text-white dark:text-black', isActive(link.to) ? 'text-primary-content' : 'text-white dark:text-black') })}
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        </li>
      ))}

      {/* Botó "Tornar a la botiga" amb color primary */}
      <li className="mt-auto">
        <Link
          to="/"
          className="btn btn-primary btn-outline py-2"
        >
          <HiOutlineHome className="size-6" />
          Tornar a la botiga
        </Link>
      </li>
    </ul>
  )
}
