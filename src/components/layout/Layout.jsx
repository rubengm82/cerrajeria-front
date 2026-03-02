import { Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Topbar from './Topbar'
import Sidebar from './Sidebar'

export default function Layout() {
  const { user } = useAuth()
  
  return (
    <div className="drawer lg:drawer-open">
      <input id="drawer" type="checkbox" className="drawer-toggle" />
      
      <div className="drawer-content flex flex-col">
        {/* Topbar - siempre visible */}
        <Topbar />
        
        {/* Contenido principal */}
        <div className="p-4 min-h-screen bg-base-200">
          <Outlet />
        </div>
      </div>
      
      {/* Sidebar - Drawer de DaisyUI */}
      <div className="drawer-side">
        <label htmlFor="drawer" className="drawer-overlay"></label>
        <Sidebar userRole={user?.role} />
      </div>
    </div>
  )
}
