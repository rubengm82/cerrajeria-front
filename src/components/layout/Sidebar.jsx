import { Link, useLocation } from 'react-router-dom'

export default function Sidebar({ userRole }) {
  const location = useLocation()
  const isAdmin = userRole === 'admin' || userRole === 1

  // Links comuns per a tots els usuaris
  const commonLinks = [
    { to: '/dashboard', label: '🏠 Dashboard', icon: 'home' },
    { to: '/perfil', label: '👤 El Meu Perfil', icon: 'user' },
    { to: '/services', label: '🔧 Serveis', icon: 'wrench' },
  ]

  // Links específics per a administradors
  const adminLinks = [
    { to: '/users', label: '👥 Gestió d\'Usuaris', icon: 'users' },
    { to: '/products', label: '📦 Productes', icon: 'package' },
    { to: '/orders', label: '📋 Comandes', icon: 'clipboard' },
    { to: '/categories', label: '🏷️ Categories', icon: 'tag' },
    { to: '/reports', label: '📊 Informes', icon: 'chart' },
    { to: '/settings', label: '⚙️ Configuració', icon: 'cog' },
  ]

  // Links específics per a usuaris normals
  const userLinks = [
    { to: '/my-orders', label: '📋 Les Meves Comandes', icon: 'clipboard' },
    { to: '/my-services', label: '🔧 Els Meus Serveis', icon: 'wrench' },
  ]

  // Combinar links segons el rol
  const links = isAdmin
    ? [...commonLinks, ...adminLinks]
    : [...commonLinks, ...userLinks]

  const isActive = (path) => location.pathname === path

  return (
    <ul className="menu p-4 w-80 min-h-full bg-base-100 text-base-content">
      {/* Títul del menú */}
      <li className="menu-title">
        <span className="text-primary font-bold">
          {isAdmin ? '🛠️ Panell d\'Administració' : '👤 La Meva Àrea'}
        </span>
      </li>

      {/* Links de navegació */}
      {links.map((link) => (
        <li key={link.to}>
          <Link
            to={link.to}
            className={isActive(link.to) ? 'bg-primary text-primary-content text-base p-2' : 'text-base-400 p-2 text-base'}
          >
            {link.label}
          </Link>
        </li>
      ))}

    </ul>
  )
}
