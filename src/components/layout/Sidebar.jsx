import { Link, useLocation } from 'react-router-dom'
import React from 'react'
import { HiHome, HiChartBar, HiUser, HiCog, HiShoppingCart, HiUserGroup, HiChartPie, HiCube, HiShoppingBag, HiTag, HiClipboardDocumentList, HiWrenchScrewdriver, HiFolder, HiBeaker, HiRectangleGroup } from 'react-icons/hi2'

export default function Sidebar({ userRole }) {
  const location = useLocation()
  const isAdmin = userRole === 'admin' || userRole === 1

  // Links comuns per a tots els usuaris
  const commonLinks = [
    { to: '/', label: 'Tornar a la botiga', icon: (
      <HiHome className="size-6 text-primary" />
    ) },
    { to: '/admin/dashboard', label: 'Dashboard', icon: (
      <HiChartBar className="size-6 text-primary" />
    ) },
    { to: '/perfil', label: 'El Meu Perfil', icon: (
      <HiUser className="size-6 text-primary" />
    ) },
    { to: '/services', label: 'Serveis', icon: (
      <HiWrenchScrewdriver className="size-6 text-primary" />
    ) },
  ]

  // Links específics per a administradors (ordenats alfabèticament)
  const adminLinks = [
    { to: '/admin/categories', label: 'Categories', parent: 'Configuració de Productes', icon: (
      <HiFolder className="size-6 text-primary" />
    ) },
    // Característiques - anidat dins Configuració de Productes
    { to: '/admin/features', label: 'Característiques', parent: 'Configuració de Productes', icon: (
      <HiBeaker className="size-6 text-primary" />
    ) },
    // Comandes
    { to: '/orders', label: 'Comandes', icon: (
      <HiShoppingCart className="size-6 text-primary" />
    ) },
    // Configuració
    { to: '/settings', label: 'Configuració', icon: (
      <HiCog className="size-6 text-primary" />
    ) },
    // Gestió d'Usuaris
    { to: '/users', label: "Gestió d'Usuaris", icon: (
      <HiUserGroup className="size-6 text-primary" />
    ) },
    // Informes
    { to: '/reports', label: 'Informes', icon: (
      <HiChartPie className="size-6 text-primary" />
    ) },
    // Packs
    { to: '/admin/packs', label: 'Packs', icon: (
      <HiCube className="size-6 text-primary" />
    ) },
    // Productes
    { to: '/admin/products', label: 'Productes', icon: (
      <HiShoppingBag className="size-6 text-primary" />
    ) },
    // Tipus de Característiques - anidat dins Configuració de Productes
    { to: '/admin/feature-types', label: 'Tipus de Característiques', parent: 'Configuració de Productes', icon: (
      <HiRectangleGroup className="size-6 text-primary" />
    ) },
  ]

  // Links específics per a usuaris normals
  const userLinks = [
    { to: '/my-orders', label: 'Les Meves Comandes', icon: (
      <HiClipboardDocumentList className="size-6 text-primary" />
    ) },
    { to: '/my-services', label: 'Els Meus Serveis', icon: (
      <HiWrenchScrewdriver className="size-6 text-primary" />
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
    <ul className="menu bg-base-200 rounded-box w-80 min-h-full text-base-content">
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
            className={`${isActive(link.to) ? 'bg-primary text-primary-content' : ''} active:bg-base-300 active:text-base-content`}
          >
            {React.cloneElement(link.icon, { className: link.icon.props.className.replace('text-primary', isActive(link.to) ? 'text-primary-content' : 'text-primary') })}
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
                    className={`${isActive(link.to) ? 'bg-primary text-primary-content' : ''} active:bg-base-300 active:text-base-content`}
                  >
                    {React.cloneElement(link.icon, { className: link.icon.props.className.replace('text-primary', isActive(link.to) ? 'text-primary-content' : 'text-primary') })}
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        </li>
      ))}
    </ul>
  )
}
