import { Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import TopBarDashBoard from './TopBarDashBoard'
import SideBarDashboard from './SideBarDashboard'
import LoadingAnimation from '../LoadingAnimation'

export default function LayoutDashboard() {
  const { user, loading } = useAuth()

  // Mostrar pantalla de carga mientras se verifica el usuario
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingAnimation />
      </div>
    )
  }

  return (
    <div className="drawer lg:drawer-open">
      <input id="drawer" type="checkbox" className="drawer-toggle" aria-label="Obrir o tancar el menú lateral" />

      <div className="drawer-content flex flex-col">
        {/* Topbar - siempre visible */}
        <div className="sticky top-0 z-50 bg-base-100/80 backdrop-blur shadow-sm">
          <TopBarDashBoard />
        </div>

        {/* Contenido principal */}
        <div className="px-8 py-6 min-h-screen bg-base-200">
          <Outlet />
        </div>
      </div>

      {/* Sidebar - Drawer de DaisyUI */}
      <div className="drawer-side shadow-2xl">
        <label htmlFor="drawer" className="drawer-overlay" aria-label="Tancar el menú lateral"></label>
        <SideBarDashboard userRole={user?.role} />
      </div>
    </div>
  )
}
